import { describe, it, expect } from 'vitest';
import { formatPhoneNumber } from '@/utils/phoneFormatter';

describe('formatPhoneNumber', () => {
  it('should format empty string', () => {
    expect(formatPhoneNumber('')).toBe('');
  });

  it('should format partial phone numbers', () => {
    expect(formatPhoneNumber('1')).toBe('1');
    expect(formatPhoneNumber('12')).toBe('12');
    expect(formatPhoneNumber('123')).toBe('123');
  });

  it('should format phone numbers with 4-6 digits', () => {
    expect(formatPhoneNumber('1234')).toBe('123-4');
    expect(formatPhoneNumber('12345')).toBe('123-45');
    expect(formatPhoneNumber('123456')).toBe('123-456');
  });

  it('should format full phone numbers', () => {
    expect(formatPhoneNumber('1234567')).toBe('123-456-7');
    expect(formatPhoneNumber('12345678')).toBe('123-456-78');
    expect(formatPhoneNumber('123456789')).toBe('123-456-789');
    expect(formatPhoneNumber('1234567890')).toBe('123-456-7890');
  });

  it('should strip non-digit characters', () => {
    expect(formatPhoneNumber('(123) 456-7890')).toBe('123-456-7890');
    expect(formatPhoneNumber('123.456.7890')).toBe('123-456-7890');
    expect(formatPhoneNumber('123 456 7890')).toBe('123-456-7890');
    expect(formatPhoneNumber('abc123def456ghi7890')).toBe('123-456-7890');
  });

  it('should limit to 10 digits', () => {
    expect(formatPhoneNumber('12345678901')).toBe('123-456-7890');
    expect(formatPhoneNumber('123456789012345')).toBe('123-456-7890');
  });

  it('should handle special characters', () => {
    expect(formatPhoneNumber('!@#$%^&*()')).toBe('');
    expect(formatPhoneNumber('555-CALL-NOW')).toBe('555');
  });
});
