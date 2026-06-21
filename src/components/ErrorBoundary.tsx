import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary] Render error caught:', error, info);
  }

  handleRestart = () => {
    try {
      localStorage.removeItem('eco_ops_v1');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0A0C10',
            color: '#FF3131',
            fontFamily: 'Teko, sans-serif',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', letterSpacing: '0.1em' }}>
            CRITICAL SYSTEM FAILURE
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#8A9BB0', marginBottom: '2rem', maxWidth: '400px' }}>
            An unexpected error has compromised the command center.
            All local data will be cleared on restart.
          </p>
          <button
            onClick={this.handleRestart}
            style={{
              background: '#FF3131',
              color: '#0A0C10',
              border: 'none',
              padding: '0.75rem 2rem',
              fontFamily: 'Teko, sans-serif',
              fontSize: '1.25rem',
              letterSpacing: '0.1em',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            EMERGENCY RESTART
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
