import React from 'react';
import { Payment } from '../../types/loan';
import '../../styles/PaymentHistory.css';

interface PaymentHistoryProps {
    payments: Payment[];
}

const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        const month = date.toLocaleString('en-US', { month: 'short' });
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month} ${day}, ${year}`;
    } catch {
        return 'Invalid Date';
    }
};

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ payments }) => {
    const formatCurrency = (amount: number) => {
        return `KES ${amount.toLocaleString()}`;
    };

    const formatStatus = (status: string): string => {
        // Convert status to Title Case ("On Time", "Late", "Defaulted")
        return status.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    };

    return (
        <div className="payment-history-section">
            <div className="payment-history-header">
                <h4>Payment History</h4>
                <span className="payment-count">{payments.length} payments</span>
            </div>

            {payments.length > 0 ? (
                <div className="payment-list">
                    <div className="payment-list-header">
                        <span>PAYMENT DATE</span>
                        <span>AMOUNT</span>
                        <span>STATUS</span>
                    </div>
                    {payments.map((payment, index) => (
                        <div key={payment.id || index} className="payment-item">
                            <span className="payment-date">
                                {formatDate(payment.paymentDate)}
                            </span>
                            <span className="payment-amount">
                                {formatCurrency(payment.amount)}
                            </span>
                            <span className={`payment-status status-${formatStatus(payment.status)}`}>
                                {formatStatus(payment.status)}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-payments">
                    No payments have been made yet
                </div>
            )}
        </div>
    );
};

export default PaymentHistory; 