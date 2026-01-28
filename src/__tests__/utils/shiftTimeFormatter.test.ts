import { describe, it, expect } from 'vitest';
import { formatDayRanges, formatShiftTimes, type DayOfWeek } from '@/utils/shiftTimeFormatter';

describe('formatDayRanges', () => {
  it('should format single day', () => {
    expect(formatDayRanges(['monday'])).toBe('Mon');
    expect(formatDayRanges(['friday'])).toBe('Fri');
  });

  it('should format consecutive days as range', () => {
    expect(formatDayRanges(['monday', 'tuesday', 'wednesday'])).toBe('Mon - Wed');
    expect(formatDayRanges(['thursday', 'friday'])).toBe('Thu - Fri');
  });

  it('should format non-consecutive days separately', () => {
    expect(formatDayRanges(['monday', 'wednesday', 'friday'])).toBe('Mon, Wed, Fri');
    expect(formatDayRanges(['monday', 'thursday'])).toBe('Mon, Thu');
  });

  it('should format mix of consecutive and non-consecutive days', () => {
    expect(formatDayRanges(['monday', 'tuesday', 'wednesday', 'friday', 'saturday'])).toBe(
      'Mon - Wed, Fri - Sat'
    );
    expect(formatDayRanges(['monday', 'wednesday', 'thursday', 'saturday'])).toBe(
      'Mon, Wed - Thu, Sat'
    );
  });
});

describe('formatShiftTimes', () => {
  it('should return null for null shifts', () => {
    expect(formatShiftTimes(null)).toEqual({ days: null, times: null });
  });

  it('should return null for empty shifts', () => {
    expect(formatShiftTimes({})).toEqual({ days: null, times: null });
  });

  it('should return null for shifts with empty strings', () => {
    expect(formatShiftTimes({ monday: '', tuesday: '   ' })).toEqual({ days: null, times: null });
  });

  it('should format "Every day" for all 7 days', () => {
    const shifts = {
      monday: 'Morning',
      tuesday: 'Morning',
      wednesday: 'Morning',
      thursday: 'Morning',
      friday: 'Morning',
      saturday: 'Morning',
      sunday: 'Morning',
    };
    const result = formatShiftTimes(shifts);
    expect(result.days).toBe('Every day');
    expect(result.times).toBe('Mornings');
  });

  it('should format "Weekdays" for Mon-Fri', () => {
    const shifts = {
      monday: 'Morning',
      tuesday: 'Morning',
      wednesday: 'Morning',
      thursday: 'Morning',
      friday: 'Morning',
    };
    const result = formatShiftTimes(shifts);
    expect(result.days).toBe('Weekdays');
    expect(result.times).toBe('Mornings');
  });

  it('should format "Weekends" for Sat-Sun', () => {
    const shifts = {
      saturday: 'Evening',
      sunday: 'Evening',
    };
    const result = formatShiftTimes(shifts);
    expect(result.days).toBe('Weekends');
    expect(result.times).toBe('Evenings');
  });

  it('should format day ranges for other combinations', () => {
    const shifts = {
      monday: 'Morning',
      tuesday: 'Morning',
      thursday: 'Morning',
    };
    const result = formatShiftTimes(shifts);
    expect(result.days).toBe('Mon - Tue, Thu');
  });

  it('should format single time period', () => {
    const shifts = {
      monday: 'Morning',
      tuesday: 'Morning',
    };
    const result = formatShiftTimes(shifts);
    expect(result.times).toBe('Mornings');
  });

  it('should format two time periods', () => {
    const shifts = {
      monday: 'Morning, Afternoon',
      tuesday: 'Morning',
    };
    const result = formatShiftTimes(shifts);
    expect(result.times).toBe('Mornings and afternoons');
  });

  it('should format three time periods', () => {
    const shifts = {
      monday: 'Morning, Afternoon, Evening',
      tuesday: 'Morning',
    };
    const result = formatShiftTimes(shifts);
    expect(result.times).toBe('Mornings, afternoons, and evenings');
  });

  it('should parse comma-separated times', () => {
    const shifts = {
      monday: 'Morning, Evening',
      tuesday: 'Afternoon',
    };
    const result = formatShiftTimes(shifts);
    expect(result.times).toBe('Mornings, afternoons, and evenings');
  });

  it('should handle times with extra whitespace', () => {
    const shifts = {
      monday: ' Morning , Evening ',
      tuesday: '  Afternoon  ',
    };
    const result = formatShiftTimes(shifts);
    expect(result.times).toBe('Mornings, afternoons, and evenings');
  });

  it('should sort times in correct order', () => {
    const shifts = {
      monday: 'Evening, Morning',
      tuesday: 'Afternoon',
    };
    const result = formatShiftTimes(shifts);
    // Should be ordered Morning, Afternoon, Evening
    expect(result.times).toBe('Mornings, afternoons, and evenings');
  });
});
