export enum LoanStatus {
    OnTime = 'OnTime',    // GREEN - for payments within 5 days of due date
    Late = 'Late',         // ORANGE - for payments 6-30 days after due date
    Defaulted = 'Defaulted', // RED - for payments more than 30 days late
    Unpaid = 'Unpaid'      // GREY - for cases with no payment date
}

export interface Payment {
    id: number;
    loanId: number;
    paymentDate: string;
    status: LoanStatus;
    amount: number;
}

export interface Loan {
    id: number;
    name: string;
    principal: number;
    interestRate: number;
    dueDate: string;
    startDate: string;
    payments: Payment[];
}



export interface LoanFilter {
    status?: LoanStatus;
    search?: string;
    startDate?: string;
    endDate?: string;
}

export interface LoanStats {
    totalLoans: number;
    activeLoans: number;
    totalAmount: number;
    collectedAmount: number;
    defaultRate: number;
}

export interface LoanData {
    loans: Loan[];
} 