export interface WageInput {
  minWage: number | null | undefined;
  maxWage?: number | null | undefined;
}

/**
 * Format wage range
 * - Yearly salary if >= $1000
 * - Hourly rate if < $1000
 * - Returns range or single value with "+"
 */
export function formatWage(input: WageInput): string {
  const { minWage, maxWage } = input;

  if (!minWage) {
    return 'Competitive salary';
  }

  // Determine if yearly salary (>= $1000) or hourly rate
  const isYearly = minWage >= 1000;
  const suffix = isYearly ? 'per year' : 'per hour';

  // Format number with commas for yearly salaries
  const formatNumber = (num: number) => {
    return isYearly ? num.toLocaleString('en-US') : num.toString();
  };

  if (minWage && maxWage) {
    return `$${formatNumber(minWage)} - $${formatNumber(maxWage)} ${suffix}`;
  } else {
    return `$${formatNumber(minWage)}+ ${suffix}`;
  }
}
