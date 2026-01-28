/**
 * Format phone number as xxx-xxx-xxxx
 * Strips non-digit characters and limits to 10 digits
 */
export function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');

  // Limit to 10 digits
  const limitedDigits = digits.slice(0, 10);

  // Format as xxx-xxx-xxxx
  let formattedPhone = limitedDigits;
  if (limitedDigits.length > 6) {
    formattedPhone = `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
  } else if (limitedDigits.length > 3) {
    formattedPhone = `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`;
  }

  return formattedPhone;
}
