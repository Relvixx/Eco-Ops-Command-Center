import { describe, it, expect } from 'vitest';
import { applyHPChange, scaleHPByDistance, getHPState } from '../src/utils/hpCalculator';

describe('hpCalculator', () => {
  describe('applyHPChange', () => {
    it('applies negative damage correctly', () => {
      expect(applyHPChange(100, -6)).toBe(94);
    });

    it('applies positive healing correctly', () => {
      expect(applyHPChange(100, 15)).toBe(115);
    });

    it('clamps to minimum 0', () => {
      expect(applyHPChange(5, -10)).toBe(0);
    });

    it('clamps to maximum 150', () => {
      expect(applyHPChange(145, 10)).toBe(150);
    });
  });

  describe('scaleHPByDistance', () => {
    it('returns base if km <= 0', () => {
      expect(scaleHPByDistance(-6, 0)).toBe(-6);
      expect(scaleHPByDistance(-6, -10)).toBe(-6);
    });

    it('treats 1-14km as 1 unit', () => {
      expect(scaleHPByDistance(-6, 5)).toBe(-6);
      expect(scaleHPByDistance(-6, 14)).toBe(-6);
    });

    it('treats 15-24km as 2 units', () => {
      expect(scaleHPByDistance(-6, 15)).toBe(-12);
      expect(scaleHPByDistance(-6, 20)).toBe(-12);
    });

    it('scales large distances correctly (500km = 50 units)', () => {
      expect(scaleHPByDistance(-6, 500)).toBe(-300);
    });
  });

  describe('getHPState', () => {
    it('returns OPTIMAL for >= 101', () => {
      expect(getHPState(101)).toBe('OPTIMAL');
      expect(getHPState(150)).toBe('OPTIMAL');
    });

    it('returns OPERATIONAL for 75-100', () => {
      expect(getHPState(100)).toBe('OPERATIONAL');
      expect(getHPState(75)).toBe('OPERATIONAL');
    });

    it('returns UNDER_THREAT for 40-74', () => {
      expect(getHPState(74)).toBe('UNDER_THREAT');
      expect(getHPState(40)).toBe('UNDER_THREAT');
    });

    it('returns CRITICAL for 1-39', () => {
      expect(getHPState(39)).toBe('CRITICAL');
      expect(getHPState(1)).toBe('CRITICAL');
    });

    it('returns DESTROYED for 0', () => {
      expect(getHPState(0)).toBe('DESTROYED');
    });
  });
});
