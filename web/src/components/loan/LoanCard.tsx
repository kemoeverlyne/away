import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loan, Payment } from '../../types/loan';
import { calculateLoanStatus } from '../../utils/loanUtils';
import PaymentHistory from './PaymentHistory';
import '../../styles/LoanCard.css';

interface LoanCardProps {
    loan: Loan;
    onAddPayment: (loan: Loan) => void;
}

const formatCurrency = (amount: number): string => {
        return `KES ${amount.toLocaleString()}`;
    };

const formatDaysRemaining = (dueDate: string): { text: string; className: string } => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let text: string;
    let className: string;

    if (diffDays < 0) {
        text = `${Math.abs(diffDays)} days overdue`;
        className = 'urgent';
    } else if (diffDays === 0) {
        text = 'Due today';
        className = 'urgent';
    } else if (diffDays === 1) {
        text = 'Due tomorrow';
        className = 'warning';
    } else if (diffDays <= 7) {
        text = `${diffDays} days left`;
        className = 'warning';
    } else {
        text = `${diffDays} days until due`;
        className = 'safe';
    }

    return { text, className };
};

const calculateTotalPaid = (payments: Payment[] | undefined): number => {
    if (!payments || payments.length === 0) return 0;
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
};

const calculateTotalInterest = (loan: Loan): number => {
    return loan.principal * (loan.interestRate / 100);
};

const getStatusColor = (status: string): string => {
    const s = status.toUpperCase();
    if (s === 'ONTIME' || s === 'ON_TIME') return '#10b981';
    if (s === 'LATE') return '#f59e0b';
    if (s === 'DEFAULTED') return '#ef4444';
    return '#94a3b8';
};

const calculatePaymentProgress = (totalPaid: number, totalAmount: number): number => {
    const progress = (totalPaid / totalAmount) * 100;
    return Math.min(progress, 100);
};

const formatRemainingAmount = (remainingAmount: number): string => {
    if (remainingAmount <= 0) {
        return `KES ${Math.abs(remainingAmount).toLocaleString()} overpaid`;
    }
    return `KES ${remainingAmount.toLocaleString()}`;
};

const LoanCard: React.FC<LoanCardProps> = ({ loan, onAddPayment }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const totalPaid = calculateTotalPaid(loan.payments);
    const totalInterest = calculateTotalInterest(loan);
    const totalAmount = loan.principal + totalInterest;
    const remainingAmount = totalAmount - totalPaid;
    const paymentProgress = calculatePaymentProgress(totalPaid, totalAmount);
    const loanStatus = calculateLoanStatus(loan);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onAddPayment(loan);
    };

    const statusLabel = loanStatus === 'OnTime' ? 'On Time' : loanStatus;

    return (
        <motion.div
            className="loan-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            <div className="loan-header">
                <h3 className="customer-name">{loan.name}</h3>
                <div className={`loan-status ${loanStatus.toLowerCase()}`}>
                    {statusLabel}
                </div>
            </div>

            <div className="loan-details">
                <div className="detail-item">
                    <span className="detail-label">Principal Amount</span>
                    <span className="detail-value">{formatCurrency(loan.principal)}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Interest Rate</span>
                    <span className="detail-value">{loan.interestRate}% p.a.</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Total Interest</span>
                    <span className="detail-value">{formatCurrency(totalInterest)}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Due Date</span>
                    <div className="due-date-container">
                        <span className="due-date-value">
                            {new Date(loan.dueDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </span>
                        {(() => {
                            const { text, className } = formatDaysRemaining(loan.dueDate);
                            return <span className={`days-remaining ${className}`}>{text}</span>;
                        })()}
                    </div>
                </div>
            </div>

            <div className="progress-section">
                <div className="progress-header">
                    <span className="progress-label">Payment Progress</span>
                    <span className="progress-percentage">
                        {totalPaid > totalAmount ? '100' : paymentProgress.toFixed(1)}%
                        {totalPaid > totalAmount && ' (Overpaid)'}
                    </span>
                </div>
                <div className="progress-bar">
                    <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${paymentProgress}%` }}
                        transition={{ duration: 0.3 }}
                        style={{ backgroundColor: getStatusColor(loanStatus) }}
                    />
                </div>
                <div className="progress-amounts">
                    <div>
                        <span className="amount-label">Paid</span>
                        <div className="amount-value">{formatCurrency(totalPaid)}</div>
                    </div>
                    <div>
                        <span className="amount-label">
                            {remainingAmount <= 0 ? 'Overpaid Amount' : 'Remaining'}
                        </span>
                        <div className="amount-value" style={{
                            color: remainingAmount <= 0 ? '#059669' : '#1e293b'
                        }}>
                            {formatRemainingAmount(remainingAmount)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="actions">
                <button 
                    className={`action-button add-payment-button ${loanStatus === 'Defaulted' ? 'defaulted' : ''}`}
                    onClick={handleClick}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Add Payment
                    {loanStatus === 'Defaulted' && (
                        <span className="defaulted-indicator">!</span>
                    )}
                </button>
                <button 
                    className="action-button view-details-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                >
                    {isExpanded ? 'Hide Details' : 'View Details'}
                </button>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        className="payment-history"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <PaymentHistory payments={loan.payments || []} />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default LoanCard;
