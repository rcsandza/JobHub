import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isWithinDays, isNewPosting, daysSince } from '@/utils/dateUtils';

describe('dateUtils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('isWithinDays', () => {
    it('should return true for date within specified days', () => {
      vi.setSystemTime(new Date('2024-01-15'));

      expect(isWithinDays('2024-01-10', 7)).toBe(true); // 5 days ago
      expect(isWithinDays('2024-01-14', 7)).toBe(true); // 1 day ago
      expect(isWithinDays('2024-01-15', 7)).toBe(true); // today
    });

    it('should return false for date outside specified days', () => {
      vi.setSystemTime(new Date('2024-01-15'));

      expect(isWithinDays('2024-01-01', 7)).toBe(false); // 14 days ago
      expect(isWithinDays('2024-01-07', 7)).toBe(false); // 8 days ago
    });

    it('should work with Date objects', () => {
      vi.setSystemTime(new Date('2024-01-15'));

      expect(isWithinDays(new Date('2024-01-10'), 7)).toBe(true);
      expect(isWithinDays(new Date('2024-01-01'), 7)).toBe(false);
    });
  });

  describe('isNewPosting', () => {
    it('should return true for postings within last 7 days', () => {
      vi.setSystemTime(new Date('2024-01-15'));

      expect(isNewPosting('2024-01-15')).toBe(true); // today
      expect(isNewPosting('2024-01-14')).toBe(true); // 1 day ago
      expect(isNewPosting('2024-01-10')).toBe(true); // 5 days ago
      expect(isNewPosting('2024-01-09')).toBe(true); // 6 days ago
      expect(isNewPosting('2024-01-08')).toBe(true); // 7 days ago
    });

    it('should return false for postings older than 7 days', () => {
      vi.setSystemTime(new Date('2024-01-15'));

      expect(isNewPosting('2024-01-07')).toBe(false); // 8 days ago
      expect(isNewPosting('2024-01-01')).toBe(false); // 14 days ago
      expect(isNewPosting('2023-12-01')).toBe(false); // 45 days ago
    });

    it('should return false for null or undefined', () => {
      expect(isNewPosting(null)).toBe(false);
      expect(isNewPosting(undefined)).toBe(false);
    });

    it('should work with Date objects', () => {
      vi.setSystemTime(new Date('2024-01-15'));

      expect(isNewPosting(new Date('2024-01-10'))).toBe(true);
      expect(isNewPosting(new Date('2024-01-01'))).toBe(false);
    });
  });

  describe('daysSince', () => {
    it('should calculate days since date', () => {
      vi.setSystemTime(new Date('2024-01-15'));

      expect(daysSince('2024-01-15')).toBe(0); // today
      expect(daysSince('2024-01-14')).toBe(1); // 1 day ago
      expect(daysSince('2024-01-10')).toBe(5); // 5 days ago
      expect(daysSince('2024-01-01')).toBe(14); // 14 days ago
    });

    it('should work with Date objects', () => {
      vi.setSystemTime(new Date('2024-01-15'));

      expect(daysSince(new Date('2024-01-10'))).toBe(5);
      expect(daysSince(new Date('2024-01-01'))).toBe(14);
    });

    it('should floor partial days', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00'));

      expect(daysSince('2024-01-14T14:00:00')).toBe(0); // 22 hours ago
      expect(daysSince('2024-01-14T10:00:00')).toBe(1); // 26 hours ago
    });
  });
});
