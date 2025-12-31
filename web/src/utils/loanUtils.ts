import { Loan } from '../types/loan';

export const calculateLoanStatus = (loan: Loan): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(loan.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    const totalPaid = loan.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const totalExpected = loan.principal + (loan.principal * (loan.interestRate / 100));

    // 1. If the loan is fully paid, the status is determined by the final completion date
    if (totalPaid >= totalExpected && loan.payments && loan.payments.length > 0) {
        const sortedPayments = [...loan.payments].sort((a, b) => 
            new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
        );
        const completionDate = new Date(sortedPayments[0].paymentDate);
        completionDate.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((completionDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays > 30) return 'Defaulted';
        if (diffDays > 5) return 'Late';
        return 'OnTime';
    }

    // 2. For active loans, use the difference in days between TODAY and the DUE DATE
    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 30) return 'Defaulted';
    if (diffDays > 5) return 'Late';
    
    // Within 5-day grace period: distinguish if anything has been paid yet
    return (loan.payments && loan.payments.length > 0) ? 'OnTime' : 'Unpaid';
};

