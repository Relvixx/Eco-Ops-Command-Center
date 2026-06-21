// ============================================
// HP Calculator — Pure Functions
// Source: TRD §6.2, PRD §9
// ============================================

import type { HPState } from '../types';
import { HP_THRESHOLDS, HP_MIN, HP_MAX, DISTANCE_UNIT_KM } from '../constants/hpStates';

/**
 * Apply an HP change and clamp to [0, 150].
 * @param currentHP — current base health (0–150)
 * @param hpChange — signed delta (negative = damage, positive = heal)
 * @returns clamped new HP value
 */
export function applyHPChange(currentHP: number, hpChange: number): number {
  const result = currentHP + hpChange;
  return Math.min(HP_MAX, Math.max(HP_MIN, result));
}

/**
 * Scale an HP change by distance in km.
 * hpChange is per 10km unit. e.g., -6 HP base × 30km = -6 × 3 = -18 HP.
 * Minimum 1 unit (any distance > 0 counts as at least 1 unit).
 * @param baseHPChange — the emission factor's hpChange value
 * @param km — distance in kilometers
 * @returns scaled HP change
 */
export function scaleHPByDistance(baseHPChange: number, km: number): number {
  if (km <= 0) return baseHPChange; // No distance = base value
  const units = Math.max(1, Math.round(km / DISTANCE_UNIT_KM));
  return baseHPChange * units;
}

/**
 * Determine the HP state for a given HP value.
 * Uses lower-bound inclusive thresholds.
 * hp >= 101 → OPTIMAL
 * hp >= 75  → OPERATIONAL
 * hp >= 40  → UNDER_THREAT
 * hp >= 1   → CRITICAL
 * hp === 0  → DESTROYED
 */
export function getHPState(hp: number): HPState {
  for (const threshold of HP_THRESHOLDS) {
    if (hp >= threshold.min) {
      return threshold.state;
    }
  }
  return 'DESTROYED';
}
