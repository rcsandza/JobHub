import { describe, it, expect } from 'vitest';
import { formatWage } from '@/utils/wageFormatter';

describe('formatWage', () => {
  it('should return "Competitive salary" when minWage is null', () => {
    expect(formatWage({ minWage: null })).toBe('Competitive salary');
  });

  it('should return "Competitive salary" when minWage is undefined', () => {
    expect(formatWage({ minWage: undefined })).toBe('Competitive salary');
  });

  it('should format hourly rate (< $1000)', () => {
    expect(formatWage({ minWage: 15 })).toBe('$15+ per hour');
    expect(formatWage({ minWage: 20 })).toBe('$20+ per hour');
    expect(formatWage({ minWage: 999 })).toBe('$999+ per hour');
  });

  it('should format hourly range (< $1000)', () => {
    expect(formatWage({ minWage: 15, maxWage: 20 })).toBe('$15 - $20 per hour');
    expect(formatWage({ minWage: 18, maxWage: 25 })).toBe('$18 - $25 per hour');
  });

  it('should format yearly salary (>= $1000)', () => {
    expect(formatWage({ minWage: 1000 })).toBe('$1,000+ per year');
    expect(formatWage({ minWage: 50000 })).toBe('$50,000+ per year');
    expect(formatWage({ minWage: 100000 })).toBe('$100,000+ per year');
  });

  it('should format yearly range (>= $1000)', () => {
    expect(formatWage({ minWage: 50000, maxWage: 70000 })).toBe('$50,000 - $70,000 per year');
    expect(formatWage({ minWage: 80000, maxWage: 120000 })).toBe('$80,000 - $120,000 per year');
  });

  it('should handle edge case at $1000 threshold', () => {
    expect(formatWage({ minWage: 999 })).toBe('$999+ per hour');
    expect(formatWage({ minWage: 1000 })).toBe('$1,000+ per year');
  });

  it('should handle zero wage', () => {
    expect(formatWage({ minWage: 0 })).toBe('Competitive salary');
  });

  it('should ignore maxWage if minWage is not provided', () => {
    expect(formatWage({ minWage: null, maxWage: 100000 })).toBe('Competitive salary');
  });

  it('should handle decimal values', () => {
    expect(formatWage({ minWage: 15.5, maxWage: 20.5 })).toBe('$15.5 - $20.5 per hour');
    expect(formatWage({ minWage: 52500, maxWage: 67500 })).toBe('$52,500 - $67,500 per year');
  });
});
