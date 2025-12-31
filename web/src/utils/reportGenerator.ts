import { Loan } from '../types/loan';
import { calculateLoanStatus } from './loanUtils';

export const generateLoanReport = (loans: Loan[], allPayments: any[], getPaymentStatusInfo: (p: any, loans: Loan[]) => any) => {
    const totalAmount = loans.reduce((sum, loan) => sum + loan.principal, 0);
    const totalPaid = loans.reduce((sum, loan) => 
        sum + (loan.payments?.reduce((ps, p) => ps + p.amount, 0) || 0)
    , 0);
    
    const overdueLoans = loans.filter(l => {
        const s = calculateLoanStatus(l);
        return s === 'Late' || s === 'Defaulted';
    });

    const reportDate = new Date().toLocaleDateString('en-KE', { 
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Loan Portfolio Report - ${new Date().toISOString().split('T')[0]}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
                :root {
                    --brand-primary: #004D54;
                    --brand-accent: #00B5D1;
                    --text-primary: #0f172a;
                    --text-secondary: #475569;
                    --bg-app: #f4f7f8;
                }
                body { font-family: 'Plus Jakarta Sans', sans-serif; color: var(--text-primary); padding: 50px; padding-bottom: 150px; line-height: 1.6; background: #fff; }
                .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #edf2f4; padding-bottom: 30px; margin-bottom: 40px; }
                .logo-container { display: flex; align-items: center; }
                .logo-img { height: 56px; width: auto; object-fit: contain; }
                
                .report-info { text-align: right; }
                .report-title { font-size: 26px; font-weight: 800; color: var(--brand-primary); margin: 0; letter-spacing: -0.02em; }
                .report-subtitle { color: var(--text-secondary); font-size: 14px; font-weight: 500; margin-top: 6px; }
                
                .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 48px; }
                .summary-card { padding: 28px; background: var(--bg-app); border-radius: 20px; border: 1px solid #eef2f3; position: relative; overflow: hidden; }
                .summary-card::before { content: ''; position: absolute; top: 0; left: 0; width: 6px; height: 100%; background: var(--brand-accent); }
                .summary-label { font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; }
                .summary-value { font-size: 24px; font-weight: 800; color: var(--brand-primary); letter-spacing: -0.02em; }
                
                h2 { font-size: 18px; font-weight: 800; margin-bottom: 24px; color: var(--brand-primary); display: flex; align-items: center; gap: 10px; letter-spacing: -0.01em; }
                h2::before { content: ''; display: block; width: 14px; height: 14px; background: var(--brand-accent); border-radius: 4px; }
                
                .progress-container { width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; margin-top: 6px; overflow: hidden; }
                .progress-fill { height: 100%; background: var(--brand-accent); border-radius: 3px; transition: width 0.3s ease; }
                .progress-text { font-size: 10px; font-weight: 700; color: var(--text-secondary); margin-top: 4px; display: flex; justify-content: space-between; }
                
                table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 48px; border: 1px solid #edf2f4; border-radius: 16px; overflow: hidden; }
                th { background: #f8fafc; text-align: left; padding: 16px 20px; font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #edf2f4; }
                td { padding: 16px 20px; font-size: 14px; border-bottom: 1px solid #f8fafc; color: var(--text-primary); }
                tr:last-child td { border-bottom: none; }
                tr:hover td { background: #fcfdfe; }
                
                .badge { padding: 7px 14px; border-radius: 10px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.02em; border-width: 1px; border-style: solid; }
                .badge-green { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
                .badge-orange { background: #ffedd5; color: #9a3412; border-color: #fed7aa; }
                .badge-red { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
                .badge-gray { background: #f1f5f9; color: #475569; border-color: #e2e8f0; }
                
                .payment-row { background: #fcfdfe; }
                .payment-list { padding: 0; margin: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 8px; }
                .payment-tag { background: #fff; border: 1px solid #e2e8f0; padding: 4px 10px; border-radius: 6px; font-size: 11px; color: #475569; display: flex; align-items: center; gap: 4px; }
                .payment-tag strong { color: #15803d; }
                
                .footer { margin-top: 80px; padding-top: 30px; border-top: 1px solid #edf2f4; display: flex; justify-content: space-between; align-items: center; color: var(--text-secondary); font-size: 12px; font-weight: 500; }
                
                @media print {
                    body { padding: 0; }
                    .no-print { display: none; }
                    .summary-card { background: #fff !important; border: 1px solid #edf2f4 !important; }
                    .summary-card::before { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                    .badge { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo-container">
                    <img src="${window.location.origin}/logo.numida.png" class="logo-img" onerror="this.src='${window.location.origin}/logo.png'; this.onerror=function(){this.style.display='none';};" />
                </div>
                <div class="report-info">
                    <div class="report-title">Portfolio Report</div>
                    <div class="report-subtitle">System Date: ${reportDate}</div>
                </div>
            </div>

            <div class="summary-grid">
                <div class="summary-card">
                    <div class="summary-label">Total Portfolio</div>
                    <div class="summary-value">KES ${totalAmount.toLocaleString()}</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">Total Repaid</div>
                    <div class="summary-value">KES ${totalPaid.toLocaleString()}</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">Recovery Performance</div>
                    <div class="summary-value">${((totalPaid / (totalAmount || 1)) * 100).toFixed(1)}%</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">Collections Priority</div>
                    <div class="summary-value">${overdueLoans.length} Overdue</div>
                </div>
            </div>

            <h2>Active Loan Portfolio</h2>
            <table>
                <thead>
                    <tr>
                        <th>Loan Reference</th>
                        <th>Customer Account</th>
                        <th>Repayment Progress</th>
                        <th style="text-align: right;">Total Expected</th>
                        <th style="text-align: right;">Total Paid</th>
                        <th>Current Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${loans.map(loan => {
                        const status = calculateLoanStatus(loan);
                        const s = String(status).toUpperCase();
                        let badgeClass = 'badge-gray';
                        let statusLabel = 'Unpaid';
                        if (s === 'ONTIME' || s === 'ON_TIME' || s === 'OnTime') { badgeClass = 'badge-green'; statusLabel = 'On Time'; }
                        else if (s === 'LATE') { badgeClass = 'badge-orange'; statusLabel = 'Late'; }
                        else if (s === 'DEFAULTED') { badgeClass = 'badge-red'; statusLabel = 'Defaulted'; }
                        
                        const loanPaid = loan.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
                        const totalExpected = loan.principal + (loan.principal * (loan.interestRate / 100));
                        const progressPercent = Math.min(Math.round((loanPaid / totalExpected) * 100), 100);

                        return `
                            <tr>
                                <td style="font-weight: 700; color: var(--brand-accent);">LN${loan.id.toString().padStart(3, '0')}</td>
                                <td style="font-weight: 600;">${loan.name}<br/><span style="font-size: 11px; color: #94a3b8;">Due: ${new Date(loan.dueDate).toLocaleDateString('en-KE')}</span></td>
                                <td style="width: 200px;">
                                    <div class="progress-container">
                                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                                    </div>
                                    <div class="progress-text">
                                        <span>${progressPercent}% Complete</span>
                                        <span>KES ${(totalExpected - loanPaid).toLocaleString()} left</span>
                                    </div>
                                </td>
                                <td style="font-weight: 700; text-align: right;">KES ${totalExpected.toLocaleString()}</td>
                                <td style="font-weight: 700; text-align: right; color: #15803d;">KES ${loanPaid.toLocaleString()}</td>
                                <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
                            </tr>
                            ${loan.payments && loan.payments.length > 0 ? `
                            <tr class="payment-row">
                                <td colspan="1" style="border-bottom: 1px solid #edf2f4;"></td>
                                <td colspan="5" style="padding: 10px 20px; border-bottom: 1px solid #edf2f4;">
                                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 8px; font-weight: 700;">Repayment History</div>
                                    <div class="payment-list">
                                        ${[...loan.payments].sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()).map(p => `
                                            <div class="payment-tag">
                                                <span>${new Date(p.paymentDate).toLocaleDateString('en-KE')}</span>
                                                <span>•</span>
                                                <strong>KES ${p.amount.toLocaleString()}</strong>
                                            </div>
                                        `).join('')}
                                    </div>
                                </td>
                            </tr>
                            ` : `
                            <tr class="payment-row">
                                <td colspan="1" style="border-bottom: 1px solid #edf2f4;"></td>
                                <td colspan="5" style="padding: 10px 20px; border-bottom: 1px solid #edf2f4; color: #94a3b8; font-size: 11px; font-style: italic;">
                                    No repayment history found for this account.
                                </td>
                            </tr>
                            `}
                        `;
                    }).join('')}
                </tbody>
            </table>

            <h2>Recent Transactions (Last 15)</h2>
            <table>
                <thead>
                    <tr>
                        <th>Post Date</th>
                        <th>Reference</th>
                        <th>Account Name</th>
                        <th>Payment Amount</th>
                        <th>Posting Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${[...allPayments].sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()).slice(0, 15).map(p => {
                        const statusInfo = getPaymentStatusInfo(p, loans);
                        return `
                            <tr>
                                <td>${new Date(p.paymentDate).toLocaleDateString('en-KE')}</td>
                                <td style="font-weight: 600;">${p.loanIdLabel}</td>
                                <td>${p.customerName}</td>
                                <td style="font-weight: 800; color: #15803d;">KES ${p.amount.toLocaleString()}</td>
                                <td><span class="badge ${statusInfo.class}">${statusInfo.label}</span></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>

            <div class="footer">
                <div>© ${new Date().getFullYear()} Numida Technologies. Confidential Internal Report.</div>
                <div>Page 1 of 1</div>
            </div>

            <div class="no-print" style="position: fixed; bottom: 0; left: 0; right: 0; padding: 20px 50px; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); border-top: 1px solid #edf2f4; display: flex; justify-content: flex-end; gap: 12px; z-index: 9999;">
                <button onclick="window.close()" style="background: white; color: var(--text-secondary); padding: 14px 28px; border-radius: 12px; border: 1px solid #edf2f4; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                    Close
                </button>
                <button onclick="window.print()" style="background: var(--brand-primary); color: white; padding: 14px 28px; border-radius: 12px; border: none; font-weight: 700; cursor: pointer; box-shadow: 0 10px 15px -3px rgba(0, 77, 84, 0.3); transition: all 0.2s;">
                    Print / Save as PDF
                </button>
            </div>
        </body>
        </html>
    `;
};

