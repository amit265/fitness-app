export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'unknown';

export interface CycleState {
  cycleDay: number;
  phase: CyclePhase;
  daysUntilExpectedPeriod?: number;
  estimatedOvulationDay?: number;
  confidence: 'low' | 'medium' | 'high';
  isPeriodExpectedSoon: boolean;
}

export interface UserProfile {
  name: string;
  age: number;
  height: number; // cm
  weightGoal: 'lose' | 'maintain' | 'gain' | 'wellness';
  regionalCuisine?: 'general' | 'indian' | 'mediterranean' | 'western' | 'east_asian' | 'latin_american' | 'middle_eastern' | 'vegetarian_global';
  dietaryPreference?: 'anything' | 'vegetarian' | 'vegan' | 'eggetarian' | 'high_protein' | 'keto' | 'halal';
  groqApiKey?: string;
  hasCompletedOnboarding: boolean;
  pauseCycleTracking?: boolean;
  lastMeasurementPromptDate?: string;
}

export interface PeriodLog {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;  // YYYY-MM-DD (optional if ongoing)
  flowIntensity: 'light' | 'medium' | 'heavy' | 'spotting';
}

export interface DailyCheckIn {
  id: string; // YYYY-MM-DD
  date: string;
  sleepDuration: number; // hours
  sleepQuality: number; // 1-5
  energy: number; // 1-5
  mood: 'great' | 'good' | 'okay' | 'low' | 'irritable' | 'anxious' | 'tired';
  stress: number; // 1-5
  hydration: number; // Litres
  steps?: number; // Daily step count
  symptoms: string[]; // ['cramps', 'bloating', etc.]
}

export interface MealIngredient {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  timestamp: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source?: 'database' | 'ai_estimate' | 'custom';
  ingredients?: MealIngredient[];
}

export interface CustomFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingUnit: string;
  ingredients?: MealIngredient[];
}

export interface WorkoutSet {
  exercise: string;
  weight?: number; // kg
  reps?: number;
  durationSeconds?: number;
}

export interface Activity {
  id: string;
  timestamp: string;
  type: 'strength' | 'cardio' | 'walking' | 'running' | 'swimming' | 'cycling' | 'mobility' | 'yoga' | 'restorative' | 'sports' | 'other';
  durationMinutes: number;
  intensity: 'easy' | 'moderate' | 'challenging';
  caloriesBurned?: number;
  notes?: string;
  source?: 'database' | 'ai_estimate' | 'custom';
  sets?: WorkoutSet[];
}

export interface BodyMeasurement {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
  waist?: number; // cm
  hips?: number;
  chest?: number;
  thigh?: number;
}

export interface CyclePreferences {
  typicalCycleLength: number; // e.g. 28
  typicalPeriodDuration: number; // e.g. 5
  isRegular: boolean;
}

export type ReadinessLevel = 'low' | 'moderate' | 'good' | 'high';

export interface ReadinessFactor {
  name: string;
  score: number; // 0-100 normalized score for that factor
  contribution: number; // actual points added to the final score
  explanation?: string; // Clear "WHY" text explaining the score
}

export type ActivityRecommendationType =
  | 'REST'
  | 'LIGHT_MOVEMENT'
  | 'WALK'
  | 'MOBILITY'
  | 'MODERATE_CARDIO'
  | 'STRENGTH'
  | 'HIGHER_INTENSITY_STRENGTH';

export interface DailyRecommendation {
  activityType: ActivityRecommendationType;
  durationMinutes?: number;
  intensity: 'easy' | 'moderate' | 'challenging';
  title: string;
  explanation: string;
  recKey?: string;
  recoveryNote?: string;
}

export interface ReadinessScore {
  score: number; // 0-100
  level: ReadinessLevel;
  factors: ReadinessFactor[];
  recommendation: DailyRecommendation;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface CachedDailyInsight {
  date: string; // YYYY-MM-DD
  generatedAt: string; // ISO timestamp
  contextHash: string;
  content: string;
  language?: string; // App UI language used to generate the insight
}

export interface AIMonitoringLog {
  id: string;
  timestamp: string;
  feature: 'home_insight' | 'coach_chat' | 'log_parser';
  model?: string;
  promptTokensEst: number;
  outputTokensEst: number;
  success: boolean;
  error?: string;
}

export interface CoachingContext {
  userName?: string;
  userAge?: number;
  userHeight?: number;
  userWeight?: number;
  userGoal: string;
  cycleState: CycleState;
  readinessScore: number;
  sleepDuration: number;
  sleepQuality: number;
  energy: number;
  stress: number;
  hydration: number;
  symptoms: string[];
  recentWorkoutMinutes: number;
  targetCalories?: number;
  consumedCalories?: number;
  remainingCalories?: number;
  activityCalories?: number;
  loggedMealsSummary?: string;
  loggedWorkoutsSummary?: string;
  regionalCuisine?: string;
  dietaryPreference?: string;
  eatingPatternSummary?: string;
}

