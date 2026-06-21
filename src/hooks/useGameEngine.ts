// ============================================
// useGameEngine Hook
// Source: TRD §7.2, Implementation Plan §T3.3
// Orchestrates: emission lookup → HP calc → streak → log → dispatch → save
// ============================================

import { useState, useCallback, useRef } from 'react';
import { useGameContext } from '../context/GameContext';
import { EMISSION_FACTORS } from '../constants/emissionFactors';
import { applyHPChange, scaleHPByDistance } from '../utils/hpCalculator';
import { computeStreak } from '../utils/streakEngine';
import { ACTIONS } from '../types';
import type { Category, LogEntry, EmissionFactor } from '../types';

const COOLDOWN_MS = 3000; // 3-second submit debounce

export function useGameEngine() {
  const { state, dispatch } = useGameContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = useCallback(() => {
    setCooldownRemaining(3);
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    cooldownTimer.current = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          if (cooldownTimer.current) clearInterval(cooldownTimer.current);
          cooldownTimer.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  /**
   * Submit a new activity.
   * @returns the created LogEntry (for useAPEX to use), or null if invalid
   */
  const submitActivity = useCallback(
    (factorId: string, distanceKm?: number): LogEntry | null => {
      if (isSubmitting || cooldownRemaining > 0) return null;

      // Find the emission factor
      let factor: EmissionFactor | undefined;
      let category: Category | undefined;

      for (const [cat, factors] of Object.entries(EMISSION_FACTORS)) {
        const found = factors.find((f) => f.id === factorId);
        if (found) {
          factor = found;
          category = cat as Category;
          break;
        }
      }

      if (!factor || !category) return null;

      setIsSubmitting(true);

      // Calculate HP change (scale by distance if applicable)
      let hpChange = factor.hpChange;
      if (factor.maxInput !== null && distanceKm !== undefined && distanceKm > 0) {
        const clampedKm = Math.min(distanceKm, factor.maxInput);
        hpChange = scaleHPByDistance(factor.hpChange, clampedKm);
      }

      // Calculate new HP
      const newHP = applyHPChange(state.baseHealth, hpChange);

      // Calculate today's net HP
      const today = new Date().toISOString().split('T')[0];
      const isNewDay = state.lastActiveDate !== today;
      const newTodayNetHP = isNewDay ? hpChange : state.todayNetHP + hpChange;

      // Calculate streak
      const newStreak = computeStreak(
        state.streak,
        state.lastActiveDate,
        newTodayNetHP,
      );

      // Build log entry
      const logEntry: LogEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        category,
        action: factor.label,
        hpChange,
        aiTip: '', // Will be filled by useAPEX
        tipSource: 'fallback',
      };

      // Dispatch state update
      dispatch({
        type: ACTIONS.LOG_ACTIVITY,
        payload: {
          logEntry,
          newHP,
          newStreak,
          newTodayNetHP,
          newLastActiveDate: today,
        },
      });

      setIsSubmitting(false);
      startCooldown();

      return logEntry;
    },
    [state, dispatch, isSubmitting, cooldownRemaining, startCooldown],
  );

  return {
    submitActivity,
    isSubmitting,
    cooldownRemaining,
  };
}
