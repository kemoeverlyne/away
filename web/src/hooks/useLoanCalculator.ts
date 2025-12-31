import { useState, useEffect, useCallback } from 'react';

interface LoanCalculatorValues {
    amount: number;
    rate: number;
    term: number;
}

interface UseLoanCalculatorReturn {
    loanAmount: number;
    interestRate: number;
    loanTerm: number;
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
    isCalculating: boolean;
    setLoanAmount: (amount: number) => void;
    setInterestRate: (rate: number) => void;
    setLoanTerm: (term: number) => void;
    resetCalculator: () => void;
}

export const useLoanCalculator = (
    initialValues: LoanCalculatorValues
): UseLoanCalculatorReturn => {
    const [loanAmount, setLoanAmount] = useState<number>(initialValues.amount);
    const [interestRate, setInterestRate] = useState<number>(initialValues.rate);
    const [loanTerm, setLoanTerm] = useState<number>(initialValues.term);
    const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
    const [totalPayment, setTotalPayment] = useState<number>(0);
    const [totalInterest, setTotalInterest] = useState<number>(0);
    const [isCalculating] = useState<boolean>(false);

    const calculateLoan = useCallback(() => {
        const principal = loanAmount;
        const monthlyRate = (interestRate / 100) / 12;
        const numberOfPayments = loanTerm;

        if (monthlyRate === 0) {
            const monthlyPmt = principal / numberOfPayments;
            setMonthlyPayment(monthlyPmt || 0);
            setTotalPayment(principal || 0);
            setTotalInterest(0);
            return;
        }

        // Calculate monthly payment using the loan amortization formula
        const monthlyPmt = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) 
                        / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

        const totalPmt = monthlyPmt * numberOfPayments;
        const totalInt = totalPmt - principal;

        setMonthlyPayment(isNaN(monthlyPmt) || !isFinite(monthlyPmt) ? 0 : monthlyPmt);
        setTotalPayment(isNaN(totalPmt) || !isFinite(totalPmt) ? 0 : totalPmt);
        setTotalInterest(isNaN(totalInt) || !isFinite(totalInt) ? 0 : totalInt);
    }, [loanAmount, interestRate, loanTerm]);

    useEffect(() => {
        calculateLoan();
    }, [calculateLoan]);

    const resetCalculator = useCallback(() => {
        setLoanAmount(initialValues.amount);
        setInterestRate(initialValues.rate);
        setLoanTerm(initialValues.term);
    }, [initialValues]);

    return {
        loanAmount,
        interestRate,
        loanTerm,
        monthlyPayment,
        totalPayment,
        totalInterest,
        isCalculating,
        setLoanAmount,
        setInterestRate,
        setLoanTerm,
        resetCalculator
    };
}; 