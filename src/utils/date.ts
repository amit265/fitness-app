/**
 * Helper to calculate difference in days between two date strings (YYYY-MM-DD)
 * Returns date1 - date2 in days, computed in UTC to avoid timezone shifts.
 */
export function diffInDays(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1 + 'T00:00:00Z');
  const d2 = new Date(dateStr2 + 'T00:00:00Z');
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Helper to add days to a date string (YYYY-MM-DD)
 * Returns YYYY-MM-DD, computed in UTC to avoid timezone shifts.
 */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

/**
 * Returns today's date in YYYY-MM-DD format in local time
 */
export function getTodayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
