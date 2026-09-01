import { UserProfile, BodyMeasurement, Meal, Activity, CycleState } from '../../types';
import { diffInDays } from '../../utils/date';

export interface CalorieBalance {
  targetCalories: number;
  consumedCalories: number;
  remainingCalories: number;
  activityCalories: number;
  isOverTarget: boolean;
  overAmount: number;
  percentageUsed: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
}

export interface ActivityEquivalent {
  walkingMins: number;
  swimmingMins: number;
  cyclingMins: number;
  workoutMins: number;
}

/**
 * Calculates BMR using Mifflin-St Jeor formula for females
 */
export function calculateBMR(weightKg: number, heightCm: number, age: number): number {
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) return 1400; // Baseline fallback
  return Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161);
}

/**
 * Calculates TDEE and target calorie intake based on weight goal
 */
export function calculateDailyCalorieTarget(
  userProfile: UserProfile | null,
  latestWeightKg: number | null
): number {
  const age = userProfile?.age ?? 28;
  const heightCm = userProfile?.height ?? 165;
  const weightKg = latestWeightKg ?? 60;
  const goal = userProfile?.weightGoal ?? 'wellness';

  const bmr = calculateBMR(weightKg, heightCm, age);
  
  // Moderate activity multiplier (1.375 for standard daily routine)
  const tdee = Math.round(bmr * 1.375);

  switch (goal) {
    case 'lose':
      return Math.max(1200, tdee - 400);
    case 'gain':
      return tdee + 300;
    case 'maintain':
    case 'wellness':
    default:
      return tdee;
  }
}

/**
 * Estimates calories burned for a logged activity based on MET values
 */
export function estimateActivityCalories(
  activityType: Activity['type'],
  durationMinutes: number,
  intensity: Activity['intensity'],
  weightKg: number
): number {
  let baseMET = 4.0;

  switch (activityType) {
    case 'walking':
      baseMET = 3.5;
      break;
    case 'running':
      baseMET = 8.0;
      break;
    case 'cycling':
      baseMET = 6.8;
      break;
    case 'swimming':
      baseMET = 6.0;
      break;
    case 'strength':
      baseMET = 5.0;
      break;
    case 'cardio':
      baseMET = 7.0;
      break;
    case 'yoga':
    case 'mobility':
      baseMET = 3.0;
      break;
    case 'restorative':
      baseMET = 2.0;
      break;
    case 'other':
    default:
      baseMET = 4.5;
      break;
  }

  // Adjust MET based on intensity rating
  let intensityMultiplier = 1.0;
  if (intensity === 'easy') intensityMultiplier = 0.85;
  if (intensity === 'challenging') intensityMultiplier = 1.25;

  const effectiveMET = baseMET * intensityMultiplier;
  
  // Formula: Calories = (MET * 3.5 * weightKg / 200) * durationMinutes
  const calories = ((effectiveMET * 3.5 * weightKg) / 200) * durationMinutes;
  return Math.round(calories);
}

/**
 * Calculates current daily calorie balance for a given date string (YYYY-MM-DD)
 */
export function getDailyCalorieBalance(
  dateStr: string,
  meals: Meal[],
  activities: Activity[],
  userProfile: UserProfile | null,
  measurements: BodyMeasurement[]
): CalorieBalance {
  const latestWeight = measurements[0]?.weight ?? 60;
  const targetCalories = calculateDailyCalorieTarget(userProfile, latestWeight);

  // Filter meals logged on dateStr
  const dayMeals = meals.filter((m) => {
    const mealDate = m.timestamp.split('T')[0];
    return mealDate === dateStr;
  });

  const consumedCalories = dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const proteinConsumed = dayMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const carbsConsumed = dayMeals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const fatConsumed = dayMeals.reduce((sum, m) => sum + (m.fat || 0), 0);

  // Filter activities logged on dateStr
  const dayActivities = activities.filter((a) => {
    const actDate = a.timestamp.split('T')[0];
    return actDate === dateStr;
  });

  const activityCalories = dayActivities.reduce((sum, a) => {
    if (a.caloriesBurned && a.caloriesBurned > 0) {
      return sum + a.caloriesBurned;
    }
    return sum + estimateActivityCalories(a.type, a.durationMinutes, a.intensity, latestWeight);
  }, 0);

  const remainingCalories = targetCalories - consumedCalories;
  const isOverTarget = consumedCalories > targetCalories;
  const overAmount = isOverTarget ? consumedCalories - targetCalories : 0;
  const percentageUsed = Math.min(100, Math.round((consumedCalories / targetCalories) * 100));

  return {
    targetCalories,
    consumedCalories,
    remainingCalories,
    activityCalories,
    isOverTarget,
    overAmount,
    percentageUsed,
    proteinConsumed,
    carbsConsumed,
    fatConsumed,
  };
}

/**
 * Computes approximate activity equivalents for a given food calorie amount
 */
export function calculateActivityEquivalents(
  calories: number,
  weightKg: number = 60
): ActivityEquivalent {
  if (calories <= 0) {
    return { walkingMins: 0, swimmingMins: 0, cyclingMins: 0, workoutMins: 0 };
  }

  // Calories per min formulas
  const walkingCpm = (3.8 * 3.5 * weightKg) / 200;
  const swimmingCpm = (6.0 * 3.5 * weightKg) / 200;
  const cyclingCpm = (6.8 * 3.5 * weightKg) / 200;
  const workoutCpm = (5.0 * 3.5 * weightKg) / 200;

  return {
    walkingMins: Math.round(calories / (walkingCpm || 1)),
    swimmingMins: Math.round(calories / (swimmingCpm || 1)),
    cyclingMins: Math.round(calories / (cyclingCpm || 1)),
    workoutMins: Math.round(calories / (workoutCpm || 1)),
  };
}
