import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Loan } from '../types/loan';
import { calculateLoanStatus } from '../utils/loanUtils';
import { LoanStatus } from '../types/loan';

interface SummaryCardsProps {
    loans: Loan[];
}

export const SummaryCards = ({ loans }: SummaryCardsProps) => {
    const totalAmount = useMemo(() => loans.reduce((sum, loan) => sum + loan.principal, 0), [loans]);
    const totalPaid = useMemo(() => 
        loans.reduce((sum, loan) => 
            sum + (loan.payments?.reduce((paymentSum, payment) => paymentSum + payment.amount, 0) || 0)
        , 0)
    , [loans]);

    const activeLoans = loans.length;
    const pendingCount = loans.filter(l => calculateLoanStatus(l) === LoanStatus.Unpaid).length;

    const cards = [
        { 
            label: 'Active Loans', 
            value: activeLoans, 
            trend: '+12.5%', 
            isUp: true, 
            type: 'active-loans',
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        },
        { 
            label: 'Total Disbursed', 
            value: `KES ${(totalAmount / 1000).toFixed(0)}K`, 
            trend: '+8.2%', 
            isUp: true, 
            type: 'total-disbursed',
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        },
        { 
            label: 'Total Repaid', 
            value: `KES ${(totalPaid / 1000).toFixed(1)}K`, 
            trend: '11.0%', 
            isUp: true, 
            type: 'total-repaid',
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
        },
        { 
            label: 'Pending Applications', 
            value: pendingCount, 
            trend: '-3.1%', 
            isUp: false, 
            type: 'pending',
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        },
    ];

    return (
        <div className="loan-summary-grid">
            {cards.map((card, i) => (
                <motion.div 
                    key={card.label}
                    className={`modern-card ${card.type}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <div className="card-header-flex">
                        <div className="card-icon-wrapper">
                            {card.icon}
                        </div>
                        <div className={`card-trend ${card.isUp ? 'trend-up' : 'trend-down'}`}>
                            {card.isUp ? '↗' : '↘'} {card.trend}
                        </div>
                    </div>
                    <div className="card-label">{card.label}</div>
                    <div className="card-value">{card.value}</div>
                </motion.div>
            ))}
        </div>
    );
};

