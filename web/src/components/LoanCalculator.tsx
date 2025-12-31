import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoanCalculator } from '../hooks/useLoanCalculator';
import '../styles/LoanCalculator.css';

interface LoanCalculatorProps {
    isOpen: boolean;
    onClose: () => void;
    onCalculate?: (values: LoanCalculationResult) => void;
    initialValues?: {
        amount: number;
        rate: number;
        term: number;
    };
}

interface LoanCalculationResult {
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
    interestRate: number;
}

export const LoanCalculator = ({ 
    isOpen, 
    onClose,
    onCalculate,
    initialValues = { amount: 1000, rate: 10, term: 12 }
}: LoanCalculatorProps) => {
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const {
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
    } = useLoanCalculator(initialValues);

    const validateInput = (value: number, field: string): string => {
        if (isNaN(value) || value <= 0) {
            return `Please enter a valid ${field}`;
        }
        if (field === 'loan term' && value < 1) {
            return 'Loan term must be at least 1 month';
        }
        if (field === 'interest rate' && value > 100) {
            return 'Interest rate cannot exceed 100%';
        }
        return '';
    };

    const handleInputChange = (
        value: number,
        setter: (val: number) => void,
        field: string
    ) => {
        const error = validateInput(value, field);
        setErrors(prev => ({
            ...prev,
            [field]: error
        }));
        if (!error) {
            setter(value);
        }
    };

    const handleCalculate = () => {
        const result: LoanCalculationResult = {
            monthlyPayment,
            totalPayment,
            totalInterest,
            interestRate
        };
        onCalculate?.(result);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                className="calculator-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div 
                    className="calculator-modal"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", damping: 20 }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="calculator-header">
                        <h2 className="calculator-title">Loan Calculator</h2>
                        <button className="close-button" onClick={onClose}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="calculator-content">
                        <form className="calculator-form" onSubmit={e => e.preventDefault()}>
                            <div className="form-group">
                                <label className="form-label">
                                    Loan Amount (KES)
                                    {errors['loan amount'] && (
                                        <span className="error-text">{errors['loan amount']}</span>
                                    )}
                                </label>
                                <input
                                    type="number"
                                    className={`form-input ${errors['loan amount'] ? 'error' : ''}`}
                                    value={loanAmount}
                                    onChange={e => handleInputChange(
                                        Number(e.target.value),
                                        setLoanAmount,
                                        'loan amount'
                                    )}
                                    min="0"
                                    placeholder="Enter loan amount"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">
                                    Annual Interest Rate (%)
                                    {errors['interest rate'] && (
                                        <span className="error-text">{errors['interest rate']}</span>
                                    )}
                                </label>
                                <input
                                    type="number"
                                    className={`form-input ${errors['interest rate'] ? 'error' : ''}`}
                                    value={interestRate}
                                    onChange={e => handleInputChange(
                                        Number(e.target.value),
                                        setInterestRate,
                                        'interest rate'
                                    )}
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    placeholder="Enter interest rate"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">
                                    Loan Term (months)
                                    {errors['loan term'] && (
                                        <span className="error-text">{errors['loan term']}</span>
                                    )}
                                </label>
                                <input
                                    type="number"
                                    className={`form-input ${errors['loan term'] ? 'error' : ''}`}
                                    value={loanTerm}
                                    onChange={e => handleInputChange(
                                        Number(e.target.value),
                                        setLoanTerm,
                                        'loan term'
                                    )}
                                    min="1"
                                    placeholder="Enter loan term"
                                />
                            </div>

                            <motion.div 
                                className="calculator-results"
                                initial={false}
                                animate={isCalculating ? { opacity: 0.5 } : { opacity: 1 }}
                            >
                                <div className="result-group">
                                    <motion.div 
                                        className="result-item"
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <div className="result-label">Monthly Payment</div>
                                        <div className="result-value">
                                            KES {monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </div>
                                    </motion.div>
                                    <motion.div 
                                        className="result-item"
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <div className="result-label">Total Payment</div>
                                        <div className="result-value">
                                            KES {totalPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </div>
                                    </motion.div>
                                    <motion.div 
                                        className="result-item"
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <div className="result-label">Total Interest</div>
                                        <div className="result-value">
                                            KES {totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </div>
                                    </motion.div>
                                    <motion.div 
                                        className="result-item"
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <div className="result-label">Interest Rate</div>
                                        <div className="result-value">
                                            {interestRate}%
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </form>
                    </div>

                    <div className="calculator-footer">
                        <button 
                            className="calculator-button secondary" 
                            onClick={onClose}
                        >
                            Close
                        </button>
                        <button 
                            className="calculator-button primary"
                            onClick={() => {
                                resetCalculator();
                                setErrors({});
                            }}
                        >
                            Reset
                        </button>
                        <button 
                            className="calculator-button primary"
                            onClick={handleCalculate}
                            disabled={Object.keys(errors).length > 0 || isCalculating}
                        >
                            {isCalculating ? 'Calculating...' : 'Calculate'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
