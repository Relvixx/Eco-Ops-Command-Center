import { describe, it, expect } from 'vitest';
import { applyHPChange, scaleHPByDistance, getHPState } from '../../src/utils/hpCalculator';

describe('applyHPChange', () => {
  it('applies standard negative change', () => {
    expect(applyHPChange(100, -6)).toBe(94);
  });
  it('clamps at 0 — never goes negative', () => {
    expect(applyHPChange(5, -20)).toBe(0);
  });
  it('clamps at 150 — never exceeds max', () => {
    expect(applyHPChange(140, +20)).toBe(150);
  });
  it('applies positive change correctly', () => {
    expect(applyHPChange(60, +15)).toBe(75);
  });
});

describe('getHPState', () => {
  it('returns OPTIMAL above 100', () => {
    expect(getHPState(101)).toBe('OPTIMAL');
    expect(getHPState(150)).toBe('OPTIMAL');
  });
  it('returns OPERATIONAL at 75–100', () => {
    expect(getHPState(100)).toBe('OPERATIONAL');
    expect(getHPState(75)).toBe('OPERATIONAL');
  });
  it('returns UNDER_THREAT at 40–74', () => {
    expect(getHPState(74)).toBe('UNDER_THREAT');
    expect(getHPState(40)).toBe('UNDER_THREAT');
  });
  it('returns CRITICAL at 1–39', () => {
    expect(getHPState(39)).toBe('CRITICAL');
    expect(getHPState(1)).toBe('CRITICAL');
  });
  it('returns DESTROYED at exactly 0', () => {
    expect(getHPState(0)).toBe('DESTROYED');
  });
});

describe('scaleHPByDistance', () => {
  it('scales correctly for 3 units of 10km', () => {
    expect(scaleHPByDistance(-6, 30)).toBe(-18);
  });
  it('rounds correctly for fractional units', () => {
    expect(scaleHPByDistance(-6, 5)).toBe(-3);
  });
  it('handles positive hpChange (cycling)', () => {
    expect(scaleHPByDistance(3, 20)).toBe(6);
  });
});
