import { useMemo, useState } from 'react';
import { Loan } from '../../types/loan';
import '../../styles/LoanDetailsModal.css';

interface SearchRepaymentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (term: string) => void;
    loans: Loan[];
}

export const SearchRepaymentsModal = ({ isOpen, onClose, onSearch, loans }: SearchRepaymentsModalProps) => {
    const [term, setTerm] = useState('');
    const [error, setError] = useState('');

    const suggestions = useMemo(() => {
        const t = term.trim().toLowerCase();
        if (!t) return [];
        return loans
            .map((l) => ({
                value: l.name,
                label: `${l.name} (${`LN${l.id.toString().padStart(3, '0')}`})`,
                idLabel: `LN${l.id.toString().padStart(3, '0')}`,
            }))
            .filter(
                (s) =>
                    s.label.toLowerCase().includes(t) ||
                    s.idLabel.toLowerCase().includes(t) ||
                    s.value.toLowerCase().includes(t)
            )
            .slice(0, 5);
    }, [loans, term]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = term.trim();
        if (!trimmed) {
            setError('Please enter a loan name or ID');
            return;
        }
        setError('');
        onSearch(trimmed);
        setTerm('');
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="details-modal" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
                <div className="details-header">
                    <div>
                        <h2>Search Repayments</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Enter a loan name or ID to view its repayments and insights.
                        </p>
                    </div>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="details-content">
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <label className="form-label" htmlFor="repay-search">Loan name or ID</label>
                        <input
                            id="repay-search"
                            className="form-input"
                            placeholder="e.g. Sarah's Business or LN005"
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                            autoFocus
                            aria-invalid={!!error}
                        />
                        {error && (
                            <div style={{ color: 'var(--brand-danger)', fontWeight: 600, fontSize: 13 }}>
                                {error}
                            </div>
                        )}
                        {suggestions.length > 0 && (
                            <div
                                style={{
                                    background: 'var(--bg-card)',
                                    border: `1px solid var(--border-subtle)`,
                                    borderRadius: '10px',
                                    boxShadow: 'var(--shadow-md)',
                                    marginTop: '4px',
                                    overflow: 'hidden'
                                }}
                            >
                                {suggestions.map((s) => (
                                    <button
                                        key={s.idLabel}
                                        type="button"
                                        onClick={() => setTerm(s.value)}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '12px 14px',
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--text-primary)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <span style={{ fontWeight: 600 }}>{s.value}</span>
                                        <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>{s.idLabel}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                            Tip: Search by full or partial customer name, or by loan code like "LN003".
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                            <button type="button" className="btn-modern-white" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn-modern-primary">Search</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

