import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loanService } from '../../lib/api/loans';
import { useToast } from '../../hooks/useToast';
import '../../styles/AddPayment.css'; // Reusing modal styles

interface CreateLoanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoanCreated: () => void;
    existingCustomers: string[];
}

export const CreateLoanModal = ({ isOpen, onClose, onLoanCreated, existingCustomers }: CreateLoanModalProps) => {
    const [name, setName] = useState('');
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState('');
    const [principal, setPrincipal] = useState('');
    const [interestRate, setInterestRate] = useState('5.0');
    const [dueDate, setDueDate] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const finalName = isNewCustomer ? newCustomerName : name;

        if (!finalName || !principal || !interestRate || !dueDate) {
            setError('Please fill in all fields');
            return;
        }

        const numPrincipal = parseInt(principal);
        const numInterest = parseFloat(interestRate);

        if (isNaN(numPrincipal) || numPrincipal <= 0) {
            setError('Please enter a valid principal amount');
            return;
        }

        if (isNaN(numInterest) || numInterest < 0 || numInterest > 100) {
            setError('Please enter a valid interest rate (0-100)');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await loanService.createLoan(
                finalName,
                numInterest,
                numPrincipal,
                dueDate
            );

            if (response.success) {
                showToast('Loan application created successfully!', 'success');
                onLoanCreated();
                handleClose();
            } else {
                setError(response.message || 'Failed to create loan');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while creating the loan');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setName('');
        setIsNewCustomer(false);
        setNewCustomerName('');
        setPrincipal('');
        setInterestRate('5.0');
        setDueDate('');
        setError('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    className="modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                >
                    <motion.div 
                        className="modal-content"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>New Loan Application</h2>
                            <button className="close-button" onClick={handleClose}>×</button>
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label htmlFor="name" style={{ marginBottom: 0 }}>Customer Name</label>
                                    <button 
                                        type="button" 
                                        onClick={() => setIsNewCustomer(!isNewCustomer)}
                                        style={{ 
                                            background: 'none', 
                                            color: 'var(--brand-accent)', 
                                            fontSize: '12px', 
                                            fontWeight: 700,
                                            padding: 0
                                        }}
                                    >
                                        {isNewCustomer ? 'Select Existing' : '+ New Customer'}
                                    </button>
                                </div>
                                
                                {isNewCustomer ? (
                                    <input
                                        id="newName"
                                        type="text"
                                        className="form-input"
                                        value={newCustomerName}
                                        onChange={(e) => setNewCustomerName(e.target.value)}
                                        placeholder="Enter customer name"
                                        required
                                        disabled={isSubmitting}
                                    />
                                ) : (
                                    <select
                                        id="name"
                                        className="form-input"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        disabled={isSubmitting}
                                    >
                                        <option value="">Select a customer</option>
                                        {existingCustomers.map(customer => (
                                            <option key={customer} value={customer}>
                                                {customer}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="principal">Principal Amount (KES)</label>
                                <input
                                    id="principal"
                                    type="number"
                                    className="form-input"
                                    value={principal}
                                    onChange={(e) => setPrincipal(e.target.value)}
                                    placeholder="Enter amount"
                                    min="0"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="interestRate">Interest Rate (% p.a.)</label>
                                <input
                                    id="interestRate"
                                    type="number"
                                    className="form-input"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(e.target.value)}
                                    placeholder="Enter rate"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="dueDate">Due Date</label>
                                <input
                                    id="dueDate"
                                    type="date"
                                    className="form-input"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    className="cancel-button"
                                    onClick={handleClose}
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
                                    {isSubmitting ? 'Creating...' : 'Create Loan'}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

