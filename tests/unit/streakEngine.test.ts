import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { computeStreak } from '../../src/utils/streakEngine';

describe('computeStreak', () => {
  const FIXED_TODAY = '2025-06-21';
  const FIXED_YESTERDAY = '2025-06-20';
  const FIXED_TWO_DAYS_AGO = '2025-06-19';

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-21T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('same day with positive net HP — streak stays at least 1', () => {
    const result = computeStreak(3, FIXED_TODAY, +5);
    expect(result.streak).toBe(3);
    expect(result.lastActiveDate).toBe(FIXED_TODAY);
  });

  it('consecutive day with positive net HP — streak increments', () => {
    const result = computeStreak(3, FIXED_YESTERDAY, +5);
    expect(result.streak).toBe(4);
  });

  it('consecutive day with negative net HP — streak resets', () => {
    const result = computeStreak(3, FIXED_YESTERDAY, -5);
    expect(result.streak).toBe(0);
  });

  it('missed day with positive HP — streak resets to 1', () => {
    const result = computeStreak(5, FIXED_TWO_DAYS_AGO, +5);
    expect(result.streak).toBe(1);
  });

  it('missed day with negative HP — streak is 0', () => {
    const result = computeStreak(5, FIXED_TWO_DAYS_AGO, -5);
    expect(result.streak).toBe(0);
  });
});
