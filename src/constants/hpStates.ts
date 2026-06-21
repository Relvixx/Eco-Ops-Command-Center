// ============================================
// HP State Thresholds + Colors
// Source: PRD §9, UX §5.2, UX §10.2
// ============================================

import type { HPState } from '../types';

// State thresholds — lower-bound inclusive
// 75 = OPERATIONAL (confirmed by TRD §6.2 getHPState implementation)
export const HP_THRESHOLDS: { state: HPState; min: number }[] = [
  { state: 'OPTIMAL',      min: 101 },
  { state: 'OPERATIONAL',  min: 75 },
  { state: 'UNDER_THREAT', min: 40 },
  { state: 'CRITICAL',     min: 1 },
  { state: 'DESTROYED',    min: 0 },
];

// Colour tokens per state — UX §5.2
export const HP_STATE_CONFIG: Record<HPState, {
  color: string;
  barColor: string;
  badgeIcon: string;
  badgeText: string;
  bgOverlayClass: string;
}> = {
  OPTIMAL: {
    color: '#00FF87',
    barColor: '#00FF87',
    badgeIcon: '✦',
    badgeText: 'OPTIMAL',
    bgOverlayClass: 'bg-transparent',
  },
  OPERATIONAL: {
    color: '#16A34A',
    barColor: '#16A34A',
    badgeIcon: '●',
    badgeText: 'OPERATIONAL',
    bgOverlayClass: 'bg-transparent',
  },
  UNDER_THREAT: {
    color: '#FFD60A',
    barColor: '#FFD60A',
    badgeIcon: '⚠',
    badgeText: 'UNDER THREAT',
    bgOverlayClass: 'bg-amber-900/[0.06]',
  },
  CRITICAL: {
    color: '#FF3131',
    barColor: '#FF3131',
    badgeIcon: '⛔',
    badgeText: 'CRITICAL',
    bgOverlayClass: 'bg-red-900/[0.10]',
  },
  DESTROYED: {
    color: '#FF3131',
    barColor: '#FF3131',
    badgeIcon: '💀',
    badgeText: 'DESTROYED',
    bgOverlayClass: 'bg-red-900/[0.14]',
  },
};

// HP limits
export const HP_MIN = 0;
export const HP_MAX = 150;
export const HP_DEFAULT = 100;

// Distance scaling — per TRD: hpChange is per 10km unit
export const DISTANCE_UNIT_KM = 10;
