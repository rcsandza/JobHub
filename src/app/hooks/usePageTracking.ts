/**
 * React hook to track page views
 * Tracks once per mount when enabled, resets when dependencies change
 */

import { useEffect, useRef } from 'react';
import { trackPageView } from '../lib/tracking';

interface JobContext {
  jobId?: string;
  jobSlug?: string;
  jobReferenceNumber?: string;
  jobTitle?: string;
  jobCompany?: string;
}

/**
 * Track page view when component mounts or dependencies change
 * @param pageName - Name of the page being viewed
 * @param jobContext - Optional job context data
 * @param enabled - Whether tracking is enabled (default: true)
 */
export function usePageTracking(
  pageName: string,
  jobContext?: JobContext,
  enabled: boolean = true
): void {
  const hasTracked = useRef(false);
  const lastSlug = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Reset tracking flag if job slug changes
    if (jobContext?.jobSlug !== lastSlug.current) {
      hasTracked.current = false;
      lastSlug.current = jobContext?.jobSlug;
    }

    // Track only once per mount/slug change when enabled
    if (enabled && !hasTracked.current) {
      hasTracked.current = true;
      trackPageView(pageName, jobContext);
    }
  }, [pageName, jobContext?.jobSlug, enabled]);
}
