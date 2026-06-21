// src/hooks/useApex.ts
import { useCallback } from 'react';
import type { TipSource } from '../types';
import { getNextFallback } from '../constants/fallbackMessages';

interface LogSummary {
  category: string;
  action: string;
  hpChange: number;
}

interface ApexResult {
  tip: string;
  source: TipSource;
}

export function useApex() {
  const fetchTip = useCallback(
    async (currentHP: number, recentLogs: LogSummary[]): Promise<ApexResult> => {
      // Check network before attempting fetch
      if (!navigator.onLine) {
        console.warn('[useApex] Network offline — using fallback tip');
        return { tip: getNextFallback(), source: 'fallback' };
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      try {
        const res = await fetch('/api/apex-advisor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentHP, recentLogs: recentLogs.slice(0, 3) }),
          signal: controller.signal,
        });

        if (!res.ok) {
          console.warn('[useApex] API returned', res.status);
          return { tip: getNextFallback(), source: 'fallback' };
        }

        const data = await res.json();

        // Server signalled fallback
        if (data.source === 'fallback' || !data.tip) {
          return { tip: getNextFallback(), source: 'fallback' };
        }

        return { tip: data.tip, source: data.source as TipSource };
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          console.warn('[useApex] Request timed out after 15s');
        } else {
          console.warn('[useApex] Fetch failed:', (err as Error).message);
        }
        return { tip: getNextFallback(), source: 'fallback' };
      } finally {
        clearTimeout(timeout);
      }
    },
    []
  );

  return { fetchTip };
}
