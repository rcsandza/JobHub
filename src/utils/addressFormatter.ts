export interface AddressInput {
  address?: string | null;
  extra?: {
    street_address?: string;
    city?: string;
    state?: string;
  };
  postal_code?: string | null;
}

/**
 * Format full address from various sources
 * Prioritizes address field, then builds from extra fields
 */
export function formatAddress(input: AddressInput): string {
  // Use address column if available
  if (input.address) {
    return input.address;
  }

  // Build address from available fields
  const parts = [];
  if (input.extra?.street_address) {
    parts.push(input.extra.street_address);
  }

  // City, State ZIP on one line
  const cityStateLine = [
    input.extra?.city,
    input.extra?.state,
    input.postal_code
  ].filter(Boolean).join(', ');

  if (cityStateLine) {
    parts.push(cityStateLine);
  } else if (input.postal_code) {
    // If we only have ZIP, show it
    parts.push(input.postal_code);
  }

  return parts.filter(Boolean).join('\n') || 'Location not specified';
}
