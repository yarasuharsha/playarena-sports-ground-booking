import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled application error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div className="card" style={{
            maxWidth: '560px',
            width: '100%',
            padding: '40px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-xl)',
            borderTop: '4px solid #EF4444'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: '#FEE2E2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: '#EF4444'
            }}>
              <AlertTriangle size={32} />
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', color: '#0F172A' }}>
              Something Went Wrong
            </h2>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.6 }}>
              The application encountered an unexpected runtime error. Your existing reservations and data in PostgreSQL remain completely safe.
            </p>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'left',
                marginBottom: '24px',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                maxHeight: '120px',
                overflowY: 'auto',
                color: '#DC2626'
              }}>
                {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={this.handleReload} className="btn btn-primary">
                <RefreshCw size={16} /> Reload Page
              </button>
              <button onClick={this.handleGoHome} className="btn btn-secondary">
                <Home size={16} /> Go to Homepage
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
