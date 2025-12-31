import { Loan } from '../types/loan';
import { calculateLoanStatus } from '../utils/loanUtils';

interface LoanApplicationsTableProps {
    loans: Loan[];
    onViewDetails: (loan: Loan) => void;
    onViewAll: () => void;
}

export const LoanApplicationsTable = ({ loans, onViewDetails, onViewAll }: LoanApplicationsTableProps) => {
    return (
        <div className="table-card">
            <div className="table-header">
                <h2>All Loan Applications</h2>
                <button className="view-link" onClick={onViewAll}>View All ↗</button>
            </div>
            <div className="table-responsive">
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>Loan ID</th>
                            <th>Customer</th>
                            <th>Principal</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loans.map(loan => {
                            const status = calculateLoanStatus(loan);
                            const s = String(status).toUpperCase();
                            let badgeClass = 'badge-gray';
                            let statusLabel = 'Unpaid';

                            if (s === 'ONTIME' || s === 'ON_TIME' || s === 'OnTime') {
                                badgeClass = 'badge-green';
                                statusLabel = 'On Time';
                            } else if (s === 'LATE') {
                                badgeClass = 'badge-orange';
                                statusLabel = 'Late';
                            } else if (s === 'DEFAULTED') {
                                badgeClass = 'badge-red';
                                statusLabel = 'Defaulted';
                            }
                            
                            return (
                                <tr key={loan.id}>
                                    <td style={{fontWeight: 700, color: 'var(--brand-accent)'}}>LN{loan.id.toString().padStart(3, '0')}</td>
                                    <td>
                                        <div className="customer-cell">
                                            <div className="customer-avatar">
                                                {loan.name.split(' ').map((n: string) => n[0]).join('')}
                                            </div>
                                            <span className="customer">{loan.name}</span>
                                        </div>
                                    </td>
                                    <td style={{fontWeight: 700, color: 'var(--text-primary)'}}>KES {loan.principal.toLocaleString()}</td>
                                    <td>{new Date(loan.dueDate).toLocaleDateString()}</td>
                                    <td><span className={`badge ${badgeClass}`}>{statusLabel}</span></td>
                                    <td>
                                        <button onClick={() => onViewDetails(loan)} className="table-action-btn">
                                            View Details
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M5 12h14M12 5l7 7-7 7"/>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

