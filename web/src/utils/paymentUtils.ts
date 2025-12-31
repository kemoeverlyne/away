import { Loan, LoanStatus } from '../types/loan';

export const getPaymentStatusInfo = (p: any, loans: Loan[]) => {
    let status = p.status;
    
    // if status is missing or "UNPAID" but we have a date, calculate it
    if ((!status || status === 'Unpaid' || status === 'UNPAID') && p.paymentDate) {
        const loan = loans.find(l => l.id === p.loanId);
        if (loan) {
            const payDate = new Date(p.paymentDate);
            payDate.setHours(0, 0, 0, 0);
            const dueDate = new Date(loan.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((payDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 5) status = LoanStatus.OnTime; // 5-day grace period
            else if (diffDays <= 30) status = LoanStatus.Late;
            else status = LoanStatus.Defaulted;
        }
    }

    // Handle GraphQL Enum names (all caps) vs strings
    const s = String(status).toUpperCase();
    if (s === 'ONTIME' || s === 'ON_TIME' || s === 'OnTime') return { label: 'On Time', class: 'badge-green' };
    if (s === 'LATE') return { label: 'Late', class: 'badge-orange' };
    if (s === 'DEFAULTED') return { label: 'Defaulted', class: 'badge-red' };
    return { label: 'Unpaid', class: 'badge-gray' };
};

