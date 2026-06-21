import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  initState, 
  loadState, 
  saveState, 
  clearState, 
  migrateIfNeeded, 
  pruneLogsIfNeeded 
} from '../src/utils/storageManager';

describe('storageManager', () => {
  beforeEach(() => {
    localStorage.clear();
    // Mock Date for stable testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-05-15T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initState creates a valid cold boot state', () => {
    const state = initState();
    expect(state.schemaVersion).toBe(1);
    expect(state.baseHealth).toBe(100);
    expect(state.streak).toBe(0);
    expect(state.todayNetHP).toBe(0);
    expect(state.lastActiveDate).toBe('2024-05-15');
    expect(state.logs).toEqual([]);
  });

  it('loadState returns null if storage is empty', () => {
    expect(loadState()).toBeNull();
  });

  it('saveState and loadState work correctly', () => {
    const state = initState();
    state.baseHealth = 80;
    saveState(state);
    
    const loaded = loadState();
    expect(loaded?.baseHealth).toBe(80);
  });

  it('clearState wipes storage', () => {
    const state = initState();
    saveState(state);
    expect(loadState()).not.toBeNull();
    
    clearState();
    expect(loadState()).toBeNull();
  });

  it('migrateIfNeeded adds missing fields from v0', () => {
    const v0State = {
      baseHealth: 70,
      streak: 5,
      logs: []
    };
    
    const migrated = migrateIfNeeded(v0State);
    expect(migrated.schemaVersion).toBe(1);
    expect(migrated.todayNetHP).toBe(0);
    expect(migrated.lastActiveDate).toBe('2024-05-15');
  });

  it('loadState fixes invalid data via validateState', () => {
    const corruptState = {
      schemaVersion: 1,
      baseHealth: 999, // Invalid
      streak: -5,      // Invalid
      todayNetHP: 'a lot', // Invalid type
      lastActiveDate: 'invalid-date', // Invalid format
      logs: [{ id: '1', invalid: true }] // Invalid log
    };
    
    localStorage.setItem('eco_ops_v1', JSON.stringify(corruptState));
    
    const loaded = loadState();
    expect(loaded).toBeDefined();
    expect(loaded?.baseHealth).toBe(100); // Reset to default
    expect(loaded?.streak).toBe(0); // Reset to 0
    expect(loaded?.todayNetHP).toBe(0); // Reset to 0
    expect(loaded?.lastActiveDate).toBe('2024-05-15'); // Reset to today
    expect(loaded?.logs).toEqual([]); // Pruned invalid log
  });

  it('pruneLogsIfNeeded caps at 100 entries', () => {
    const state = initState();
    state.logs = Array.from({ length: 150 }).map((_, i) => ({
      id: String(i),
      timestamp: new Date().toISOString(),
      category: 'Transport',
      action: 'Test',
      hpChange: -1,
      aiTip: '',
      tipSource: 'fallback'
    }));

    const pruned = pruneLogsIfNeeded(state);
    expect(pruned.logs.length).toBe(100);
    // Should keep the newest (highest indices, assuming push/unshift semantics)
    // Actually slice(-100) keeps the last 100 items of the array.
    expect(pruned.logs[0].id).toBe('50'); 
    expect(pruned.logs[99].id).toBe('149');
  });
});
