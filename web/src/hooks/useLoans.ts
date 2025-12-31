import { useState, useCallback, useEffect } from 'react';
import { loanService } from '../lib/api/loans';
import { Loan, LoanStatus } from '../types/loan';
import { useDebounce } from './useDebounce';

interface UseLoansOptions {
  initialStatus?: LoanStatus;
  initialSearch?: string;
}

interface UseLoansReturn {
  loans: Loan[];
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedStatus: LoanStatus | undefined;
  setSelectedStatus: (status: LoanStatus | undefined) => void;
  updateLoanStatus: (id: string, status: LoanStatus) => Promise<void>;
  refetchLoans: () => Promise<void>;
}

export const useLoans = ({ 
  initialStatus, 
  initialSearch = '' 
}: UseLoansOptions = {}): UseLoansReturn => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedStatus, setSelectedStatus] = useState<LoanStatus | undefined>(initialStatus);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const fetchLoans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await loanService.getLoans();
      setLoans(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch loans'));
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, debouncedSearch]);

  

  const updateLoanStatus = useCallback(async (id: string, status: LoanStatus) => {
    try {
      await loanService.updateLoanStatus(id, status);
      await fetchLoans();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update loan status');
    }
  }, [fetchLoans]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  return {
    loans,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    updateLoanStatus,
    refetchLoans: fetchLoans,
  };
}; 