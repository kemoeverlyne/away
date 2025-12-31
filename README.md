# Numida Loan Management System (LMS)

A full-stack loan management dashboard built for the Numida technical assessment. This application enables credit officers to monitor loan portfolios, track repayments, manage risk, and generate reports.

## Key Features

### Professional Dashboard
*   **Summary Cards**: Realtime tracking of Active Loans, Total Disbursed, Total Repaid, and Pending Applications.
*   **Dynamic Loan Table**: Search, sort, and filter through the entire loan portfolio with instant status updates.
*   **Recent Repayments**: A dedicated ledger tracking the latest incoming payments.

### Risk Management (Collections)
*   **"Take Action" Workflow**: A smart alert system that identifies overdue loans and provides a prioritized collections worklist (Defaulted > Late > Principal Amount).
*   **Visual Status Indicators**: Instant recognition of loan health using brand-aligned color coding (Green: On Time, Orange: Late, Red: Defaulted, Grey: Unpaid).

###  Reporting
*   **Portfolio Summary Report**: Generates a print-ready HTML/PDF report featuring:
    *   financial summary (Portfolio Value, Recovery Rate).
    *   Individual Loan Progress Bars (Total Expected vs. Total Paid).
    *   Detailed Repayment Ledgers per customer.
    *   Official brand identity and confidentiality footers.

### Operations
*   **Loan Creation**: Ability to disburse new loans with custom interest rates and due dates.
*   **Payment Recording**: Add repayments via a robust REST API endpoint with real-time status calculation.

## Technical Architecture

### Frontend (Web)
*   **Framework**: React 18 + Vite + TypeScript.
*   **State & Data**: Apollo Client for GraphQL queries/mutations and Context API for global state (Theme, Error, Toast).
*   **UI/UX**: 
    *   **Modular Component Pattern**: High separation of concerns (extracted tables, alerts, and utils).
*   **Utilities**: Centralized logic for loan status and report generation.

### Backend (Server)
*   **Framework**: Flask (Python).
*   **GraphQL**: Graphene implementation for flexible data fetching.
*   **REST**: Specialized endpoints for operational tasks (Add Payment).
*   **Logic**: Standardized date-math and business rules for payment categorization.

## Development Approach

My approach to this assessment focused on building a scalable, maintainable, and professional-grade application while strictly adhering to the core business logic requirements.

### 1. Component Refactoring & Modularity
The original codebase contained large, monolithic components. I refactored `LoanCalculator.tsx` into smaller, atomic components. This improves readability, testability, and reusability across the application.

### 2. Centralized Business Logic
To ensure the 5-day grace period and status calculations remained consistent across all views (Dashboard, Modals, Reports), I extracted the logic into pure utility functions (`web/src/utils/loanUtils.ts` and `paymentUtils.ts`). This "Single Source of Truth" approach prevents logic drift and makes future updates easier.

### 3. Data Integrity & Type Safety
I prioritized TypeScript interfaces and handled GraphQL enum normalization. I implemented a frontend fallback for payment status calculation to ensure that even if the backend returns an "Unpaid" status for a completed transaction, the UI correctly interprets the status based on the `paymentDate` and `dueDate`.

### 4. Professional User Experience
Beyond the basic requirements, I focused on "Credit Officer Personas." This led to the creation of:
*   **The "Take Action" Workflow**: Specifically designed to help officers prioritize high-risk accounts.
*   **Professional Reporting**: Moving beyond simple CSVs to a branded, printable HTML portfolio report.
*   **Global Error Handling**: A custom `ErrorBoundary` to provide a graceful experience in case of failures.

### 5. Hybrid API Strategy
I implemented a hybrid approach using GraphQL for efficient complex data fetching (loans and payments) and a REST endpoint for transaction-heavy actions (adding payments), demonstrating an understanding of when to use each protocol effectively.

## Business Logic (Loan Status)

The system strictly follows the 5-day grace period rule defined in the assessment requirements:

| Status | Rule | Visual |
| :--- | :--- | :--- |
| **On Time** | Paid <= 5 days after due date | Green |
| **Late** | Paid 6-30 days after due date | Orange |
| **Defaulted** | Paid > 30 days after due date | Red |
| **Unpaid** | No payment recorded (within grace period) | Grey |

*Note: For active loans, the status is calculated based on `Today's Date - Due Date` to provide real-time risk assessment.*

## Getting Started

### 1. Prerequisites
*   Node.js (v16+)
*   Python 3.9+
*   Docker (Optional, for containerized run)

### 2. Running the Backend
```bash
cd server
pip install -r requirements.txt
python app.py
```
*Server will run at http://localhost:5000*

### 3. Running the Frontend
```bash
cd web
npm install
npm run dev
```
*Web app will run at http://localhost:5173*

## Bonus Tasks Completed
- [x] **REST Endpoint**: Implemented `/api/payments` for adding transaction data.
- [x] **Advanced Reporting**: Custom-built HTML report generator with progress bars.
- [x] **Error Handling**: Implemented a global `ErrorBoundary` and stylized 404 page.
- [x] **Loading States**: Integrated custom skeleton loaders for data fetching.
- [x] **Refactoring**: Overhauled the original `LoanCalculator` and `LoanList` into modular components.

## Future Improvements (Given More Time)
1.  **Unit Testing**: Implement Jest/Vitest tests for the `loanUtils` and `paymentUtils` to ensure 100% accuracy of status calculations.
2.  **Pagination & Virtualization**: As the portfolio grows, add server-side pagination to the GraphQL queries and virtualize the tables for better performance.
3.  **Real-time Notifications**: Use GraphQL Subscriptions to push updates to the dashboard immediately when a payment is recorded via the REST API.
4.  **PDF Generation**: Integrate a library like `react-pdf` to allow direct PDF downloads of the Portfolio Report without relying on the browser's print dialog.
5.  **User Authentication**: Implement RBAC (Role-Based Access Control) to separate Credit Officer views from Management/Admin views.

---
