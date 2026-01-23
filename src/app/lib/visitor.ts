/**
 * Visitor identification using browser storage
 * - visitor_id: persistent across browser sessions (localStorage)
 * - session_id: resets when browser closes (sessionStorage)
 */

const VISITOR_ID_KEY = 'jobhub_visitor_id';
const SESSION_ID_KEY = 'jobhub_session_id';

/**
 * Generate a simple UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create visitor ID (persistent across browser sessions)
 */
export function getVisitorId(): string {
  try {
    let visitorId = localStorage.getItem(VISITOR_ID_KEY);
    if (!visitorId) {
      visitorId = generateUUID();
      localStorage.setItem(VISITOR_ID_KEY, visitorId);
    }
    return visitorId;
  } catch (error) {
    // Private browsing or localStorage unavailable - generate ephemeral ID
    console.warn('localStorage unavailable, using ephemeral visitor ID:', error);
    return generateUUID();
  }
}

/**
 * Get or create session ID (resets when browser closes)
 */
export function getSessionId(): string {
  try {
    let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = generateUUID();
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  } catch (error) {
    // Private browsing or sessionStorage unavailable - generate ephemeral ID
    console.warn('sessionStorage unavailable, using ephemeral session ID:', error);
    return generateUUID();
  }
}

/**
 * Get both visitor and session IDs
 */
export function getTrackingIds(): { visitorId: string; sessionId: string } {
  return {
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
  };
}
