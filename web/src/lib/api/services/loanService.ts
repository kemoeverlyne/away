import { ApolloClient, gql } from '@apollo/client';
import { Loan, LoanStatus, Payment } from '../../../types/loan';

const GET_LOANS = gql`
  query GetLoans {
    loans {
      id
      name
      principal
      interestRate
      startDate
      dueDate
      status
      payments {
        id
        amount
        date
        status
      }
    }
  }
`;

const ADD_PAYMENT = gql`
  mutation AddPayment($loanId: ID!, $amount: Float!, $date: String!) {
    addPayment(loanId: $loanId, amount: $amount, date: $date) {
      id
      amount
      date
      status
    }
  }
`;

export class LoanService {
  constructor(private client: ApolloClient<any>) {}

  async getLoans(): Promise<Loan[]> {
    try {
      const { data } = await this.client.query({
        query: GET_LOANS,
        fetchPolicy: 'network-only',
      });
      return data.loans;
    } catch (error) {
      console.error('Error fetching loans:', error);
      throw new Error('Failed to fetch loans');
    }
  }

  async addPayment(loanId: string, amount: number, date: string): Promise<Payment> {
    try {
      const { data } = await this.client.mutate({
        mutation: ADD_PAYMENT,
        variables: { loanId, amount, date },
      });
      return data.addPayment;
    } catch (error) {
      console.error('Error adding payment:', error);
      throw new Error('Failed to add payment');
    }
  }

  calculateLoanStatus(loan: Loan): LoanStatus {
    const now = new Date();
    const dueDate = new Date(loan.dueDate);
    const daysLate = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLate > 30) return LoanStatus.Defaulted;
    if (daysLate > 0) return LoanStatus.Late;
    return LoanStatus.OnTime;
  }

  calculateTotalPaid(payments: Payment[]): number {
    return payments.reduce((total, payment) => total + payment.amount, 0);
  }

  calculateTotalInterest(loan: Loan): number {
    const principal = loan.principal;
    const interestRate = loan.interestRate / 100;
    const startDate = new Date(loan.startDate);
    const dueDate = new Date(loan.dueDate);
    const days = Math.floor((dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const years = days / 365;

    return principal * interestRate * years;
  }
} 