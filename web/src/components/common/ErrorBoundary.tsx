import { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import '../../styles/NotFound.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="notfound-container">
          <motion.div
            className="notfound-card"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="notfound-badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.35)' }}>
              !
            </div>
            <h1>Something went wrong</h1>
            <p style={{ marginBottom: '16px' }}>
              An unexpected error occurred. Our team has been notified.
            </p>
            {this.state.error && (
              <code style={{ 
                display: 'block', 
                marginBottom: '24px', 
                padding: '12px', 
                background: 'rgba(0,0,0,0.2)', 
                borderRadius: '8px',
                fontSize: '12px',
                color: '#94a3b8',
                textAlign: 'left',
                overflowX: 'auto',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                {this.state.error.message}
              </code>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                className="notfound-button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
              >
                Refresh page
              </button>
              <a className="notfound-button" href="/" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', boxShadow: 'none' }}>
                Go to Home
              </a>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
} 
