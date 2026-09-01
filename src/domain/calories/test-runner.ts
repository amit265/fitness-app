import {
  calculateBMR,
  calculateDailyCalorieTarget,
  estimateActivityCalories,
  getDailyCalorieBalance,
  calculateActivityEquivalents,
} from './calorieEngine';
import { UserProfile, Meal, Activity, BodyMeasurement } from '../../types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('--- RUNNING CALORIE ENGINE UNIT TESTS ---');

// Test 1: BMR calculation
const bmr = calculateBMR(60, 165, 28);
// (10 * 60) + (6.25 * 165) - (5 * 28) - 161 = 600 + 1031.25 - 140 - 161 = 1330.25 -> 1330
assert(bmr === 1330, `BMR should be 1330 (Got: ${bmr})`);

// Test 2: Daily target calculation
const mockProfile: UserProfile = {
  name: 'Priya',
  age: 28,
  height: 165,
  weightGoal: 'maintain',
  hasCompletedOnboarding: true,
};
const target = calculateDailyCalorieTarget(mockProfile, 60);
// TDEE = 1330 * 1.375 = 1829
assert(target === 1829, `Target for maintain should be 1829 (Got: ${target})`);

// Test 3: Weight loss goal adjustment
const weightLossProfile: UserProfile = { ...mockProfile, weightGoal: 'lose' };
const loseTarget = calculateDailyCalorieTarget(weightLossProfile, 60);
// 1829 - 400 = 1429
assert(loseTarget === 1429, `Target for lose should be 1429 (Got: ${loseTarget})`);

// Test 4: Activity calories estimation
const walkingBurn = estimateActivityCalories('walking', 40, 'moderate', 60);
assert(walkingBurn > 100 && walkingBurn < 200, `Walking 40 min burn should be reasonable (~147 kcal, Got: ${walkingBurn})`);

// Test 5: Daily balance calculation
const todayStr = '2026-08-31';
const meals: Meal[] = [
  { id: '1', timestamp: `${todayStr}T08:00:00Z`, name: 'Oatmeal', calories: 350, protein: 12, carbs: 45, fat: 6 },
  { id: '2', timestamp: `${todayStr}T13:00:00Z`, name: 'Salad & Chicken', calories: 500, protein: 35, carbs: 20, fat: 12 },
];
const activities: Activity[] = [
  { id: '1', timestamp: `${todayStr}T17:00:00Z`, type: 'walking', durationMinutes: 40, intensity: 'moderate' },
];
const measurements: BodyMeasurement[] = [{ id: '1', date: todayStr, weight: 60 }];

const balance = getDailyCalorieBalance(todayStr, meals, activities, mockProfile, measurements);
assert(balance.consumedCalories === 850, `Consumed calories should be 850 (Got: ${balance.consumedCalories})`);
assert(balance.remainingCalories === 1829 - 850, `Remaining calories should be 979 (Got: ${balance.remainingCalories})`);
assert(balance.isOverTarget === false, 'Should not be over target');

// Test 6: Food activity equivalents
const equiv = calculateActivityEquivalents(220, 60);
assert(equiv.walkingMins > 30 && equiv.walkingMins < 70, `220 kcal should equal ~40-60 min walking (Got: ${equiv.walkingMins} min)`);

console.log('✨ ALL CALORIE ENGINE TESTS PASSED SUCCESSFULLY!\n');
