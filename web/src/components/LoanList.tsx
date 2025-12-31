import { useState, useMemo, useEffect } from 'react';
import { Loan, LoanStatus } from '../types/loan';
import { calculateLoanStatus } from '../utils/loanUtils';
import { AddPayment } from './AddPayment';
import { LoanDetailsModal } from './loan/LoanDetailsModal';
import { CreateLoanModal } from './loan/CreateLoanModal';
import { ViewRepaymentsModal } from './loan/ViewRepaymentsModal';
import { SearchRepaymentsModal } from './loan/SearchRepaymentsModal';
import { ViewAllLoansModal } from './loan/ViewAllLoansModal';
import { loanService } from '../lib/api/loans';
import { LoadingState } from './common/LoadingState';
import { useError } from '../contexts/ErrorContext';
import { SummaryCards } from './SummaryCards';
import { OverdueAlert } from './OverdueAlert';
import { QuickActions } from './QuickActions';
import { LoanApplicationsTable } from './LoanApplicationsTable';
import { RecentRepaymentsTable } from './RecentRepaymentsTable';
import { generateLoanReport } from '../utils/reportGenerator';
import { getPaymentStatusInfo } from '../utils/paymentUtils';
import '../styles/LoanList.css';

export const LoanList = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isRepaymentsSearchOpen, setIsRepaymentsSearchOpen] = useState(false);
    const [isViewRepaymentsOpen, setIsViewRepaymentsOpen] = useState(false);
    const [isViewAllLoansOpen, setIsViewAllLoansOpen] = useState(false);
    const [viewAllLoansInitialStatus, setViewAllLoansInitialStatus] = useState<LoanStatus | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [repaymentSearchTerm, setRepaymentSearchTerm] = useState('');
    const { showError } = useError();

    const fetchLoans = async () => {
        try {
            setIsLoading(true);
            const fetchedLoans = await loanService.getLoans();
            setLoans(fetchedLoans);
        } catch (err) {
            showError('Failed to fetch loans');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLoans();
    }, [showError]);

    const handleViewDetails = (loan: Loan) => {
        setSelectedLoan(loan);
        setIsDetailsOpen(true);
    };

    const allPayments = useMemo(() => 
        loans.flatMap(l => (l.payments || []).map(p => ({ 
            ...p, 
            customerName: l.name, 
            loanIdLabel: `LN${l.id.toString().padStart(3, '0')}` 
        }))), [loans]);

    const handleExportData = () => {
        if (loans.length === 0) return;
        const reportHtml = generateLoanReport(loans, allPayments, getPaymentStatusInfo);
        const reportWindow = window.open('', '_blank');
        if (reportWindow) {
            reportWindow.document.write(reportHtml);
            reportWindow.document.close();
        }
    };

    const existingCustomers = useMemo(() => Array.from(new Set(loans.map(l => l.name))), [loans]);

    if (isLoading) return <div className="loan-container"><LoadingState count={6} /></div>;

    const recentPayments = [...allPayments].sort((a, b) => 
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    ).slice(0, 5);

    const overdueCount = loans.filter(l => {
        const status = calculateLoanStatus(l);
        return status === LoanStatus.Late || status === LoanStatus.Defaulted;
    }).length;

    return (
        <div className="loan-container">
            <div className="dashboard-title-row">
                <div>
                    <h1>Dashboard Overview</h1>
                    <p>Welcome back! Here's what's happening today.</p>
                </div>
                <div className="dashboard-actions">
                    <button className="btn-modern-white" onClick={handleExportData}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Export Data
                    </button>
                    <button className="btn-modern-primary" onClick={() => setIsCreateModalOpen(true)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        New Loan Application
                    </button>
                </div>
            </div>

            <OverdueAlert 
                count={overdueCount} 
                onTakeAction={() => {
                    setViewAllLoansInitialStatus('OVERDUE' as any);
                    setIsViewAllLoansOpen(true);
                }} 
            />

            <SummaryCards loans={loans} />

            <div className="dashboard-grid">
                <QuickActions 
                    onCreateLoan={() => setIsCreateModalOpen(true)}
                    onAddRepayment={() => setIsAddPaymentOpen(true)}
                    onViewRepayments={() => setIsRepaymentsSearchOpen(true)}
                />

                <div className="main-tables-column">
                    <LoanApplicationsTable 
                        loans={loans} 
                        onViewDetails={handleViewDetails}
                        onViewAll={() => setIsViewAllLoansOpen(true)}
                    />

                    <RecentRepaymentsTable 
                        payments={recentPayments}
                        loans={loans}
                        onViewAll={() => {
                            setRepaymentSearchTerm('');
                            setIsViewRepaymentsOpen(true);
                        }}
                    />
                </div>
            </div>

            <LoanDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => {
                    setIsDetailsOpen(false);
                    setSelectedLoan(null);
                }}
                loan={selectedLoan}
            />

            <AddPayment
                isOpen={isAddPaymentOpen}
                onClose={() => {
                    setIsAddPaymentOpen(false);
                    setSelectedLoan(null);
                }}
                onPaymentAdd={() => {
                    setIsAddPaymentOpen(false);
                    fetchLoans();
                }}
                selectedLoan={selectedLoan}
                allLoans={loans}
            />

            <CreateLoanModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onLoanCreated={fetchLoans}
                existingCustomers={existingCustomers}
            />

            <ViewRepaymentsModal
                isOpen={isViewRepaymentsOpen}
                onClose={() => setIsViewRepaymentsOpen(false)}
                loans={loans}
                initialSearch={repaymentSearchTerm}
            />

            <ViewAllLoansModal
                isOpen={isViewAllLoansOpen}
                onClose={() => setIsViewAllLoansOpen(false)}
                loans={loans}
                onViewDetails={handleViewDetails}
                initialStatus={viewAllLoansInitialStatus}
            />

            <SearchRepaymentsModal
                isOpen={isRepaymentsSearchOpen}
                onClose={() => setIsRepaymentsSearchOpen(false)}
                loans={loans}
                onSearch={(term) => {
                    setRepaymentSearchTerm(term);
                    setIsRepaymentsSearchOpen(false);
                    setIsViewRepaymentsOpen(true);
                }}
            />
        </div>
    );
};
