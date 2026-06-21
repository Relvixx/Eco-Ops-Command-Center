import { describe, it, expect } from 'vitest';
import { computeStreak } from '../src/utils/streakEngine';

describe('streakEngine', () => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const twoDaysAgo = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0];

  it('resets streak to 0 if todayNetHP is negative', () => {
    expect(computeStreak(5, yesterday, -10)).toBe(0);
  });

  it('resets streak to 0 if todayNetHP is zero', () => {
    expect(computeStreak(5, yesterday, 0)).toBe(0);
  });

  it('maintains streak on same day activity', () => {
    expect(computeStreak(3, today, 10)).toBe(3);
  });

  it('starts streak at 1 on first ever positive activity today', () => {
    expect(computeStreak(0, today, 10)).toBe(1);
  });

  it('increments streak if active yesterday and positive today', () => {
    expect(computeStreak(3, yesterday, 10)).toBe(4);
  });

  it('resets streak to 1 if day was skipped', () => {
    expect(computeStreak(3, twoDaysAgo, 10)).toBe(1);
  });
});
