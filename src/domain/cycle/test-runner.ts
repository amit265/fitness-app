import { calculateCycleStats, getCycleState, isFertileDay } from './cycleEngine';
import { PeriodLog, CyclePreferences } from '../../types';

// Simple unit assertion helper
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`\x1b[31m❌ FAIL: ${message}\x1b[0m`);
    process.exit(1);
  } else {
    console.log(`\x1b[32m✅ PASS: ${message}\x1b[0m`);
  }
}

console.log('--- RUNNING CYCLE ENGINE UNIT TESTS ---');

// Scenarios SETUP
const prefs: CyclePreferences = {
  typicalCycleLength: 30,
  typicalPeriodDuration: 6,
  isRegular: true,
};

// Scenario 1: Empty logs (uses preferences fallback)
{
  const periods: PeriodLog[] = [];
  const stats = calculateCycleStats(periods, prefs);
  assert(stats.averageCycleLength === 30, 'Empty logs fallback to pref typical cycle length');
  assert(stats.averagePeriodDuration === 6, 'Empty logs fallback to pref typical period duration');
  assert(stats.confidence === 'low', 'Empty logs results in low prediction confidence');

  const state = getCycleState(periods, prefs, '2026-08-31');
  assert(state.phase === 'unknown', 'Empty logs returns unknown phase');
}

// Scenario 2: Single completed period log (no cycle lengths to calculate yet)
{
  const periods: PeriodLog[] = [
    { id: '1', startDate: '2026-08-01', endDate: '2026-08-05', flowIntensity: 'medium' },
  ];
  const stats = calculateCycleStats(periods, prefs);
  assert(stats.averageCycleLength === 30, 'Single log falls back to pref typical cycle length');
  assert(stats.averagePeriodDuration === 5, 'Single log uses actual completed period duration (5 days)');
  assert(stats.confidence === 'low', 'Single log results in low prediction confidence');

  // Verify phase transitions for averageCycleLength=30, averagePeriodDuration=5, ovulation=16
  // Menstrual: Days 1-5
  const stateDay3 = getCycleState(periods, prefs, '2026-08-03');
  assert(stateDay3.cycleDay === 3, 'Day 3 is calculated correctly');
  assert(stateDay3.phase === 'menstrual', 'Day 3 is menstrual phase');

  // Follicular: Days 6-12 (ovulation-3 is 13)
  const stateDay10 = getCycleState(periods, prefs, '2026-08-10');
  assert(stateDay10.cycleDay === 10, 'Day 10 is calculated correctly');
  assert(stateDay10.phase === 'follicular', 'Day 10 is follicular phase');

  // Ovulatory: Days 13-17 (ovulation-2 to ovulation+1)
  const stateDay15 = getCycleState(periods, prefs, '2026-08-15');
  assert(stateDay15.cycleDay === 15, 'Day 15 is calculated correctly');
  assert(stateDay15.phase === 'ovulatory', 'Day 15 is ovulatory phase');
  const fertileDay15 = isFertileDay(15, 30);
  assert(fertileDay15.isFertile === true, 'Day 15 is marked fertile');
  assert(fertileDay15.isPeak === true, 'Day 15 is marked peak fertility');

  // Luteal: Days 18-30
  const stateDay22 = getCycleState(periods, prefs, '2026-08-22');
  assert(stateDay22.cycleDay === 22, 'Day 22 is calculated correctly');
  assert(stateDay22.phase === 'luteal', 'Day 22 is luteal phase');
}

// Scenario 3: Multiple period logs (calculates dynamic average cycle lengths)
{
  const periods: PeriodLog[] = [
    { id: '1', startDate: '2026-06-01', endDate: '2026-06-05', flowIntensity: 'medium' }, // Start 1
    { id: '2', startDate: '2026-06-29', endDate: '2026-07-03', flowIntensity: 'medium' }, // Start 2 (Diff: 28 days)
    { id: '3', startDate: '2026-07-27', endDate: '2026-07-31', flowIntensity: 'medium' }, // Start 3 (Diff: 28 days)
  ];
  
  const stats = calculateCycleStats(periods, prefs);
  assert(stats.averageCycleLength === 28, 'Dynamic average cycle length is 28');
  assert(stats.averagePeriodDuration === 5, 'Dynamic average period duration is 5');
  assert(stats.isIrregular === false, 'Standard cycle is not marked irregular');
  assert(stats.confidence === 'medium', '3 consistent logs (2 cycles) result in medium prediction confidence');

  const stateDay28 = getCycleState(periods, prefs, '2026-08-24'); // 28 days since 2026-07-27
  assert(stateDay28.cycleDay === 1, 'Day 1 of new cycle projected correctly on day 29');
  assert(stateDay28.daysUntilExpectedPeriod === 0, 'Days until expected period is 0');
  assert(stateDay28.isPeriodExpectedSoon === true, 'Period expected soon is active');
}

// Scenario 3b: 4 consistent period logs (3 cycles) results in high confidence
{
  const periods: PeriodLog[] = [
    { id: '1', startDate: '2026-05-04', endDate: '2026-05-08', flowIntensity: 'medium' },
    { id: '2', startDate: '2026-06-01', endDate: '2026-06-05', flowIntensity: 'medium' }, // 28d
    { id: '3', startDate: '2026-06-29', endDate: '2026-07-03', flowIntensity: 'medium' }, // 28d
    { id: '4', startDate: '2026-07-27', endDate: '2026-07-31', flowIntensity: 'medium' }, // 28d
  ];
  const stats = calculateCycleStats(periods, prefs);
  assert(stats.confidence === 'high', '4 consistent logs (3 cycles) result in high prediction confidence');
}

// Scenario 4: Irregular cycle detection
{
  const periods: PeriodLog[] = [
    { id: '1', startDate: '2026-05-01', endDate: '2026-05-05', flowIntensity: 'medium' }, 
    { id: '2', startDate: '2026-05-25', endDate: '2026-05-29', flowIntensity: 'medium' }, // Diff: 24 days
    { id: '3', startDate: '2026-06-25', endDate: '2026-06-29', flowIntensity: 'medium' }, // Diff: 31 days
    { id: '4', startDate: '2026-07-20', endDate: '2026-07-24', flowIntensity: 'medium' }, // Diff: 25 days
  ];

  const stats = calculateCycleStats(periods, prefs);
  // Std dev of [24, 31, 25] (mean: 26.6) standard deviation is ~3.09 which is regular (<4).
  // Let's add a more extreme difference to trigger irregularity:
  const irregularPeriods: PeriodLog[] = [
    { id: '1', startDate: '2026-05-01', endDate: '2026-05-05', flowIntensity: 'medium' },
    { id: '2', startDate: '2026-05-22', endDate: '2026-05-26', flowIntensity: 'medium' }, // Diff: 21 days
    { id: '3', startDate: '2026-06-26', endDate: '2026-06-30', flowIntensity: 'medium' }, // Diff: 35 days
  ];
  
  const irregularStats = calculateCycleStats(irregularPeriods, prefs);
  assert(irregularStats.isIrregular === true, 'Cycles of 21 and 35 days trigger irregularity');
  assert(irregularStats.confidence === 'low', 'Irregular cycle triggers low confidence prediction');
}

console.log('\x1b[32m✨ ALL TESTS PASSED SUCCESSFULLY! \x1b[0m');
process.exit(0);
