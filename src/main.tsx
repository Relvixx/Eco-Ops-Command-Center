import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { GameProvider } from './context/GameContext.tsx';

// ============================================
// Error Boundary Fallback
// ============================================
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ECO-OPS] CRITICAL FAILURE:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0C10] text-[#FF3131] flex flex-col items-center justify-center p-6 text-center font-mono">
          <h1 className="text-2xl font-bold mb-4">SYSTEM OFFLINE</h1>
          <p className="text-[#8B9AB5] mb-6 max-w-md">
            A critical system failure occurred. Please initiate a manual restart sequence.
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="px-6 py-3 bg-[#FF3131]/10 border border-[#FF3131]/30 rounded hover:bg-[#FF3131]/20 transition-colors cursor-pointer"
          >
            PURGE MEMORY & RESTART
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <GameProvider>
        <App />
      </GameProvider>
    </ErrorBoundary>
  </StrictMode>,
);
