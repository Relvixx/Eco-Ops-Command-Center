// ============================================
// Game Context — Global State Provider
// Source: TRD §7.1, Implementation Plan §T3.2
// useReducer for atomic state transitions
// ============================================

import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';
import type { GameState, GameAction, LogActivityPayload, SetAITipPayload, LoadDemoPayload } from '../types';
import { ACTIONS } from '../types';
import { loadState, saveState, initState } from '../utils/storageManager';

// --- Reducer ---
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case ACTIONS.LOG_ACTIVITY: {
      const p: LogActivityPayload = action.payload;
      return {
        ...state,
        baseHealth: p.newHP,
        streak: p.newStreak,
        todayNetHP: p.newTodayNetHP,
        lastActiveDate: p.newLastActiveDate,
        logs: [p.logEntry, ...state.logs],
      };
    }

    case ACTIONS.SET_AI_TIP: {
      const p: SetAITipPayload = action.payload;
      return {
        ...state,
        logs: state.logs.map((log) =>
          log.id === p.logId
            ? { ...log, aiTip: p.tip, tipSource: p.tipSource }
            : log
        ),
      };
    }

    case ACTIONS.LOAD_DEMO: {
      const p: LoadDemoPayload = action.payload;
      return { ...p.demoState };
    }

    case ACTIONS.RESET_BASE: {
      return initState();
    }

    case ACTIONS.SET_AI_LOADING:
      return state; // AI loading is tracked separately in useAPEX hook

    default:
      return state;
  }
}

// --- Context ---
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  previousHP: number;
  isDemoMode: boolean;
  setIsDemoMode: (v: boolean) => void;
}

const GameContext = createContext<GameContextType | null>(null);

// --- Provider ---
export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initState());
  const previousHP = useRef(state.baseHealth);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const isBootstrapped = useRef(false);

  // Bootstrap from localStorage on mount
  useEffect(() => {
    if (isBootstrapped.current) return;
    isBootstrapped.current = true;

    const saved = loadState();
    if (saved) {
      // Restore saved state via LOG_ACTIVITY-like dispatch won't work cleanly,
      // so we use LOAD_DEMO to restore the full saved state
      dispatch({ type: ACTIONS.LOAD_DEMO, payload: { demoState: saved } });
      previousHP.current = saved.baseHealth;
    }
  }, []);

  // Persist state to localStorage on every change (except demo mode)
  useEffect(() => {
    if (!isBootstrapped.current) return;
    if (!isDemoMode) {
      saveState(state);
    }
  }, [state, isDemoMode]);

  // Track previous HP for animation triggers
  useEffect(() => {
    const timer = setTimeout(() => {
      previousHP.current = state.baseHealth;
    }, 1200); // Wait for animations to complete
    return () => clearTimeout(timer);
  }, [state.baseHealth]);

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        previousHP: previousHP.current,
        isDemoMode,
        setIsDemoMode,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

// --- Consumer Hook ---
export function useGameContext(): GameContextType {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}
