/**
 * Check if a date is within a certain number of days from now
 */
export function isWithinDays(date: string | Date, days: number): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  const daysDiff = diff / (1000 * 60 * 60 * 24);
  return daysDiff <= days;
}

/**
 * Check if a posting is new (within last 7 days)
 */
export function isNewPosting(postedAt: string | Date | null | undefined): boolean {
  if (!postedAt) return false;
  return isWithinDays(postedAt, 7);
}

/**
 * Calculate days since a date
 */
export function daysSince(date: string | Date): number {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
