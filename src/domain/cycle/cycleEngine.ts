import { CyclePhase, CycleState, PeriodLog, CyclePreferences } from '../../types';
import { diffInDays, addDays } from '../../utils/date';

export interface CycleStats {
  averageCycleLength: number;
  averagePeriodDuration: number;
  isIrregular: boolean;
  confidence: 'low' | 'medium' | 'high';
}

/**
 * Calculates historical stats based on user period logs and preferences.
 */
export function calculateCycleStats(
  periods: PeriodLog[],
  prefs: CyclePreferences | null
): CycleStats {
  const defaultLength = prefs?.typicalCycleLength ?? 28;
  const defaultDuration = prefs?.typicalPeriodDuration ?? 5;
  const initialRegularity = prefs?.isRegular ?? true;

  // We need sorted periods ascending (oldest first) to calculate cycle lengths
  const sortedPeriods = [...periods].sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );

  let averageCycleLength = defaultLength;
  let averagePeriodDuration = defaultDuration;
  let isIrregular = !initialRegularity;
  let confidence: 'low' | 'medium' | 'high' = 'low';

  // 1. Calculate Period Durations
  const completedDurations = sortedPeriods
    .filter((p) => p.endDate)
    .map((p) => diffInDays(p.endDate!, p.startDate) + 1);

  if (completedDurations.length >= 1) {
    const totalDuration = completedDurations.reduce((sum, d) => sum + d, 0);
    averagePeriodDuration = Math.round(totalDuration / completedDurations.length);
  }

  // 2. Calculate Cycle Lengths (time between start dates)
  if (sortedPeriods.length >= 2) {
    const cycleLengths: number[] = [];
    for (let i = 0; i < sortedPeriods.length - 1; i++) {
      const length = diffInDays(sortedPeriods[i + 1].startDate, sortedPeriods[i].startDate);
      // Filter out unrealistic cycles (e.g. logging errors or multiple inputs under 15 days)
      if (length >= 15 && length <= 60) {
        cycleLengths.push(length);
      }
    }

    if (cycleLengths.length >= 1) {
      const totalLength = cycleLengths.reduce((sum, l) => sum + l, 0);
      averageCycleLength = Math.round(totalLength / cycleLengths.length);

      // Check standard deviation for irregularity
      if (cycleLengths.length >= 2) {
        const mean = totalLength / cycleLengths.length;
        const variance =
          cycleLengths.reduce((sum, l) => sum + Math.pow(l - mean, 2), 0) /
          cycleLengths.length;
        const stdDev = Math.sqrt(variance);

        isIrregular = stdDev > 4;
        
        if (cycleLengths.length >= 3) {
          confidence = isIrregular ? 'low' : stdDev <= 2.5 ? 'high' : 'medium';
        } else {
          confidence = isIrregular ? 'low' : 'medium';
        }
      } else {
        confidence = 'medium';
      }
    }
  }

  return {
    averageCycleLength,
    averagePeriodDuration,
    isIrregular,
    confidence,
  };
}

/**
 * Evaluates the cycle state for a target date given periods and preferences.
 */
export function getCycleState(
  periods: PeriodLog[],
  prefs: CyclePreferences | null,
  targetDate: string
): CycleState {
  if (periods.length === 0) {
    return {
      cycleDay: 1,
      phase: 'unknown',
      confidence: 'low',
      isPeriodExpectedSoon: false,
    };
  }

  // Stats calculation
  const stats = calculateCycleStats(periods, prefs);
  
  // Past period relative to targetDate (or latest overall fallback)
  const pastPeriods = periods
    .filter((p) => p.startDate.localeCompare(targetDate) <= 0)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  const sortedPeriods = [...periods].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const referencePeriod = pastPeriods.length > 0 ? pastPeriods[0] : sortedPeriods[0];

  const cycleLen = stats.averageCycleLength;
  const periodDur = stats.averagePeriodDuration;
  const estimatedOvulationDay = cycleLen - 14;

  const diff = diffInDays(targetDate, referencePeriod.startDate);
  // Bidirectional Modulo Arithmetic: wraps any date (past or future) smoothly into 1..cycleLen
  const projectedDay = (((diff % cycleLen) + cycleLen) % cycleLen) + 1;

  let phase: CyclePhase = 'unknown';
  if (projectedDay <= periodDur) {
    phase = 'menstrual';
  } else if (projectedDay <= estimatedOvulationDay - 3) {
    phase = 'follicular';
  } else if (projectedDay <= estimatedOvulationDay + 1) {
    phase = 'ovulatory';
  } else {
    phase = 'luteal';
  }

  // Next Period Projection
  const nextExpectedPeriodDate = addDays(referencePeriod.startDate, cycleLen);
  const daysUntilExpectedPeriod = diffInDays(nextExpectedPeriodDate, targetDate);
  const isPeriodExpectedSoon = daysUntilExpectedPeriod >= 0 && daysUntilExpectedPeriod <= 3;

  return {
    cycleDay: projectedDay,
    phase,
    daysUntilExpectedPeriod: daysUntilExpectedPeriod >= 0 ? daysUntilExpectedPeriod : 0,
    estimatedOvulationDay,
    confidence: periods.length > 0 ? stats.confidence : 'low',
    isPeriodExpectedSoon,
  };
}

/**
 * Checks if the target cycle day is within the fertile window.
 * The fertile window spans 5 days before ovulation up to the day of ovulation.
 */
export function isFertileDay(
  cycleDay: number,
  averageCycleLength: number
): { isFertile: boolean; isPeak: boolean } {
  const ovulationDay = averageCycleLength - 14;
  const startFertile = ovulationDay - 5;
  const endFertile = ovulationDay;

  const isFertile = cycleDay >= startFertile && cycleDay <= endFertile;
  const isPeak = cycleDay >= ovulationDay - 2 && cycleDay <= ovulationDay;

  return { isFertile, isPeak };
}
