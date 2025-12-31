import { useEffect, useMemo, useState } from 'react';
import { Loan, LoanStatus } from '../../types/loan';
import { getPaymentStatusInfo } from '../../utils/paymentUtils';
import '../../styles/LoanDetailsModal.css';

interface ViewRepaymentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    loans: Loan[];
    initialSearch?: string;
}

type StatusFilter = 'all' | LoanStatus.OnTime | LoanStatus.Late | LoanStatus.Defaulted | LoanStatus.Unpaid;

export const ViewRepaymentsModal = ({ isOpen, onClose, loans, initialSearch = '' }: ViewRepaymentsModalProps) => {
    const [search, setSearch] = useState(initialSearch);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSearch(initialSearch);
        }
    }, [initialSearch, isOpen]);

    const allPayments = useMemo(() => {
        return loans.flatMap((loan) =>
            (loan.payments || []).map((p) => {
                const statusInfo = getPaymentStatusInfo(p, [loan]);

                return {
                    ...p,
                    statusLabel: statusInfo.label,
                    badgeClass: statusInfo.class,
                    loanName: loan.name,
                    loanIdLabel: `LN${loan.id.toString().padStart(3, '0')}`,
                };
            })
        );
    }, [loans]);

    const filtered = useMemo(() => {
        return allPayments.filter((p) => {
            const matchesSearch = !search.trim() ||
                p.loanName.toLowerCase().includes(search.toLowerCase()) ||
                p.loanIdLabel.toLowerCase().includes(search.toLowerCase());
            
            const filterValue = String(statusFilter).toUpperCase();
            const paymentStatusValue = p.statusLabel.replace(' ', '').toUpperCase();
            
            const matchesStatus = statusFilter === 'all' || paymentStatusValue === filterValue;
            
            const date = new Date(p.paymentDate);
            const afterStart = !startDate || date >= new Date(startDate);
            const beforeEnd = !endDate || date <= new Date(endDate);
            return matchesSearch && matchesStatus && afterStart && beforeEnd;
        });
    }, [allPayments, search, statusFilter, startDate, endDate]);

    const insights = useMemo(() => {
        const totalAmount = filtered.reduce((sum, p) => sum + p.amount, 0);
        const riskyPayments = filtered.filter((p) => p.statusLabel === 'Late' || p.statusLabel === 'Defaulted');
        const riskyAmount = riskyPayments.reduce((sum, p) => sum + p.amount, 0);
        const onTimeCount = filtered.filter((p) => p.statusLabel === 'On Time').length;
        const successRate = filtered.length
            ? Math.round((onTimeCount / filtered.length) * 100)
            : 0;
        
        return { totalAmount, riskyAmount, riskyCount: riskyPayments.length, successRate, onTimeCount };
    }, [filtered]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="details-modal" style={{ maxWidth: '1000px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
                <div className="details-header">
                    <div>
                        <h2>Repayments & Analytics</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Track payment performance and recovery metrics.
                        </p>
                    </div>
                    <button className="close-button" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="details-content" style={{ display: 'flex', gap: '24px', flexDirection: 'column', padding: '24px' }}>
                    <div className="modal-filters-grid">
                        <div className="search-bar">
                            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ left: '12px', color: 'var(--text-tertiary)' }}>
                                <circle cx="11" cy="11" r="8"/>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                            <input
                                className="form-input"
                                placeholder="Search customer or loan ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                                style={{ paddingLeft: '40px', width: '100%', height: '42px' }}
                            />
                        </div>
                        <select
                            className="form-input"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                            style={{ height: '42px', padding: '0 12px' }}
                        >
                            <option value="all">All Statuses</option>
                            <option value={LoanStatus.OnTime}>On Time</option>
                            <option value={LoanStatus.Late}>Late</option>
                            <option value={LoanStatus.Defaulted}>Defaulted</option>
                            <option value={LoanStatus.Unpaid}>Unpaid</option>
                        </select>
                        <div style={{ position: 'relative' }}>
                            <input
                                className="form-input"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={{ height: '42px', width: '100%' }}
                            />
                            <div style={{ position: 'absolute', top: '-8px', left: '12px', background: 'var(--bg-card)', padding: '0 4px', fontSize: '10px', color: 'var(--text-tertiary)' }}>Start Date</div>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                className="form-input"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                style={{ height: '42px', width: '100%' }}
                            />
                            <div style={{ position: 'absolute', top: '-8px', left: '12px', background: 'var(--bg-card)', padding: '0 4px', fontSize: '10px', color: 'var(--text-tertiary)' }}>End Date</div>
                        </div>
                    </div>

                    <div className="loan-summary-grid">
                        <div className="modern-card" style={{ padding: '20px', borderLeft: '4px solid var(--brand-success)' }}>
                            <div className="card-label" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-success)' }}></div>
                                Total Recovered
                            </div>
                            <div className="card-value" style={{ fontSize: '22px', marginTop: '8px' }}>KES {insights.totalAmount.toLocaleString()}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>From {filtered.length} payments</div>
                        </div>
                        
                        <div className="modern-card" style={{ padding: '20px', borderLeft: '4px solid var(--brand-accent)' }}>
                            <div className="card-label" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-accent)' }}></div>
                                Collection Success
                            </div>
                            <div className="card-value" style={{ fontSize: '22px', marginTop: '8px' }}>{insights.successRate}%</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{insights.onTimeCount} on-time payments</div>
                        </div>

                        <div className="modern-card" style={{ padding: '20px', borderLeft: '4px solid #64748b' }}>
                            <div className="card-label" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#64748b' }}></div>
                                Active Borrowers
                            </div>
                            <div className="card-value" style={{ fontSize: '22px', marginTop: '8px' }}>
                                {Array.from(new Set(filtered.map(p => p.loanName))).length}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Unique customers</div>
                        </div>

                        <div className="modern-card" style={{ padding: '20px', borderLeft: '4px solid #f59e0b' }}>
                            <div className="card-label" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div>
                                Total at Risk
                            </div>
                            <div className="card-value" style={{ fontSize: '22px', marginTop: '8px' }}>KES {insights.riskyAmount.toLocaleString()}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>From {insights.riskyCount} overdue payments</div>
                        </div>
                    </div>

                    <div className="table-card" style={{ boxShadow: 'none', border: '1px solid var(--border-subtle)' }}>
                        <div className="table-header" style={{ padding: '16px 20px', background: 'var(--bg-subtle)' }}>
                            <h2 style={{ fontSize: '16px' }}>Transaction History</h2>
                            <div style={{ color: 'var(--text-tertiary)', fontWeight: 600, fontSize: '13px' }}>
                                {filtered.length} records found
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>Loan ID</th>
                                        <th>Customer</th>
                                        <th>Amount</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((p) => (
                                        <tr key={p.id}>
                                            <td style={{ fontWeight: 700, color: 'var(--brand-accent)' }}>{p.loanIdLabel}</td>
                                            <td>{p.loanName}</td>
                                            <td style={{ fontWeight: 800, color: 'var(--brand-success)' }}>
                                                KES {p.amount.toLocaleString()}
                                            </td>
                                            <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`badge ${p.badgeClass}`}>
                                                    {p.statusLabel}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: 'center', padding: '16px', color: 'var(--text-tertiary)' }}>
                                                No repayments match your filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

