import { UserProfile, BodyMeasurement, Meal, Activity, CycleState, DailyCheckIn } from '../../types';
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
  measurements: BodyMeasurement[],
  dailyCheckIn?: DailyCheckIn
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

  let nonWalkingActivityCalories = 0;
  let manualWalkingCalories = 0;

  dayActivities.forEach((a) => {
    const cals = a.caloriesBurned && a.caloriesBurned > 0 
      ? a.caloriesBurned 
      : estimateActivityCalories(a.type, a.durationMinutes, a.intensity, latestWeight);
      
    if (a.type === 'walking') {
      manualWalkingCalories += cals;
    } else {
      nonWalkingActivityCalories += cals;
    }
  });

  // Calculate steps calories (roughly 0.04 calories per step per kg)
  let stepsCalories = 0;
  if (dailyCheckIn && dailyCheckIn.steps) {
    // A standard estimate: ~ 0.04 * weight * steps / 60
    stepsCalories = Math.round((0.04 * latestWeight * dailyCheckIn.steps) / 60);
  }

  // Deduplicate: If they walked and have steps, we take the max of either the formal walking workouts or the background steps.
  // We assume steps already encapsulate the walking workout if steps exist.
  const deduplicatedWalkingCals = Math.max(manualWalkingCalories, stepsCalories);

  const activityCalories = nonWalkingActivityCalories + deduplicatedWalkingCals;

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

/**
 * Calculates healthy weight range based on BMI 18.5 - 24.9
 */
export function calculateHealthyWeightRange(heightCm: number): { minKg: number; maxKg: number } {
  const heightM = heightCm / 100;
  const minKg = 18.5 * (heightM * heightM);
  const maxKg = 24.9 * (heightM * heightM);
  return {
    minKg: Math.round(minKg * 10) / 10,
    maxKg: Math.round(maxKg * 10) / 10,
  };
}

/**
 * Calculates daily macro targets based on TDEE and Goal
 */
export function calculateMacroTargets(
  targetCalories: number,
  weightKg: number,
  goal: UserProfile['weightGoal']
): { proteinG: number; carbsG: number; fatG: number } {
  // Protein: High for weight loss to preserve muscle, standard otherwise.
  const proteinMultiplier = goal === 'lose' ? 2.2 : 1.8;
  const proteinG = Math.round(weightKg * proteinMultiplier);
  const proteinCals = proteinG * 4;

  // Fat: Standard 25% of total calories, or min 1g/kg
  let fatCals = targetCalories * 0.25;
  if (fatCals / 9 < weightKg * 0.8) {
    fatCals = weightKg * 0.8 * 9;
  }
  const fatG = Math.round(fatCals / 9);

  // Carbs: The rest
  const remainingCals = targetCalories - proteinCals - fatCals;
  const carbsG = Math.round(Math.max(0, remainingCals) / 4);

  return { proteinG, carbsG, fatG };
}

/**
 * Estimates daily hydration target (liters) based on weight
 */
export function estimateHydration(weightKg: number): number {
  // Approx 35ml per kg of body weight
  const ml = weightKg * 35;
  return Math.round((ml / 1000) * 10) / 10;
}
