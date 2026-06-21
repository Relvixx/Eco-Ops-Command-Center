// ============================================
// DemoControls — Judge evaluation utilities
// Source: Implementation Plan §10.7
// Load demo state, hard reset
// ============================================

import { RotateCcw, PlaySquare } from 'lucide-react';
import { useGameContext } from '../context/GameContext';
import { getDemoState } from '../constants/demoData';
import { clearState } from '../utils/storageManager';
import { ACTIONS } from '../types';

export default function DemoControls() {
  const { dispatch, isDemoMode, setIsDemoMode } = useGameContext();

  const handleLoadDemo = () => {
    // 1. Wipe real localStorage
    clearState();
    
    // 2. Load demo state into React state
    const demoState = getDemoState();
    dispatch({ type: ACTIONS.LOAD_DEMO, payload: { demoState } });
    
    // 3. Mark as demo mode (prevents saving to localStorage)
    setIsDemoMode(true);
  };

  const handleReset = () => {
    // 1. Wipe real localStorage
    clearState();
    
    // 2. Reset React state to clean boot
    dispatch({ type: ACTIONS.RESET_BASE });
    
    // 3. Exit demo mode
    setIsDemoMode(false);
  };

  return (
    <div className="flex items-center gap-2">
      {!isDemoMode ? (
        <button
          onClick={handleLoadDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--color-bg-input)] hover:bg-[var(--color-bg-card)] text-[12px] font-medium text-[var(--color-accent-teal)] border border-[var(--color-accent-teal)]/30 transition-colors cursor-pointer"
          title="Load Demo Mode (for Judges)"
        >
          <PlaySquare size={14} />
          <span className="hidden md:inline">DEMO MODE</span>
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold text-[var(--color-hp-threat)] uppercase tracking-wider animate-pulse">
            DEMO ACTIVE
          </span>
        </div>
      )}
      
      <button
        onClick={handleReset}
        className="flex items-center justify-center w-8 h-8 rounded bg-[var(--color-bg-input)] hover:bg-[var(--color-hp-critical)]/20 text-[var(--color-chrome-muted)] hover:text-[var(--color-hp-critical)] transition-colors cursor-pointer"
        title="Hard Reset (Wipe all data)"
      >
        <RotateCcw size={16} />
      </button>
    </div>
  );
}
