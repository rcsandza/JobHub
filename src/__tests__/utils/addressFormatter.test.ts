import { describe, it, expect } from 'vitest';
import { formatAddress } from '@/utils/addressFormatter';

describe('formatAddress', () => {
  it('should use address field when available', () => {
    const input = {
      address: '123 Main St\nNew York, NY 10001',
      postal_code: '12345',
    };
    expect(formatAddress(input)).toBe('123 Main St\nNew York, NY 10001');
  });

  it('should prioritize address field over extra fields', () => {
    const input = {
      address: '123 Main St\nNew York, NY 10001',
      extra: {
        street_address: '456 Other St',
        city: 'Boston',
        state: 'MA',
      },
      postal_code: '02101',
    };
    expect(formatAddress(input)).toBe('123 Main St\nNew York, NY 10001');
  });

  it('should build address from extra fields when address is not provided', () => {
    const input = {
      extra: {
        street_address: '123 Main St',
        city: 'New York',
        state: 'NY',
      },
      postal_code: '10001',
    };
    expect(formatAddress(input)).toBe('123 Main St\nNew York, NY, 10001');
  });

  it('should handle missing street address', () => {
    const input = {
      extra: {
        city: 'New York',
        state: 'NY',
      },
      postal_code: '10001',
    };
    expect(formatAddress(input)).toBe('New York, NY, 10001');
  });

  it('should handle missing city', () => {
    const input = {
      extra: {
        street_address: '123 Main St',
        state: 'NY',
      },
      postal_code: '10001',
    };
    expect(formatAddress(input)).toBe('123 Main St\nNY, 10001');
  });

  it('should handle missing state', () => {
    const input = {
      extra: {
        street_address: '123 Main St',
        city: 'New York',
      },
      postal_code: '10001',
    };
    expect(formatAddress(input)).toBe('123 Main St\nNew York, 10001');
  });

  it('should handle only postal code', () => {
    const input = {
      postal_code: '10001',
    };
    expect(formatAddress(input)).toBe('10001');
  });

  it('should handle empty extra object', () => {
    const input = {
      extra: {},
      postal_code: '10001',
    };
    expect(formatAddress(input)).toBe('10001');
  });

  it('should return default message when no address data', () => {
    expect(formatAddress({})).toBe('Location not specified');
    expect(formatAddress({ extra: {} })).toBe('Location not specified');
  });

  it('should handle null values', () => {
    const input = {
      address: null,
      extra: {
        street_address: null,
        city: null,
        state: null,
      },
      postal_code: null,
    };
    expect(formatAddress(input)).toBe('Location not specified');
  });

  it('should handle partial extra data', () => {
    const input = {
      extra: {
        city: 'New York',
      },
    };
    expect(formatAddress(input)).toBe('New York');
  });
});
