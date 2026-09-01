import {
  UserProfile,
  CyclePreferences,
  PeriodLog,
  DailyCheckIn,
  Meal,
  Activity,
  BodyMeasurement,
} from '../types';

export function getMockSeedData() {
  const today = new Date();
  
  const formatDate = (daysAgo: number): string => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const formatIsoTimestamp = (daysAgo: number, hour: number = 12): string => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, 15, 0, 0);
    return d.toISOString();
  };

  // 1. User Profile
  const userProfile: UserProfile = {
    name: 'Sarah',
    age: 28,
    height: 168,
    weightGoal: 'lose',
    regionalCuisine: 'western',
    dietaryPreference: 'anything',
    hasCompletedOnboarding: true,
    pauseCycleTracking: false,
  };

  // 2. Cycle Preferences
  const cyclePreferences: CyclePreferences = {
    typicalCycleLength: 28,
    typicalPeriodDuration: 5,
    isRegular: true,
  };

  // 3. Period Logs (Past 45 days: 2 completed cycles)
  const periods: PeriodLog[] = [
    {
      id: 'p-1',
      startDate: formatDate(14), // Started 14 days ago
      endDate: formatDate(9),   // Lasted 5 days
      flowIntensity: 'medium',
    },
    {
      id: 'p-2',
      startDate: formatDate(42), // Started 42 days ago
      endDate: formatDate(37),  // Lasted 5 days
      flowIntensity: 'medium',
    },
  ];

  // 4. Daily Check-Ins (45 days history)
  const dailyCheckIns: Record<string, DailyCheckIn> = {};
  for (let i = 0; i <= 45; i++) {
    const dateStr = formatDate(i);
    const isPeriodDay = (i >= 9 && i <= 14) || (i >= 37 && i <= 42);
    const isHighEnergy = (i >= 15 && i <= 25) || (i >= 1 && i <= 8);

    dailyCheckIns[dateStr] = {
      id: dateStr,
      date: dateStr,
      sleepDuration: isPeriodDay ? 8.5 : 7.5,
      sleepQuality: isPeriodDay ? 3 : 4,
      energy: isPeriodDay ? 2 : isHighEnergy ? 4 : 3,
      mood: isPeriodDay ? 'tired' : isHighEnergy ? 'great' : 'good',
      stress: isPeriodDay ? 3 : 2,
      hydration: 2.2,
      symptoms: isPeriodDay
        ? ['cramps', 'fatigue']
        : i % 7 === 0
        ? ['bloating']
        : [],
    };
  }

  // 5. Logged Meals (Past 45 days)
  const meals: Meal[] = [];
  const sampleMealTemplates = [
    { name: 'Oatmeal with Berries & Protein', calories: 380, protein: 22, carbs: 52, fat: 8, hour: 8 },
    { name: 'Grilled Chicken & Quinoa Bowl', calories: 520, protein: 42, carbs: 45, fat: 14, hour: 13 },
    { name: 'Greek Yogurt & Honey Snack', calories: 210, protein: 18, carbs: 20, fat: 5, hour: 16 },
    { name: 'Salmon with Roasted Vegetables', calories: 560, protein: 38, carbs: 36, fat: 22, hour: 19 },
  ];

  for (let i = 0; i <= 45; i++) {
    sampleMealTemplates.forEach((template, idx) => {
      meals.push({
        id: `m-${i}-${idx}`,
        name: template.name,
        calories: template.calories + (i % 3 === 0 ? 30 : -20),
        protein: template.protein,
        carbs: template.carbs,
        fat: template.fat,
        timestamp: formatIsoTimestamp(i, template.hour),
      });
    });
  }

  // 6. Logged Activities (Past 45 days)
  const activities: Activity[] = [];
  const workoutTemplates = [
    { type: 'walking', durationMinutes: 35, intensity: 'easy', caloriesBurned: 140 },
    { type: 'strength', durationMinutes: 45, intensity: 'moderate', caloriesBurned: 270 },
    { type: 'yoga', durationMinutes: 30, intensity: 'easy', caloriesBurned: 110 },
    { type: 'running', durationMinutes: 30, intensity: 'challenging', caloriesBurned: 310 },
  ];

  for (let i = 0; i <= 45; i++) {
    if (i % 7 === 0) continue;
    const template = workoutTemplates[i % workoutTemplates.length];
    activities.push({
      id: `a-${i}`,
      type: template.type as any,
      durationMinutes: template.durationMinutes,
      intensity: template.intensity as any,
      caloriesBurned: template.caloriesBurned,
      timestamp: formatIsoTimestamp(i, 17),
      notes: `Cycle-synced ${template.type} session`,
    });
  }

  // 7. Weight Measurements (12 data points over past 45 days)
  const measurements: BodyMeasurement[] = [
    { id: 'bm-0', date: formatDate(0), weight: 59.8, waist: 68, hips: 94, chest: 86 },
    { id: 'bm-4', date: formatDate(4), weight: 60.1, waist: 68.5, hips: 94.5 },
    { id: 'bm-8', date: formatDate(8), weight: 60.4, waist: 69, hips: 95 },
    { id: 'bm-12', date: formatDate(12), weight: 60.8, waist: 69.5, hips: 95.5 },
    { id: 'bm-16', date: formatDate(16), weight: 61.0, waist: 70, hips: 96 },
    { id: 'bm-20', date: formatDate(20), weight: 61.3, waist: 70.2, hips: 96 },
    { id: 'bm-25', date: formatDate(25), weight: 61.7, waist: 70.5, hips: 96.5 },
    { id: 'bm-30', date: formatDate(30), weight: 62.0, waist: 71, hips: 97 },
    { id: 'bm-35', date: formatDate(35), weight: 62.4, waist: 71.5, hips: 97.5 },
    { id: 'bm-40', date: formatDate(40), weight: 62.8, waist: 72, hips: 98 },
  ];

  // 8. Streak
  const streak = {
    currentStreak: 14,
    longestStreak: 30,
    lastActiveDate: formatDate(0),
  };

  return {
    userProfile,
    cyclePreferences,
    periods,
    dailyCheckIns,
    meals,
    activities,
    measurements,
    streak,
  };
}
