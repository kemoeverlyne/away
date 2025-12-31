import { Loan } from '../types/loan';
import { getPaymentStatusInfo } from '../utils/paymentUtils';

interface RecentRepaymentsTableProps {
    payments: any[];
    loans: Loan[];
    onViewAll: () => void;
}

export const RecentRepaymentsTable = ({ payments, loans, onViewAll }: RecentRepaymentsTableProps) => {
    return (
        <div className="table-card" id="recent-repayments">
            <div className="table-header">
                <h2>Recent Repayments</h2>
                <button className="view-link" onClick={onViewAll}>View All ↗</button>
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
                        {payments.map(p => {
                            const statusInfo = getPaymentStatusInfo(p, loans);

                            return (
                                <tr key={p.id}>
                                    <td style={{fontWeight: 700, color: 'var(--text-primary)'}}>{p.loanIdLabel}</td>
                                    <td>
                                        <div className="customer-cell">
                                            <div className="customer-avatar" style={{ width: '32px', height: '32px', fontSize: '11px' }}>
                                                {p.customerName.split(' ').map((n: string) => n[0]).join('')}
                                            </div>
                                            <span className="customer" style={{ fontSize: '14px' }}>{p.customerName}</span>
                                        </div>
                                    </td>
                                    <td style={{fontWeight: 800, color: 'var(--brand-success)'}}>KES {p.amount.toLocaleString()}</td>
                                    <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                                    <td><span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

