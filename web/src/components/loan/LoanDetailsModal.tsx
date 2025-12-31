import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loan } from '../../types/loan';
import { calculateLoanStatus } from '../../utils/loanUtils';
import { getPaymentStatusInfo } from '../../utils/paymentUtils';
import '../../styles/LoanDetailsModal.css';

interface LoanDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    loan: Loan | null;
}

export const LoanDetailsModal: React.FC<LoanDetailsModalProps> = ({ isOpen, onClose, loan }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'customer' | 'repayments' | 'documents'>('overview');

    const repaymentRows = useMemo(() => {
        if (!loan) return [];
        return (loan.payments || [])
            .map((p) => ({
                ...p,
                dateLabel: new Date(p.paymentDate).toLocaleDateString(),
                loanIdLabel: `LN${loan.id.toString().padStart(3, '0')}`,
            }))
            .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
    }, [loan]);

    if (!isOpen || !loan) return null;

    const totalPaid = loan.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const totalAmount = loan.principal + (loan.principal * (loan.interestRate / 100));
    const progress = (totalPaid / totalAmount) * 100;
    const status = calculateLoanStatus(loan);

    const statusClass =
        status === 'OnTime'
            ? 'badge-green'
            : status === 'Late'
            ? 'badge-orange'
            : status === 'Defaulted'
            ? 'badge-red'
            : 'badge-gray';

    const statusLabel = status === 'OnTime' ? 'On Time' : status;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay" onClick={onClose}>
                    <motion.div 
                        className="details-modal"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="details-header">
                            <div>
                                <h2>Loan Details</h2>
                                <span className="loan-id-sub">LN{loan.id.toString().padStart(3, '0')}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span className={`badge ${statusClass}`}>
                                    {statusLabel}
                                </span>
                                <button className="close-x" onClick={onClose}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                </button>
                            </div>
                        </div>

                        <div className="details-tabs">
                            <div className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</div>
                            <div className={`tab ${activeTab === 'customer' ? 'active' : ''}`} onClick={() => setActiveTab('customer')}>Customer Info</div>
                            <div className={`tab ${activeTab === 'repayments' ? 'active' : ''}`} onClick={() => setActiveTab('repayments')}>Repayments ({loan.payments?.length || 0})</div>
                            <div className={`tab ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>Documents & Collateral</div>
                        </div>

                        <div className="details-content">
                            {activeTab === 'overview' && (
                                <>
                                    <div className="stats-grid">
                                        <div className="stat-box">
                                            <span className="label">Loan Amount</span>
                                            <span className="value">KES {loan.principal.toLocaleString()}</span>
                                        </div>
                                        <div className="stat-box">
                                            <span className="label">Monthly Payment</span>
                                            <span className="value">
                                                KES {(loan.principal / 36 + (loan.principal * (loan.interestRate/100) / 12)).toFixed(0)}
                                            </span>
                                        </div>
                                        <div className="stat-box">
                                            <span className="label">Interest Rate</span>
                                            <span className="value">{loan.interestRate}%</span>
                                        </div>
                                        <div className="stat-box">
                                            <span className="label">Duration</span>
                                            <span className="value">36 mo</span>
                                        </div>
                                    </div>

                                    <div className="details-section">
                                        <h3 className="section-title">Payment Progress</h3>
                                        <div className="progress-info">
                                            <span className="label">Total Repaid</span>
                                            <span className="value">KES {totalPaid.toLocaleString()}</span>
                                        </div>
                                        <div className="modal-progress-bar">
                                            <div className="modal-progress-fill" style={{ width: `${progress}%` }}></div>
                                        </div>
                                        <div className="progress-info" style={{ fontSize: '0.7rem' }}>
                                            <span style={{ color: '#94a3b8' }}>{progress.toFixed(1)}% completed</span>
                                            <span style={{ color: '#94a3b8' }}>Outstanding: KES {(totalAmount - totalPaid).toLocaleString()}</span>
                                        </div>
                                        <div className="next-payment-banner">
                                            <span>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                                Next Payment Due
                                            </span>
                                            <span>11/1/2024</span>
                                        </div>
                                    </div>

                                    <div className="details-section">
                                        <h3 className="section-title">Application Progress</h3>
                                        <div className="timeline">
                                            {[
                                                { label: 'Application Submitted', date: '1/20/2024', note: 'Initial application received' },
                                                { label: 'Under Review', date: 'Risk assessment completed', note: 'All documents verified' },
                                                { label: 'Approved', date: 'All approvals completed', note: 'Ready for disbursement' },
                                                { label: 'Disbursed', date: '2/1/2024', note: 'Funds released to customer' },
                                            ].map((step) => (
                                                <div className="timeline-item" key={step.label} style={{ padding: '6px 0' }}>
                                                    <div className="check-circle">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                                    </div>
                                                    <div className="timeline-text" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                        <span className="timeline-label" style={{ fontWeight: 700 }}>{step.label}</span>
                                                        <span className="timeline-date" style={{ color: '#475569', fontWeight: 600 }}>{step.date}</span>
                                                        <span style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.3 }}>{step.note}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === 'customer' && (
                                <div className="details-section">
                                    <h3 className="section-title">Customer Info</h3>
                                    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                                        <div className="stat-box">
                                            <span className="label">Customer</span>
                                            <span className="value">{loan.name}</span>
                                        </div>
                                        <div className="stat-box">
                                            <span className="label">Loan ID</span>
                                            <span className="value">LN{loan.id.toString().padStart(3, '0')}</span>
                                        </div>
                                        <div className="stat-box">
                                            <span className="label">Due Date</span>
                                            <span className="value">
                                                {new Date(loan.dueDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="stat-box">
                                            <span className="label">Status</span>
                                            <span className="value">{status}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'repayments' && (
                                <div className="details-section">
                                    <h3 className="section-title">Repayments</h3>
                                    <div className="table-card" style={{ boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                                        <div className="table-header" style={{ padding: '12px 16px' }}>
                                            <h2>History</h2>
                                            <div style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>
                                                {repaymentRows.length} records
                                            </div>
                                        </div>
                                        <div style={{ overflowX: 'auto' }}>
                                            <table className="modern-table">
                                                <thead>
                                                    <tr>
                                                        <th>Loan ID</th>
                                                        <th>Date</th>
                                                        <th>Amount</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {repaymentRows.map((p) => {
                                                        const statusInfo = getPaymentStatusInfo(p, [loan]);
                                                        return (
                                                            <tr key={p.id}>
                                                                <td style={{ fontWeight: 700 }}>{p.loanIdLabel}</td>
                                                                <td>{p.dateLabel}</td>
                                                                <td style={{ fontWeight: 700, color: 'var(--brand-success)' }}>
                                                                    KES {p.amount.toLocaleString()}
                                                                </td>
                                                                <td>
                                                                    <span className={`badge ${statusInfo.class}`}>
                                                                        {statusInfo.label}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                    {repaymentRows.length === 0 && (
                                                        <tr>
                                                            <td colSpan={4} style={{ textAlign: 'center', padding: '16px', color: 'var(--text-tertiary)' }}>
                                                                No repayments recorded.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'documents' && (
                                <div className="details-section">
                                    <h3 className="section-title">Documents & Collateral</h3>
                                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                                        No documents uploaded. Add collateral or upload supporting files to complete this profile.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn-close" onClick={onClose}>Close</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};







