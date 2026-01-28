import { vi } from 'vitest';

/**
 * Mock Supabase client for testing
 * Provides chainable query builder methods
 */

interface MockQueryBuilder {
  from: (table: string) => MockQueryBuilder;
  select: (columns?: string, options?: any) => MockQueryBuilder;
  eq: (column: string, value: any) => MockQueryBuilder;
  ilike: (column: string, pattern: string) => MockQueryBuilder;
  order: (column: string, options?: any) => MockQueryBuilder;
  range: (from: number, to: number) => MockQueryBuilder;
  single: () => Promise<{ data: any; error: any }>;
  then: (resolve: (value: any) => void, reject?: (error: any) => void) => Promise<any>;
}

let mockData: any = null;
let mockError: any = null;
let mockCount: number | null = null;

class MockSupabaseQueryBuilder implements MockQueryBuilder {
  private table: string = '';

  from(table: string): MockQueryBuilder {
    this.table = table;
    return this;
  }

  select(columns?: string, options?: any): MockQueryBuilder {
    return this;
  }

  eq(column: string, value: any): MockQueryBuilder {
    return this;
  }

  ilike(column: string, pattern: string): MockQueryBuilder {
    return this;
  }

  order(column: string, options?: any): MockQueryBuilder {
    return this;
  }

  range(from: number, to: number): MockQueryBuilder {
    return this;
  }

  async single(): Promise<{ data: any; error: any }> {
    return Promise.resolve({ data: mockData, error: mockError });
  }

  async then(resolve: (value: any) => void, reject?: (error: any) => void): Promise<any> {
    const result = {
      data: mockData,
      error: mockError,
      count: mockCount,
    };

    if (mockError && reject) {
      return Promise.reject(mockError).catch(reject);
    }

    return Promise.resolve(result).then(resolve);
  }
}

export const mockSupabaseClient = {
  from: (table: string) => new MockSupabaseQueryBuilder().from(table),
};

/**
 * Set mock data for the next query
 */
export function mockResolvedData(data: any, count?: number) {
  mockData = data;
  mockError = null;
  mockCount = count ?? null;
}

/**
 * Set mock error for the next query
 */
export function mockResolvedError(error: any) {
  mockData = null;
  mockError = error;
  mockCount = null;
}

/**
 * Reset all mocks to initial state
 */
export function resetSupabaseMock() {
  mockData = null;
  mockError = null;
  mockCount = null;
}

// Export the mock as the default supabase client
export const supabase = mockSupabaseClient;
