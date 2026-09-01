import { BodyMeasurement } from '../types';
import { diffInDays, getTodayStr } from './date';

export interface TrendData {
  values: number[];
  labels: string[];
  movingAverages: number[];
}

/**
 * Filter measurements for a past time window and format for charting.
 */
export function getWeightTrend(
  measurements: BodyMeasurement[],
  days: number
): TrendData {
  const today = getTodayStr();

  // Filter measurements within past N days
  const filtered = measurements
    .filter((m) => {
      const ageInDays = diffInDays(today, m.date);
      return ageInDays >= 0 && ageInDays <= days;
    })
    // Sort oldest first for time-series charts
    .sort((a, b) => a.date.localeCompare(b.date));

  const values = filtered.map((m) => m.weight);
  const labels = filtered.map((m) => {
    // Format date string from YYYY-MM-DD to "MM-DD"
    const parts = m.date.split('-');
    if (parts.length === 3) {
      return `${parts[1]}-${parts[2]}`;
    }
    return m.date;
  });

  // Calculate 7-day simple moving average to smooth out fluctuations
  const movingAverages = calculateSimpleMovingAverage(values, 3); // 3-point average for smaller MVP datasets, easily scales to 7

  return {
    values,
    labels,
    movingAverages,
  };
}

/**
 * Computes a simple moving average.
 */
export function calculateSimpleMovingAverage(
  data: number[],
  windowSize: number
): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const subset = data.slice(start, i + 1);
    const sum = subset.reduce((acc, v) => acc + v, 0);
    result.push(parseFloat((sum / subset.length).toFixed(2)));
  }

  return result;
}
