import './styles/globals.css'
import './styles/Header.css'
import './styles/LoanList.css'
import './styles/LoanCard.css'
import './styles/PaymentHistory.css'
import './styles/LoanCalculator.css'
import { ApolloProvider } from '@apollo/client'
import { apolloClient } from './apolloClient'
import { Layout } from './components/Layout'
import { LoanList } from './components/LoanList'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { ToastProvider } from './contexts/ToastContext'
import { LoanCalculator } from './components/LoanCalculator'
import { useState } from 'react'
import { ErrorProvider } from './contexts/ErrorContext'
import { NotFound } from './components/NotFound'

function App() {
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const allowedPaths = ['/', '/index.html'];
    const isKnownRoute = allowedPaths.includes(window.location.pathname);

    if (!isKnownRoute) {
        return <NotFound />;
    }

    return (
        <ErrorBoundary>
            <ApolloProvider client={apolloClient}>
                <ToastProvider>
                    <ErrorProvider>
                        <Layout onOpenCalculator={() => setIsCalculatorOpen(true)}>
                            <LoanList />
                        </Layout>
                        <LoanCalculator 
                            isOpen={isCalculatorOpen}
                            onClose={() => setIsCalculatorOpen(false)}
                        />
                    </ErrorProvider>
                </ToastProvider>
            </ApolloProvider>
        </ErrorBoundary>
    )
}

export default App
