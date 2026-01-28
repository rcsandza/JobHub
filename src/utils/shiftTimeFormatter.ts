export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type ShiftTimes = {
  [key in DayOfWeek]?: string;
};

/**
 * Format day ranges (e.g., "Mon - Thu, Sat")
 */
export function formatDayRanges(days: DayOfWeek[]): string {
  const dayOrder: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayAbbrev: Record<DayOfWeek, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun'
  };

  const indices = days.map(d => dayOrder.indexOf(d));
  const ranges: string[] = [];

  let rangeStart = indices[0];
  let rangeEnd = indices[0];

  for (let i = 1; i <= indices.length; i++) {
    if (i < indices.length && indices[i] === rangeEnd + 1) {
      rangeEnd = indices[i];
    } else {
      // Output current range
      if (rangeStart === rangeEnd) {
        ranges.push(dayAbbrev[dayOrder[rangeStart]]);
      } else {
        ranges.push(`${dayAbbrev[dayOrder[rangeStart]]} - ${dayAbbrev[dayOrder[rangeEnd]]}`);
      }
      if (i < indices.length) {
        rangeStart = indices[i];
        rangeEnd = indices[i];
      }
    }
  }

  return ranges.join(', ');
}

/**
 * Format shift times from JSONB data
 * Returns formatted days and times
 */
export function formatShiftTimes(shifts: ShiftTimes | null): { days: string | null; times: string | null } {
  if (!shifts) return { days: null, times: null };

  const dayOrder: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Get days that have shifts (values are comma-separated strings)
  const activeDays = dayOrder.filter(day => {
    const dayShifts = shifts[day];
    return dayShifts && typeof dayShifts === 'string' && dayShifts.trim().length > 0;
  });

  if (activeDays.length === 0) return { days: null, times: null };

  // Format days
  let formattedDays: string;

  if (activeDays.length === 7) {
    formattedDays = 'Every day';
  } else if (activeDays.length === 5 &&
             activeDays.every(d => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(d))) {
    formattedDays = 'Weekdays';
  } else if (activeDays.length === 2 &&
             activeDays.every(d => ['saturday', 'sunday'].includes(d))) {
    formattedDays = 'Weekends';
  } else {
    // Find consecutive ranges and individual days
    formattedDays = formatDayRanges(activeDays);
  }

  // Collect and format times (parse comma-separated strings)
  const allTimes = new Set<string>();
  activeDays.forEach(day => {
    const dayShifts = shifts[day];
    if (dayShifts && typeof dayShifts === 'string') {
      // Split by comma and trim each value
      dayShifts.split(',').forEach(time => {
        const trimmed = time.trim();
        if (trimmed) allTimes.add(trimmed);
      });
    }
  });

  const timeOrder = ['Morning', 'Afternoon', 'Evening'];
  const sortedTimes = timeOrder.filter(t => allTimes.has(t));

  let formattedTimes: string;
  if (sortedTimes.length === 1) {
    formattedTimes = sortedTimes[0] + 's';
  } else if (sortedTimes.length === 2) {
    formattedTimes = sortedTimes[0] + 's and ' + sortedTimes[1].toLowerCase() + 's';
  } else {
    formattedTimes = sortedTimes.slice(0, -1).map(t => t + 's').join(', ').toLowerCase();
    formattedTimes = formattedTimes.charAt(0).toUpperCase() + formattedTimes.slice(1);
    formattedTimes += ', and ' + sortedTimes[sortedTimes.length - 1].toLowerCase() + 's';
  }

  return { days: formattedDays, times: formattedTimes };
}
