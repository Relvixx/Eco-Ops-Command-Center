// ============================================
// Demo Data — Constants
// Source: Implementation Plan §10.7
// 3 pre-built LogEntry objects for judge demo
// ============================================

import type { GameState, LogEntry } from '../types';

export const DEMO_HP = 62;

export const DEMO_LOGS: LogEntry[] = [
  {
    id: 'demo-001',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    category: 'Transport',
    action: 'Flight',
    hpChange: -25,
    aiTip: 'High-altitude emissions have an outsized warming effect. Consider rail alternatives for journeys under 600km.',
    tipSource: 'fallback',
  },
  {
    id: 'demo-002',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    category: 'Food',
    action: 'Beef Meal',
    hpChange: -8,
    aiTip: 'Beef production generates 60kg CO2e per kilogram. Swapping to poultry halves the impact per meal.',
    tipSource: 'fallback',
  },
  {
    id: 'demo-003',
    timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
    category: 'Offset',
    action: 'Tree Planted',
    hpChange: +15,
    aiTip: 'One mature tree absorbs approximately 22kg of CO2 annually. Consistent planting creates compounding returns.',
    tipSource: 'fallback',
  },
];

/**
 * Returns a complete GameState for demo mode.
 * This state is ephemeral — NOT persisted to localStorage.
 */
export function getDemoState(): GameState {
  return {
    schemaVersion: 1,
    baseHealth: DEMO_HP,
    streak: 2,
    todayNetHP: -18,
    lastActiveDate: new Date().toISOString().split('T')[0],
    logs: [...DEMO_LOGS],
  };
}
