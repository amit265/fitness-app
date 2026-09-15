import { WorkoutRoutine, getWorkoutById } from './movementLibrary';

export type PlanEnvironment = 'gym' | 'home' | 'anywhere';
export type PlanLevel = 'beginner' | 'intermediate' | 'advanced';

export interface PlanScheduleDay {
  dayIndex: number; // 1-indexed day of the plan (e.g., 1 to 28 for a 4-week plan)
  workoutId: string | 'rest'; // 'rest' indicates a rest day
  label?: string; // e.g. "Upper Body Power", "Active Recovery"
}

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  environment: PlanEnvironment;
  level: PlanLevel;
  durationWeeks: number;
  schedule: PlanScheduleDay[];
}

export const WORKOUT_PLANS: WorkoutPlan[] = [
  {
    id: 'plan_gym_foundation_4w',
    title: '4-Week Gym Foundation',
    description: 'A comprehensive 4-week gym program designed to build foundational strength and muscle using standard gym equipment.',
    environment: 'gym',
    level: 'beginner',
    durationWeeks: 4,
    schedule: [
      // Week 1
      { dayIndex: 1, workoutId: 'g1', label: 'Full Body Push' },
      { dayIndex: 2, workoutId: 'c1', label: 'Cardio Intervals' },
      { dayIndex: 3, workoutId: 'g2', label: 'Full Body Pull' },
      { dayIndex: 4, workoutId: 'rest', label: 'Rest & Recover' },
      { dayIndex: 5, workoutId: 'g3', label: 'Lower Body Focus' },
      { dayIndex: 6, workoutId: 'c2', label: 'LISS Cardio' },
      { dayIndex: 7, workoutId: 'rest', label: 'Rest' },
      // Week 2
      { dayIndex: 8, workoutId: 'g1', label: 'Full Body Push' },
      { dayIndex: 9, workoutId: 'c3', label: 'HIIT Sprints' },
      { dayIndex: 10, workoutId: 'g2', label: 'Full Body Pull' },
      { dayIndex: 11, workoutId: 'rest', label: 'Rest & Recover' },
      { dayIndex: 12, workoutId: 'g3', label: 'Lower Body Focus' },
      { dayIndex: 13, workoutId: 'c1', label: 'Cardio Intervals' },
      { dayIndex: 14, workoutId: 'rest', label: 'Rest' },
      // Week 3
      { dayIndex: 15, workoutId: 'g1', label: 'Full Body Push' },
      { dayIndex: 16, workoutId: 'c2', label: 'LISS Cardio' },
      { dayIndex: 17, workoutId: 'g2', label: 'Full Body Pull' },
      { dayIndex: 18, workoutId: 'rest', label: 'Rest & Recover' },
      { dayIndex: 19, workoutId: 'g3', label: 'Lower Body Focus' },
      { dayIndex: 20, workoutId: 'c4', label: 'Core & Cardio' },
      { dayIndex: 21, workoutId: 'rest', label: 'Rest' },
      // Week 4
      { dayIndex: 22, workoutId: 'g1', label: 'Full Body Push' },
      { dayIndex: 23, workoutId: 'c1', label: 'Cardio Intervals' },
      { dayIndex: 24, workoutId: 'g2', label: 'Full Body Pull' },
      { dayIndex: 25, workoutId: 'rest', label: 'Rest & Recover' },
      { dayIndex: 26, workoutId: 'g3', label: 'Lower Body Focus' },
      { dayIndex: 27, workoutId: 'c3', label: 'HIIT Sprints' },
      { dayIndex: 28, workoutId: 'rest', label: 'Rest' },
    ],
  },
  {
    id: 'plan_home_burn_4w',
    title: '4-Week Home Burn',
    description: 'High-energy, equipment-free workouts to torch calories and build functional strength right from your living room.',
    environment: 'home',
    level: 'intermediate',
    durationWeeks: 4,
    schedule: [
      // Week 1
      { dayIndex: 1, workoutId: 'h1', label: 'Total Body HIIT' },
      { dayIndex: 2, workoutId: 'm1', label: 'Mobility Flow' },
      { dayIndex: 3, workoutId: 'h2', label: 'Core Crusher' },
      { dayIndex: 4, workoutId: 'rest', label: 'Rest & Recover' },
      { dayIndex: 5, workoutId: 'h3', label: 'Lower Body Burn' },
      { dayIndex: 6, workoutId: 'm2', label: 'Deep Stretch' },
      { dayIndex: 7, workoutId: 'rest', label: 'Rest' },
      // Week 2
      { dayIndex: 8, workoutId: 'h1', label: 'Total Body HIIT' },
      { dayIndex: 9, workoutId: 'c1', label: 'Cardio Blast' },
      { dayIndex: 10, workoutId: 'h2', label: 'Core Crusher' },
      { dayIndex: 11, workoutId: 'rest', label: 'Rest & Recover' },
      { dayIndex: 12, workoutId: 'h3', label: 'Lower Body Burn' },
      { dayIndex: 13, workoutId: 'm1', label: 'Mobility Flow' },
      { dayIndex: 14, workoutId: 'rest', label: 'Rest' },
      // Week 3
      { dayIndex: 15, workoutId: 'h1', label: 'Total Body HIIT' },
      { dayIndex: 16, workoutId: 'm2', label: 'Deep Stretch' },
      { dayIndex: 17, workoutId: 'h2', label: 'Core Crusher' },
      { dayIndex: 18, workoutId: 'rest', label: 'Rest & Recover' },
      { dayIndex: 19, workoutId: 'h3', label: 'Lower Body Burn' },
      { dayIndex: 20, workoutId: 'c2', label: 'LISS Cardio' },
      { dayIndex: 21, workoutId: 'rest', label: 'Rest' },
      // Week 4
      { dayIndex: 22, workoutId: 'h1', label: 'Total Body HIIT' },
      { dayIndex: 23, workoutId: 'c3', label: 'HIIT Sprints' },
      { dayIndex: 24, workoutId: 'h2', label: 'Core Crusher' },
      { dayIndex: 25, workoutId: 'rest', label: 'Rest & Recover' },
      { dayIndex: 26, workoutId: 'h3', label: 'Lower Body Burn' },
      { dayIndex: 27, workoutId: 'm1', label: 'Mobility Flow' },
      { dayIndex: 28, workoutId: 'rest', label: 'Rest' },
    ],
  },
];

export const getWorkoutPlanById = (id: string): WorkoutPlan | undefined => {
  return WORKOUT_PLANS.find(p => p.id === id);
};

export const getTodayPlanWorkout = (planId: string, currentDayIndex: number): { workout: WorkoutRoutine | null, label: string, isRest: boolean } | null => {
  const plan = getWorkoutPlanById(planId);
  if (!plan) return null;
  
  const scheduleItem = plan.schedule.find(s => s.dayIndex === currentDayIndex);
  if (!scheduleItem) return null;
  
  if (scheduleItem.workoutId === 'rest') {
    return { workout: null, label: scheduleItem.label || 'Rest Day', isRest: true };
  }
  
  const workout = getWorkoutById(scheduleItem.workoutId);
  if (!workout) return null;
  
  return { workout, label: scheduleItem.label || workout.title, isRest: false };
};
