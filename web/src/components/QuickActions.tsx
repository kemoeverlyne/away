
interface QuickActionsProps {
    onCreateLoan: () => void;
    onAddRepayment: () => void;
    onViewRepayments: () => void;
}

export const QuickActions = ({ onCreateLoan, onAddRepayment, onViewRepayments }: QuickActionsProps) => {
    return (
        <aside className="quick-actions-panel">
            <div className="section-header">
                <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Quick Actions</h2>
            </div>
            <div className="action-item-card" onClick={onCreateLoan}>
                <div className="action-item-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                </div>
                <div className="action-item-text">
                    <h4>Create Loan</h4>
                    <p>New disbursement</p>
                </div>
            </div>
            <div className="action-item-card" onClick={onAddRepayment}>
                <div className="action-item-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div className="action-item-text">
                    <h4>Add Repayment</h4>
                    <p>Record a payment</p>
                </div>
            </div>
            <div className="action-item-card" onClick={onViewRepayments}>
                <div className="action-item-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
                <div className="action-item-text">
                    <h4>View Repayments</h4>
                    <p>Transaction history</p>
                </div>
            </div>
        </aside>
    );
};

