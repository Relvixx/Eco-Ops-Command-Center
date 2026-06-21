// ============================================
// useAPEX Hook — AI Advisory Lifecycle
// Source: TRD §7.3, Implementation Plan §T3.4
// Manages: prompt build → API call → fallback → dispatch
// ============================================

import { useState, useCallback } from 'react';
import { useGameContext } from '../context/GameContext';
import { buildUserPrompt } from '../utils/promptBuilder';
import { sanitize } from '../utils/sanitizer';
import { getNextFallback } from '../constants/fallbackMessages';
import { ACTIONS } from '../types';
import type { LogEntry, APEXResponse } from '../types';

const ABORT_TIMEOUT_MS = 15000; // 15-second abort

export function useAPEX() {
  const { state, dispatch } = useGameContext();
  const [isLoading, setIsLoading] = useState(false);
  const [latestTip, setLatestTip] = useState<string>('');
  const [tipSource, setTipSource] = useState<'gemini' | 'groq' | 'fallback'>('fallback');

  /**
   * Call APEX advisor for a new tip.
   * @param logEntry — the just-submitted log entry
   */
  const callAPEX = useCallback(
    async (logEntry: LogEntry) => {
      setIsLoading(true);

      // Prepare recent logs (last 3 including the new one)
      const recentLogs = [logEntry, ...state.logs.slice(0, 2)].map((log) => ({
        category: log.category,
        action: log.action,
        hpChange: log.hpChange,
      }));

      // Check network
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.warn('[APEX] Network offline — using fallback tip');
        const fallbackTip = getNextFallback();
        setLatestTip(fallbackTip);
        setTipSource('fallback');
        dispatch({
          type: ACTIONS.SET_AI_TIP,
          payload: { logId: logEntry.id, tip: fallbackTip, tipSource: 'fallback' },
        });
        setIsLoading(false);
        return;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), ABORT_TIMEOUT_MS);

        const response = await fetch('/api/apex-advisor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentHP: state.baseHealth,
            recentLogs,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data: APEXResponse = await response.json();
          const cleanTip = sanitize(data.tip);
          setLatestTip(cleanTip);
          setTipSource(data.source);
          dispatch({
            type: ACTIONS.SET_AI_TIP,
            payload: { logId: logEntry.id, tip: cleanTip, tipSource: data.source },
          });
        } else {
          // Server returned error — use fallback
          throw new Error(`API returned ${response.status}`);
        }
      } catch (error) {
        console.warn('[APEX] API call failed — using fallback:', (error as Error).message);
        const fallbackTip = getNextFallback();
        setLatestTip(fallbackTip);
        setTipSource('fallback');
        dispatch({
          type: ACTIONS.SET_AI_TIP,
          payload: { logId: logEntry.id, tip: fallbackTip, tipSource: 'fallback' },
        });
      } finally {
        setIsLoading(false);
      }
    },
    [state.logs, state.baseHealth, dispatch],
  );

  return {
    callAPEX,
    isLoading,
    latestTip,
    tipSource,
  };
}
