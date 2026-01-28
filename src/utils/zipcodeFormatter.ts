/**
 * Format zipcode to 5 digits only
 * Strips non-digit characters
 */
export function formatZipcode(value: string): string {
  // Remove all non-digit characters and limit to 5 digits
  const digits = value.replace(/\D/g, '').slice(0, 5);
  return digits;
}
