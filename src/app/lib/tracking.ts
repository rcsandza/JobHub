/**
 * Core tracking functions for event analytics
 * Sends events to Supabase events table
 */

import { supabase } from './supabase';
import { getTrackingIds } from './visitor';

interface JobContext {
  jobId?: string;
  jobSlug?: string;
  jobReferenceNumber?: string;
  jobTitle?: string;
  jobCompany?: string;
}

interface TrackingPayload {
  event_type: string;
  event_name: string;
  page_url?: string;
  page_path?: string;
  referrer?: string;
  job_id?: string;
  job_slug?: string;
  job_reference_number?: string;
  job_title?: string;
  job_company?: string;
  user_agent?: string;
  screen_width?: number;
  screen_height?: number;
  metadata?: Record<string, any>;
}

/**
 * Get browser context information
 */
function getBrowserContext() {
  return {
    page_url: window.location.href,
    page_path: window.location.pathname,
    referrer: document.referrer || undefined,
    user_agent: navigator.userAgent,
    screen_width: window.screen.width,
    screen_height: window.screen.height,
  };
}

/**
 * Send event to Supabase (non-blocking)
 */
export async function trackEvent(payload: TrackingPayload): Promise<void> {
  try {
    const { visitorId, sessionId } = getTrackingIds();
    const browserContext = getBrowserContext();

    const eventData = {
      visitor_id: visitorId,
      session_id: sessionId,
      ...browserContext,
      ...payload,
    };

    // Non-blocking insert
    const { error } = await supabase.from('events').insert(eventData);

    if (error) {
      console.error('Failed to track event:', error);
    }
  } catch (error) {
    // Never block user flow on tracking errors
    console.error('Tracking error:', error);
  }
}

/**
 * Track a page view event
 */
export function trackPageView(
  pageName: string,
  jobContext?: JobContext,
  metadata?: Record<string, any>
): Promise<void> {
  return trackEvent({
    event_type: 'page_view',
    event_name: pageName,
    job_id: jobContext?.jobId,
    job_slug: jobContext?.jobSlug,
    job_reference_number: jobContext?.jobReferenceNumber,
    job_title: jobContext?.jobTitle,
    job_company: jobContext?.jobCompany,
    metadata,
  });
}

/**
 * Track a button click event
 */
export function trackButtonClick(
  buttonName: string,
  jobContext?: JobContext,
  metadata?: Record<string, any>
): Promise<void> {
  return trackEvent({
    event_type: 'button_click',
    event_name: buttonName,
    job_id: jobContext?.jobId,
    job_slug: jobContext?.jobSlug,
    job_reference_number: jobContext?.jobReferenceNumber,
    job_title: jobContext?.jobTitle,
    job_company: jobContext?.jobCompany,
    metadata,
  });
}
