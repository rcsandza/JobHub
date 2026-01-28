import { describe, it, expect, beforeEach, vi } from 'vitest';
import { trackEvent, trackPageView, trackButtonClick } from '@/app/lib/tracking';

// Mock dependencies
vi.mock('@/app/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve({ error: null })),
    })),
  },
}));

vi.mock('@/app/lib/visitor', () => ({
  getTrackingIds: vi.fn(() => ({
    visitorId: 'test-visitor-id',
    sessionId: 'test-session-id',
  })),
}));

describe('tracking', () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('trackEvent', () => {
    it('should track event with basic payload', async () => {
      const { supabase } = await import('@/app/lib/supabase');
      const insertMock = vi.fn(() => Promise.resolve({ error: null }));
      const fromMock = vi.fn(() => ({ insert: insertMock }));
      (supabase.from as any) = fromMock;

      await trackEvent({
        event_type: 'page_view',
        event_name: 'Home Page',
      });

      expect(fromMock).toHaveBeenCalledWith('events');
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          visitor_id: 'test-visitor-id',
          session_id: 'test-session-id',
          event_type: 'page_view',
          event_name: 'Home Page',
          page_url: expect.any(String),
          page_path: expect.any(String),
          user_agent: expect.any(String),
          screen_width: expect.any(Number),
          screen_height: expect.any(Number),
        })
      );
    });

    it('should track event with job context', async () => {
      const { supabase } = await import('@/app/lib/supabase');
      const insertMock = vi.fn(() => Promise.resolve({ error: null }));
      const fromMock = vi.fn(() => ({ insert: insertMock }));
      (supabase.from as any) = fromMock;

      await trackEvent({
        event_type: 'page_view',
        event_name: 'Job Detail',
        job_id: 'job-123',
        job_slug: 'software-engineer',
        job_reference_number: 'REF-123',
        job_title: 'Software Engineer',
        job_company: 'Tech Corp',
      });

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          job_id: 'job-123',
          job_slug: 'software-engineer',
          job_reference_number: 'REF-123',
          job_title: 'Software Engineer',
          job_company: 'Tech Corp',
        })
      );
    });

    it('should track event with metadata', async () => {
      const { supabase } = await import('@/app/lib/supabase');
      const insertMock = vi.fn(() => Promise.resolve({ error: null }));
      const fromMock = vi.fn(() => ({ insert: insertMock }));
      (supabase.from as any) = fromMock;

      await trackEvent({
        event_type: 'button_click',
        event_name: 'Apply Button',
        metadata: { hasResume: true, source: 'mobile' },
      });

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { hasResume: true, source: 'mobile' },
        })
      );
    });

    it('should handle Supabase errors gracefully', async () => {
      const { supabase } = await import('@/app/lib/supabase');
      const insertMock = vi.fn(() =>
        Promise.resolve({ error: { message: 'Database error' } })
      );
      const fromMock = vi.fn(() => ({ insert: insertMock }));
      (supabase.from as any) = fromMock;

      await trackEvent({
        event_type: 'page_view',
        event_name: 'Test',
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to track event:',
        expect.any(Object)
      );
    });

    it('should handle exceptions gracefully', async () => {
      const { supabase } = await import('@/app/lib/supabase');
      const fromMock = vi.fn(() => {
        throw new Error('Network error');
      });
      (supabase.from as any) = fromMock;

      await trackEvent({
        event_type: 'page_view',
        event_name: 'Test',
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Tracking error:',
        expect.any(Error)
      );
    });
  });

  describe('trackPageView', () => {
    it('should track page view without job context', async () => {
      const { supabase } = await import('@/app/lib/supabase');
      const insertMock = vi.fn(() => Promise.resolve({ error: null }));
      const fromMock = vi.fn(() => ({ insert: insertMock }));
      (supabase.from as any) = fromMock;

      await trackPageView('Home Page');

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'page_view',
          event_name: 'Home Page',
        })
      );
    });

    it('should track page view with job context', async () => {
      const { supabase } = await import('@/app/lib/supabase');
      const insertMock = vi.fn(() => Promise.resolve({ error: null }));
      const fromMock = vi.fn(() => ({ insert: insertMock }));
      (supabase.from as any) = fromMock;

      await trackPageView('Job Detail', {
        jobId: 'job-123',
        jobSlug: 'software-engineer',
        jobTitle: 'Software Engineer',
      });

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'page_view',
          event_name: 'Job Detail',
          job_id: 'job-123',
          job_slug: 'software-engineer',
          job_title: 'Software Engineer',
        })
      );
    });
  });

  describe('trackButtonClick', () => {
    it('should track button click without job context', async () => {
      const { supabase } = await import('@/app/lib/supabase');
      const insertMock = vi.fn(() => Promise.resolve({ error: null }));
      const fromMock = vi.fn(() => ({ insert: insertMock }));
      (supabase.from as any) = fromMock;

      await trackButtonClick('Search Button');

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'button_click',
          event_name: 'Search Button',
        })
      );
    });

    it('should track button click with job context and metadata', async () => {
      const { supabase } = await import('@/app/lib/supabase');
      const insertMock = vi.fn(() => Promise.resolve({ error: null }));
      const fromMock = vi.fn(() => ({ insert: insertMock }));
      (supabase.from as any) = fromMock;

      await trackButtonClick(
        'Apply Button',
        {
          jobId: 'job-123',
          jobCompany: 'Tech Corp',
        },
        { hasResume: true }
      );

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'button_click',
          event_name: 'Apply Button',
          job_id: 'job-123',
          job_company: 'Tech Corp',
          metadata: { hasResume: true },
        })
      );
    });
  });
});
