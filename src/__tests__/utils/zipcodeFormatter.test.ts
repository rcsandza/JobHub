import { describe, it, expect } from 'vitest';
import { formatZipcode } from '@/utils/zipcodeFormatter';

describe('formatZipcode', () => {
  it('should format empty string', () => {
    expect(formatZipcode('')).toBe('');
  });

  it('should format partial zipcodes', () => {
    expect(formatZipcode('1')).toBe('1');
    expect(formatZipcode('12')).toBe('12');
    expect(formatZipcode('123')).toBe('123');
    expect(formatZipcode('1234')).toBe('1234');
  });

  it('should format full 5-digit zipcodes', () => {
    expect(formatZipcode('12345')).toBe('12345');
  });

  it('should limit to 5 digits', () => {
    expect(formatZipcode('123456')).toBe('12345');
    expect(formatZipcode('1234567890')).toBe('12345');
  });

  it('should strip non-digit characters', () => {
    expect(formatZipcode('12-345')).toBe('12345');
    expect(formatZipcode('12 345')).toBe('12345');
    expect(formatZipcode('abc12345')).toBe('12345');
    expect(formatZipcode('12345-6789')).toBe('12345');
  });

  it('should handle special characters', () => {
    expect(formatZipcode('!@#$%')).toBe('');
    expect(formatZipcode('A1B2C3')).toBe('123');
  });
});
