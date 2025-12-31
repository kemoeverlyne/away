import { useState, useMemo } from 'react';
import { Loan, LoanStatus } from '../../types/loan';
import { SearchAndFilters, SortOption } from './SearchAndFilters';
import { calculateLoanStatus } from '../../utils/loanUtils';
import '../../styles/LoanDetailsModal.css';

interface ViewAllLoansModalProps {
    isOpen: boolean;
    onClose: () => void;
    loans: Loan[];
    onViewDetails: (loan: Loan) => void;
    initialStatus?: LoanStatus | null;
}

export const ViewAllLoansModal = ({ isOpen, onClose, loans, onViewDetails, initialStatus = null }: ViewAllLoansModalProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('customerName');
    const [filterStatus, setFilterStatus] = useState<LoanStatus | null>(initialStatus);

    useMemo(() => {
        if (isOpen) {
            setFilterStatus(initialStatus);
        }
    }, [isOpen, initialStatus]);

    const filteredAndSortedLoans = useMemo(() => {
        let result = loans.filter(loan => {
            const matchesSearch = loan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                `LN${loan.id.toString().padStart(3, '0')}`.toLowerCase().includes(searchTerm.toLowerCase());
            
            const status = calculateLoanStatus(loan);
            const statusStr = String(status).toUpperCase();
            
            if (filterStatus === 'OVERDUE' as any) {
                return matchesSearch && (statusStr === 'LATE' || statusStr === 'DEFAULTED');
            }
            
            const matchesStatus = filterStatus === null || status === filterStatus;
            return matchesSearch && matchesStatus;
        });

        result.sort((a, b) => {
            // Priority sorting for "OVERDUE" mode
            if (filterStatus === 'OVERDUE' as any) {
                const statusA = String(calculateLoanStatus(a)).toUpperCase();
                const statusB = String(calculateLoanStatus(b)).toUpperCase();
                
                // Defaulted > Late
                if (statusA === 'DEFAULTED' && statusB !== 'DEFAULTED') return -1;
                if (statusA !== 'DEFAULTED' && statusB === 'DEFAULTED') return 1;
                
                // If same status, sort by amount descending
                return b.principal - a.principal;
            }

            if (sortBy === 'customerName') {
                return a.name.localeCompare(b.name);
            } else if (sortBy === 'amount') {
                return b.principal - a.principal;
            } else if (sortBy === 'dueDate') {
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }
            return 0;
        });

        return result;
    }, [loans, searchTerm, sortBy, filterStatus]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="details-modal" style={{ maxWidth: '1000px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
                <div className="details-header">
                    <div>
                        <h2>All Loan Applications</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            View, search, and filter all loan applications.
                        </p>
                    </div>
                    <button className="close-button" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="details-content" style={{ padding: '24px' }}>
                    <SearchAndFilters 
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        filterStatus={filterStatus}
                        onFilterChange={setFilterStatus}
                    />

                    <div className="table-card" style={{ boxShadow: 'none', border: '1px solid var(--border-subtle)', marginTop: '0' }}>
                        <div className="table-header" style={{ padding: '16px 20px' }}>
                            <h2>Results</h2>
                            <div style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>
                                {filteredAndSortedLoans.length} records
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
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
                                    {filteredAndSortedLoans.map(loan => {
                                        const status = calculateLoanStatus(loan);
                                        const badgeClass = status === 'OnTime' ? 'badge-green' : 
                                                         status === 'Late' ? 'badge-orange' : 
                                                         status === 'Defaulted' ? 'badge-red' : 'badge-gray';
                                        
                                        const statusLabel = status === 'OnTime' ? 'On Time' : status;

                                        return (
                                            <tr key={loan.id}>
                                                <td style={{fontWeight: 700, color: 'var(--brand-accent)'}}>LN{loan.id.toString().padStart(3, '0')}</td>
                                                <td>{loan.name}</td>
                                                <td style={{fontWeight: 700}}>KES {loan.principal.toLocaleString()}</td>
                                                <td>{new Date(loan.dueDate).toLocaleDateString()}</td>
                                                <td><span className={`badge ${badgeClass}`}>{statusLabel}</span></td>
                                                <td>
                                                    <button onClick={() => {
                                                        onViewDetails(loan);
                                                        onClose();
                                                    }} className="table-action-btn">
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredAndSortedLoans.length === 0 && (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center', padding: '16px', color: 'var(--text-tertiary)' }}>
                                                No loans match your filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="modal-footer" style={{ padding: '20px' }}>
                    <button className="btn-close" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

