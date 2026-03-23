import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ Error Boundary caught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px', 
          fontFamily: 'system-ui, -apple-system, sans-serif',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h1 style={{ color: '#d32f2f', marginBottom: '20px' }}>
            ⚠️ Application Error
          </h1>
          <div style={{ 
            background: '#fff3cd', 
            border: '1px solid #ffc107',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h2 style={{ marginTop: 0, fontSize: '18px' }}>Error Details:</h2>
            <pre style={{ 
              background: '#fff', 
              padding: '15px', 
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '14px'
            }}>
              {this.state.error?.toString()}
            </pre>
          </div>
          {this.state.errorInfo && (
            <details style={{ marginBottom: '20px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
                Stack Trace
              </summary>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '15px', 
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px'
              }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          <button 
            onClick={() => {
              localStorage.setItem('demo_data_reset_complete_v5', 'true');
              localStorage.setItem('app_code_version', 'v2025.02.01');
              window.location.href = window.location.origin;
            }}
            style={{
              background: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            🔄 Reload App
          </button>
          <button 
            onClick={() => {
              if (confirm('This will clear all data. Are you sure?')) {
                localStorage.clear();
                window.location.href = window.location.origin;
              }
            }}
            style={{
              background: '#d32f2f',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            🗑️ Clear All Data & Restart
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
