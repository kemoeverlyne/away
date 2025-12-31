import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loan, Payment } from '../types/loan';
import { paymentService } from '../lib/api/payments';
import '../styles/AddPayment.css';

interface AddPaymentProps {
    isOpen: boolean;
    onClose: () => void;
    onPaymentAdd: (payment: Payment) => void;
    selectedLoan?: Loan | null;
    allLoans?: Loan[];
}

export const AddPayment = ({ isOpen, onClose, onPaymentAdd, selectedLoan, allLoans = [] }: AddPaymentProps) => {
    const [amount, setAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [manualSelectedLoanId, setManualSelectedLoanId] = useState<number | ''>('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const activeLoan = selectedLoan || allLoans.find(l => l.id === manualSelectedLoanId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!activeLoan) {
            setError('Please select a loan');
            return;
        }

        if (!amount || !paymentDate) {
            setError('Please fill in all fields');
            return;
        }

        const numAmount = Math.round(parseFloat(amount));
        if (isNaN(numAmount) || numAmount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        const paid = activeLoan.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
        const remainingAmount = activeLoan.principal - paid;
        
        if (numAmount > remainingAmount) {
            setError(`Payment amount cannot exceed the remaining balance of KES ${remainingAmount.toLocaleString()}`);
            return;
        }

        try {
            setIsSubmitting(true);
            const payment = await paymentService.addPayment({
                loanId: activeLoan.id,
                paymentDate: paymentDate,
                amount: numAmount
            });

            onPaymentAdd(payment);
            setAmount('');
            setManualSelectedLoanId('');
            setPaymentDate(new Date().toISOString().split('T')[0]);
            onClose();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to add payment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    className="modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div 
                        className="modal-content"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>Add Payment</h2>
                            <button className="close-button" onClick={onClose}>×</button>
                        </div>

                        <form onSubmit={handleSubmit} className="payment-form">
                            {error && (
                                <motion.div 
                                    className="error-message"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {error}
                                </motion.div>
                            )}

                            <div className="form-group">
                                <label>Target Loan</label>
                                <div className="selected-loan">
                                    {selectedLoan ? (
                                        <div className="loan-info">
                                            <span className="loan-name">{selectedLoan.name}</span>
                                            <span className="loan-amount">
                                                Amount: KES {selectedLoan.principal.toLocaleString()}
                                            </span>
                                            <span className="remaining-amount">
                                                Remaining: KES {(
                                                    selectedLoan.principal - 
                                                    (selectedLoan.payments?.reduce((sum, p) => sum + p.amount, 0) || 0)
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="loan-info">
                                            <select 
                                                className="form-input" 
                                                style={{ border: 'none', background: 'transparent', padding: 0 }}
                                                value={manualSelectedLoanId}
                                                onChange={(e) => setManualSelectedLoanId(Number(e.target.value))}
                                            >
                                                <option value="">Select a loan to repay</option>
                                                {allLoans.map(l => (
                                                    <option key={l.id} value={l.id}>
                                                        {l.name} (LN{l.id.toString().padStart(3, '0')})
                                                    </option>
                                                ))}
                                            </select>
                                            {activeLoan && (
                                                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                                                    <span className="remaining-amount" style={{ display: 'block' }}>
                                                        Remaining Balance: KES {(
                                                            activeLoan.principal - 
                                                            (activeLoan.payments?.reduce((sum, p) => sum + p.amount, 0) || 0)
                                                        ).toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="amount">Payment Amount (KES)</label>
                                <input
                                    id="amount"
                                    type="number"
                                    className="form-input"
                                    value={amount}
                                    onChange={(e) => {
                                        setAmount(e.target.value);
                                        setError('');
                                    }}
                                    placeholder="Enter amount"
                                    min="0"
                                    step="0.01"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="paymentDate">Payment Date</label>
                                <input
                                    id="paymentDate"
                                    type="date"
                                    className="form-input"
                                    value={paymentDate}
                                    onChange={(e) => {
                                        setPaymentDate(e.target.value);
                                        setError('');
                                    }}
                                    max={new Date().toISOString().split('T')[0]}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    className="cancel-button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <motion.button 
                                    type="submit"
                                    className="submit-button"
                                    disabled={isSubmitting}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isSubmitting ? (
                                        <span className="loading">
                                            Adding Payment...
                                            <motion.span
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            >
                                                ⟳
                                            </motion.span>
                                        </span>
                                    ) : (
                                        'Add Payment'
                                    )}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}; 