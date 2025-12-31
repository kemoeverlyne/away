import { LoanStatus } from '../../types/loan';
import '../../styles/SearchAndFilters.css';

export type SortOption = 'customerName' | 'amount' | 'dueDate';

interface SearchAndFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    sortBy: SortOption;
    onSortChange: (value: SortOption) => void;
    filterStatus: LoanStatus | null;
    onFilterChange: (status: LoanStatus | null) => void;
}

export const SearchAndFilters = ({
    searchTerm,
    onSearchChange,
    sortBy,
    onSortChange,
    filterStatus,
    onFilterChange
}: SearchAndFiltersProps) => {
    return (
        <div className="search-and-filters">
            <div className="search-bar">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search loans by name..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            <div className="filter-controls">
                <div className="sort-control">
                    <svg className="sort-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 5h10M11 9h7M11 13h4M3 17l3 3 3-3M6 18V4"/>
                    </svg>
                    <select
                        className="sort-select"
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value as SortOption)}
                    >
                        <option value="customerName">Sort by Name</option>
                        <option value="amount">Sort by Amount</option>
                        <option value="dueDate">Sort by Due Date</option>
                    </select>
                </div>
                <div className="status-filters">
                    <button
                        key="all"
                        className={`filter-btn ${filterStatus === null ? 'active' : ''}`}
                        onClick={() => onFilterChange(null)}
                    >
                        <span className="status-dot all"></span>
                        All
                    </button>
                    <button
                        key="overdue"
                        className={`filter-btn ${filterStatus === 'OVERDUE' as any ? 'active' : ''}`}
                        onClick={() => onFilterChange('OVERDUE' as any)}
                        style={{ background: filterStatus === 'OVERDUE' as any ? 'var(--brand-danger)' : undefined, color: filterStatus === 'OVERDUE' as any ? 'white' : undefined }}
                    >
                        <span className="status-dot defaulted"></span>
                        Overdue
                    </button>
                    {Object.values(LoanStatus).map(status => (
                        <button
                            key={status}
                            className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                            onClick={() => onFilterChange(status)}
                        >
                            <span className={`status-dot ${status.toLowerCase().replace(' ', '')}`}></span>
                            {status === LoanStatus.OnTime ? 'On Time' : status}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}; 