import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getVisitorId, getSessionId, getTrackingIds } from '@/app/lib/visitor';

describe('visitor', () => {
  beforeEach(() => {
    // Clear storage before each test
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('getVisitorId', () => {
    it('should generate and store visitor ID on first call', () => {
      const visitorId = getVisitorId();

      expect(visitorId).toBeTruthy();
      expect(visitorId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(localStorage.getItem('jobhub_visitor_id')).toBe(visitorId);
    });

    it('should return same visitor ID on subsequent calls', () => {
      const firstId = getVisitorId();
      const secondId = getVisitorId();
      const thirdId = getVisitorId();

      expect(secondId).toBe(firstId);
      expect(thirdId).toBe(firstId);
    });

    it('should use existing visitor ID from localStorage', () => {
      const existingId = 'existing-uuid-1234';
      localStorage.setItem('jobhub_visitor_id', existingId);

      const visitorId = getVisitorId();

      expect(visitorId).toBe(existingId);
    });

    it('should handle localStorage unavailable', () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      const originalGetItem = localStorage.getItem;

      localStorage.getItem = vi.fn().mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      const visitorId = getVisitorId();

      // Should still return a valid UUID (ephemeral)
      expect(visitorId).toBeTruthy();
      expect(visitorId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

      // Restore
      localStorage.setItem = originalSetItem;
      localStorage.getItem = originalGetItem;
    });
  });

  describe('getSessionId', () => {
    it('should generate and store session ID on first call', () => {
      const sessionId = getSessionId();

      expect(sessionId).toBeTruthy();
      expect(sessionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(sessionStorage.getItem('jobhub_session_id')).toBe(sessionId);
    });

    it('should return same session ID on subsequent calls', () => {
      const firstId = getSessionId();
      const secondId = getSessionId();
      const thirdId = getSessionId();

      expect(secondId).toBe(firstId);
      expect(thirdId).toBe(firstId);
    });

    it('should use existing session ID from sessionStorage', () => {
      const existingId = 'existing-session-1234';
      sessionStorage.setItem('jobhub_session_id', existingId);

      const sessionId = getSessionId();

      expect(sessionId).toBe(existingId);
    });

    it('should handle sessionStorage unavailable', () => {
      // Mock sessionStorage to throw error
      const originalSetItem = sessionStorage.setItem;
      const originalGetItem = sessionStorage.getItem;

      sessionStorage.getItem = vi.fn().mockImplementation(() => {
        throw new Error('sessionStorage unavailable');
      });

      const sessionId = getSessionId();

      // Should still return a valid UUID (ephemeral)
      expect(sessionId).toBeTruthy();
      expect(sessionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

      // Restore
      sessionStorage.setItem = originalSetItem;
      sessionStorage.getItem = originalGetItem;
    });
  });

  describe('getTrackingIds', () => {
    it('should return both visitor and session IDs', () => {
      const ids = getTrackingIds();

      expect(ids).toHaveProperty('visitorId');
      expect(ids).toHaveProperty('sessionId');
      expect(ids.visitorId).toBeTruthy();
      expect(ids.sessionId).toBeTruthy();
    });

    it('should return consistent IDs across calls', () => {
      const ids1 = getTrackingIds();
      const ids2 = getTrackingIds();

      expect(ids2.visitorId).toBe(ids1.visitorId);
      expect(ids2.sessionId).toBe(ids1.sessionId);
    });

    it('should have different visitor and session IDs', () => {
      const ids = getTrackingIds();

      expect(ids.visitorId).not.toBe(ids.sessionId);
    });
  });
});
