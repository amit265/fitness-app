import { calculateReadinessScore } from './readinessEngine';
import { DailyCheckIn, CycleState, Activity } from '../../types';

// Assertion helper
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`\x1b[31m❌ FAIL: ${message}\x1b[0m`);
    process.exit(1);
  } else {
    console.log(`\x1b[32m✅ PASS: ${message}\x1b[0m`);
  }
}

console.log('--- RUNNING READINESS ENGINE UNIT TESTS ---');

const follicularState: CycleState = {
  cycleDay: 10,
  phase: 'follicular',
  confidence: 'high',
  isPeriodExpectedSoon: false,
};

const menstrualState: CycleState = {
  cycleDay: 2,
  phase: 'menstrual',
  confidence: 'high',
  isPeriodExpectedSoon: false,
};

// Scenario 1: Optimal Check-in & high readiness
{
  const checkIn: DailyCheckIn = {
    id: '2026-08-31',
    date: '2026-08-31',
    sleepDuration: 8.0,
    sleepQuality: 5,
    energy: 5,
    stress: 1,
    hydration: 2.0,
    mood: 'great',
    symptoms: [],
  };

  const scoreObj = calculateReadinessScore(checkIn, follicularState, [], 'gain');
  assert(scoreObj.score === 100, `Optimal check-in yields perfect 100 score (Got: ${scoreObj.score})`);
  assert(scoreObj.level === 'high', 'Optimal yields high readiness level');
  assert(scoreObj.recommendation.activityType === 'HIGHER_INTENSITY_STRENGTH', 'Gain goal and high readiness follicular phase recommends HIGHER_INTENSITY_STRENGTH');
}

// Scenario 2: Bad Sleep & high stress yields low readiness
{
  const checkIn: DailyCheckIn = {
    id: '2026-08-31',
    date: '2026-08-31',
    sleepDuration: 5.0,
    sleepQuality: 2,
    energy: 2,
    stress: 4,
    hydration: 1.0,
    mood: 'tired',
    symptoms: [],
  };

  const scoreObj = calculateReadinessScore(checkIn, follicularState, []);
  assert(scoreObj.score < 50, `Sub-optimal check-in yields low score: ${scoreObj.score}`);
  assert(scoreObj.level === 'low' || scoreObj.level === 'moderate', 'Level is low or moderate');
}

// Scenario 3: Cramps during Menstrual Phase drops score and recommends REST
{
  const checkIn: DailyCheckIn = {
    id: '2026-08-31',
    date: '2026-08-31',
    sleepDuration: 7.5,
    sleepQuality: 4,
    energy: 2,
    stress: 3,
    hydration: 1.5,
    mood: 'okay',
    symptoms: ['cramps'],
  };

  const scoreObj = calculateReadinessScore(checkIn, menstrualState, []);
  assert(scoreObj.recommendation.activityType === 'REST' || scoreObj.recommendation.activityType === 'MOBILITY', `Menstrual cramps yields REST or MOBILITY (Got: ${scoreObj.recommendation.activityType})`);
}

// Scenario 4: Recovery penalty after intensive activity
{
  const checkIn: DailyCheckIn = {
    id: '2026-08-31',
    date: '2026-08-31',
    sleepDuration: 8.0,
    sleepQuality: 4,
    energy: 4,
    stress: 2,
    hydration: 2.0,
    mood: 'good',
    symptoms: [],
  };

  const recentActivities: Activity[] = [
    {
      id: 'act1',
      timestamp: new Date().toISOString(),
      type: 'strength',
      durationMinutes: 45,
      intensity: 'challenging',
    },
  ];

  const scoreObj = calculateReadinessScore(checkIn, follicularState, recentActivities);
  const factor = scoreObj.factors.find((f) => f.name === 'Workout Recovery');
  assert(factor !== undefined && factor.score === 60, `Single challenging activity triggers 60 recovery score (Got: ${factor?.score})`);
}

console.log('\x1b[32m✨ ALL READINESS TESTS PASSED SUCCESSFULLY! \x1b[0m');
process.exit(0);
