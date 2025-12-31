import { gql } from '@apollo/client';
import { apolloClient } from './apollo';
import { Loan, LoanStatus, Payment } from '../../types/loan';
export const LOANS_QUERY = gql`
  query GetLoans {
    loans {
      id
      name
      interestRate
      principal
      dueDate
      payments {
        id
        loanId
        paymentDate
        status
        amount
      }
    }
  }
`;

export const UPDATE_LOAN_STATUS_MUTATION = gql`
  mutation UpdateLoanStatus($id: ID!, $status: LoanStatus!) {
    updateLoanStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const ADD_PAYMENT_MUTATION = gql`
  mutation AddPayment($loanId: Int!, $paymentDate: String!, $amount: Int!) {
    addPayment(loanId: $loanId, paymentDate: $paymentDate, amount: $amount) {
      payment {
        id
        loanId
        paymentDate
        status
        amount
      }
      success
      message
    }
  }
`;

export const CREATE_LOAN_MUTATION = gql`
  mutation CreateLoan($name: String!, $interestRate: Float!, $principal: Int!, $dueDate: Date!) {
    createLoan(name: $name, interestRate: $interestRate, principal: $principal, dueDate: $dueDate) {
      loan {
        id
        name
        interestRate
        principal
        dueDate
      }
      success
      message
    }
  }
`;

export const loanService = {
  async getLoans(): Promise<Loan[]> {
    try {
      const { data } = await apolloClient.query({
        query: LOANS_QUERY,
        fetchPolicy: 'network-only'
      });
      return data.loans;
    } catch (error) {
      console.error('Error fetching loans:', error);
      throw error;
    }
  },

  async updateLoanStatus(id: string, status: LoanStatus): Promise<Loan> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_LOAN_STATUS_MUTATION,
        variables: { id, status },
      });
      return data.updateLoanStatus;
    } catch (error) {
      console.error('Error updating loan status:', error);
      throw error;
    }
  },

  async addPayment(loanId: number, paymentDate: string, amount: number): Promise<{ payment: Payment; success: boolean; message: string }> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: ADD_PAYMENT_MUTATION,
        variables: { loanId, paymentDate, amount },
      });
      return data.addPayment;
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  },

  async createLoan(name: string, interestRate: number | string, principal: number | string, dueDate: string): Promise<{ loan: Loan; success: boolean; message: string }> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_LOAN_MUTATION,
        variables: { 
          name,
          interestRate: typeof interestRate === 'string' ? parseFloat(interestRate) : interestRate,
          principal: typeof principal === 'string' ? parseInt(principal, 10) : principal,
          dueDate 
        },
      });
      return data.createLoan;
    } catch (error) {
      console.error('Error creating loan:', error);
      throw error;
    }
  },
}; 