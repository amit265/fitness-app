import { WorkoutRoutine, getWorkoutById } from './movementLibrary';
import { CyclePhase } from '../../types';

export type PlanEnvironment = 'gym' | 'home' | 'anywhere';
export type PlanLevel = 'beginner' | 'intermediate' | 'advanced';

export interface PhaseWorkoutItem {
  workoutId: string | 'rest';
  label: string;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  environment: PlanEnvironment;
  level: PlanLevel;
  phaseWorkouts: {
    menstrual: PhaseWorkoutItem[];
    follicular: PhaseWorkoutItem[];
    ovulatory: PhaseWorkoutItem[];
    luteal: PhaseWorkoutItem[];
  };
}

export const WORKOUT_PLANS: WorkoutPlan[] = [
  {
    id: 'plan_gym_sync',
    title: 'Adaptive Gym Builder',
    description: 'A gym program that periodizes your strength training to match your hormonal fluctuations. Heavy lifting during high-energy phases, and active recovery when you need it most.',
    environment: 'gym',
    level: 'intermediate',
    phaseWorkouts: {
      menstrual: [
        { workoutId: 'm1', label: 'Menstrual Relief Flow' },
        { workoutId: 'm2', label: 'Restorative Stretch' },
        { workoutId: 'rest', label: 'Deep Rest & Recover' },
        { workoutId: 'c2', label: 'Light LISS Cardio' },
      ],
      follicular: [
        { workoutId: 'g1', label: 'Heavy Full Body Push' },
        { workoutId: 'c1', label: 'High Intensity Intervals' },
        { workoutId: 'g2', label: 'Heavy Full Body Pull' },
        { workoutId: 'c3', label: 'Speed Sprints' },
        { workoutId: 'g3', label: 'Heavy Lower Body' },
        { workoutId: 'rest', label: 'Active Recovery' },
      ],
      ovulatory: [
        { workoutId: 'g1', label: 'Power Full Body Push' },
        { workoutId: 'g2', label: 'Power Full Body Pull' },
        { workoutId: 'c1', label: 'Max Effort Cardio' },
        { workoutId: 'g3', label: 'Power Lower Body' },
        { workoutId: 'rest', label: 'Active Recovery' },
      ],
      luteal: [
        { workoutId: 'g1', label: 'Moderate Full Body Push' },
        { workoutId: 'c4', label: 'Core & Steady Cardio' },
        { workoutId: 'g2', label: 'Moderate Full Body Pull' },
        { workoutId: 'rest', label: 'Active Recovery' },
        { workoutId: 'g3', label: 'Moderate Lower Body' },
        { workoutId: 'm1', label: 'Mobility Flow' },
      ],
    },
  },
  {
    id: 'plan_home_sync',
    title: 'Adaptive Home Burn',
    description: 'Torch calories and build functional strength from your living room. This program scales the intensity to your cycle, preventing burnout while maximizing results.',
    environment: 'home',
    level: 'beginner',
    phaseWorkouts: {
      menstrual: [
        { workoutId: 'm1', label: 'Menstrual Relief Flow' },
        { workoutId: 'rest', label: 'Deep Rest & Recover' },
        { workoutId: 'm2', label: 'Restorative Stretch' },
        { workoutId: 'rest', label: 'Deep Rest & Recover' },
      ],
      follicular: [
        { workoutId: 'h1', label: 'Total Body HIIT' },
        { workoutId: 'h2', label: 'Core Crusher' },
        { workoutId: 'c1', label: 'Cardio Blast' },
        { workoutId: 'h3', label: 'Lower Body Burn' },
        { workoutId: 'rest', label: 'Active Recovery' },
      ],
      ovulatory: [
        { workoutId: 'h1', label: 'Max Total Body HIIT' },
        { workoutId: 'h3', label: 'Max Lower Body Burn' },
        { workoutId: 'c3', label: 'Sprint Intervals' },
        { workoutId: 'h2', label: 'Core Crusher' },
        { workoutId: 'rest', label: 'Active Recovery' },
      ],
      luteal: [
        { workoutId: 'h1', label: 'Moderate Total Body' },
        { workoutId: 'c2', label: 'Steady State Cardio' },
        { workoutId: 'h3', label: 'Moderate Lower Body' },
        { workoutId: 'm2', label: 'Deep Stretch' },
        { workoutId: 'rest', label: 'Active Recovery' },
      ],
    },
  },
];

export const getWorkoutPlanById = (id: string): WorkoutPlan | undefined => {
  return WORKOUT_PLANS.find(p => p.id === id);
};

export const getTodayPlanWorkout = (
  planId: string, 
  currentPhase: CyclePhase, 
  currentPlanDayIndex: number
): { workout: WorkoutRoutine | null, label: string, isRest: boolean, phaseContext: CyclePhase } | null => {
  
  const plan = getWorkoutPlanById(planId);
  if (!plan) return null;
  
  let phaseKey: keyof WorkoutPlan['phaseWorkouts'] = 'follicular'; // Fallback for unknown
  if (currentPhase === 'menstrual' || currentPhase === 'follicular' || currentPhase === 'ovulatory' || currentPhase === 'luteal') {
    phaseKey = currentPhase;
  }
  
  const phasePool = plan.phaseWorkouts[phaseKey];
  if (!phasePool || phasePool.length === 0) return null;
  
  // Use modulo arithmetic to endlessly cycle through the phase pool based on the days enrolled in the plan
  const rotatingIndex = (currentPlanDayIndex - 1) % phasePool.length;
  const scheduleItem = phasePool[rotatingIndex];
  
  if (scheduleItem.workoutId === 'rest') {
    return { workout: null, label: scheduleItem.label || 'Rest Day', isRest: true, phaseContext: currentPhase };
  }
  
  const workout = getWorkoutById(scheduleItem.workoutId);
  if (!workout) return null;
  
  return { workout, label: scheduleItem.label || workout.title, isRest: false, phaseContext: currentPhase };
};
