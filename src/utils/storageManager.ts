// ============================================
// Storage Manager — ONLY localStorage access point
// Source: TRD §5, Implementation Plan §10
// No other file may touch localStorage directly
// ============================================

import type { GameState } from '../types';
import { HP_DEFAULT, HP_MIN, HP_MAX } from '../constants/hpStates';

const STORAGE_KEY = 'eco_ops_v1';
const CURRENT_SCHEMA_VERSION = 1;
const MAX_LOG_ENTRIES = 100;

/**
 * Create a fresh initial state (cold boot).
 */
export function initState(): GameState {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    baseHealth: HP_DEFAULT,
    streak: 0,
    todayNetHP: 0,
    lastActiveDate: new Date().toISOString().split('T')[0],
    logs: [],
  };
}

/**
 * Load state from localStorage.
 * Returns null on any error (corrupt JSON, missing key, etc.).
 * Caller must handle null → initState().
 */
export function loadState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const migrated = migrateIfNeeded(parsed);
    const validated = validateState(migrated);
    return pruneLogsIfNeeded(validated);
  } catch (error) {
    console.error('[STORAGE] Load failed:', (error as Error).message);
    return null;
  }
}

/**
 * Save state to localStorage.
 * Returns true on success, false on failure.
 */
export function saveState(state: GameState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error('[STORAGE] Write failed:', (error as Error).message);
    return false;
  }
}

/**
 * Clear all app state from localStorage.
 */
export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[STORAGE] Clear failed:', (error as Error).message);
  }
}

/**
 * Migrate old schema versions to current.
 */
export function migrateIfNeeded(raw: Record<string, unknown>): GameState {
  if (!raw || typeof raw !== 'object') return initState();

  // v0 → v1: add todayNetHP and lastActiveDate
  if (!raw.schemaVersion || (raw.schemaVersion as number) < CURRENT_SCHEMA_VERSION) {
    console.warn(`[STORAGE] Migrated schema v${raw.schemaVersion ?? 0} → v${CURRENT_SCHEMA_VERSION}`);
    if (raw.todayNetHP === undefined) raw.todayNetHP = 0;
    if (raw.lastActiveDate === undefined) raw.lastActiveDate = new Date().toISOString().split('T')[0];
    raw.schemaVersion = CURRENT_SCHEMA_VERSION;
  }

  return raw as unknown as GameState;
}

/**
 * Validate all fields and fix any corrupted values.
 * Implementation Plan §10.5 validation rules.
 */
function validateState(state: GameState): GameState {
  // baseHealth
  if (typeof state.baseHealth !== 'number' || state.baseHealth < HP_MIN || state.baseHealth > HP_MAX) {
    state.baseHealth = HP_DEFAULT;
  }

  // streak
  if (typeof state.streak !== 'number' || state.streak < 0) {
    state.streak = 0;
  }

  // todayNetHP
  if (typeof state.todayNetHP !== 'number') {
    state.todayNetHP = 0;
  }

  // lastActiveDate
  if (typeof state.lastActiveDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(state.lastActiveDate)) {
    state.lastActiveDate = new Date().toISOString().split('T')[0];
  }

  // logs
  if (!Array.isArray(state.logs)) {
    state.logs = [];
  } else {
    // Filter out invalid log entries
    const validCategories = ['Transport', 'Food', 'Energy', 'Offset'];
    state.logs = state.logs.filter((log) => {
      if (!log || typeof log !== 'object') return false;
      if (typeof log.id !== 'string' || log.id.length === 0) return false;
      if (!validCategories.includes(log.category)) return false;
      if (typeof log.hpChange !== 'number') return false;
      return true;
    });
  }

  return state;
}

/**
 * Prune logs to MAX_LOG_ENTRIES, keeping newest.
 */
export function pruneLogsIfNeeded(state: GameState): GameState {
  if (state.logs.length > MAX_LOG_ENTRIES) {
    state.logs = state.logs.slice(-MAX_LOG_ENTRIES);
  }
  return state;
}
