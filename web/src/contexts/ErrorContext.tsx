import  { createContext, useContext, useState, ReactNode } from 'react';
import '../styles/ErrorContext.css';

interface ErrorContextType {
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
  showError: (message: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider = ({ children }: ErrorProviderProps) => {
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);
  const showError = (message: string) => setError(message);

  return (
    <ErrorContext.Provider value={{ error, setError, clearError, showError }}>
      {children}
      {error && (
        <div className="error-snackbar">
          <div className="error-alert">
            <span>{error}</span>
            <button onClick={clearError} className="error-close-button">
              ×
            </button>
          </div>
        </div>
      )}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};
