import { Activity } from '../../types';

export interface ActivityDefinition {
  id: string;
  name: string;
  category: 'Walking' | 'Running' | 'Cycling' | 'Swimming' | 'Strength' | 'Cardio' | 'Sports' | 'Restorative';
  type: Activity['type'];
  baseMET: number;
}

export const ACTIVITY_LIBRARY: ActivityDefinition[] = [
  // Walking
  { id: 'walk_casual', name: 'Casual Walking', category: 'Walking', type: 'walking', baseMET: 3.5 },
  { id: 'walk_brisk', name: 'Brisk Walking', category: 'Walking', type: 'walking', baseMET: 4.3 },
  { id: 'hiking', name: 'Hiking', category: 'Walking', type: 'walking', baseMET: 6.0 },
  
  // Running
  { id: 'jogging', name: 'Jogging', category: 'Running', type: 'running', baseMET: 7.0 },
  { id: 'running', name: 'Running', category: 'Running', type: 'running', baseMET: 9.8 },
  { id: 'sprinting', name: 'Sprinting', category: 'Running', type: 'running', baseMET: 12.0 },
  
  // Cycling
  { id: 'cycling_casual', name: 'Cycling (Leisure)', category: 'Cycling', type: 'cycling', baseMET: 6.0 },
  { id: 'cycling_fast', name: 'Cycling (Vigorous)', category: 'Cycling', type: 'cycling', baseMET: 10.0 },
  { id: 'stationary_bike', name: 'Stationary Bike', category: 'Cycling', type: 'cycling', baseMET: 6.8 },

  // Swimming
  { id: 'swimming_laps', name: 'Swimming Laps', category: 'Swimming', type: 'swimming', baseMET: 8.3 },
  { id: 'swimming_leisure', name: 'Swimming (Leisure)', category: 'Swimming', type: 'swimming', baseMET: 6.0 },

  // Strength
  { id: 'weight_training', name: 'Weight Training', category: 'Strength', type: 'strength', baseMET: 5.0 },
  { id: 'bodyweight', name: 'Bodyweight Exercises', category: 'Strength', type: 'strength', baseMET: 4.5 },
  { id: 'pilates', name: 'Pilates', category: 'Strength', type: 'strength', baseMET: 3.0 },

  // Cardio
  { id: 'hiit', name: 'HIIT', category: 'Cardio', type: 'cardio', baseMET: 8.0 },
  { id: 'aerobics', name: 'Aerobics', category: 'Cardio', type: 'cardio', baseMET: 7.3 },
  { id: 'jump_rope', name: 'Jump Rope', category: 'Cardio', type: 'cardio', baseMET: 10.0 },
  { id: 'elliptical', name: 'Elliptical', category: 'Cardio', type: 'cardio', baseMET: 5.0 },
  { id: 'rowing', name: 'Rowing', category: 'Cardio', type: 'cardio', baseMET: 6.0 },

  // Sports
  { id: 'football', name: 'Football / Soccer', category: 'Sports', type: 'sports', baseMET: 8.0 },
  { id: 'basketball', name: 'Basketball', category: 'Sports', type: 'sports', baseMET: 6.5 },
  { id: 'tennis', name: 'Tennis', category: 'Sports', type: 'sports', baseMET: 7.3 },
  { id: 'badminton', name: 'Badminton', category: 'Sports', type: 'sports', baseMET: 5.5 },
  { id: 'volleyball', name: 'Volleyball', category: 'Sports', type: 'sports', baseMET: 4.0 },

  // Restorative
  { id: 'yoga', name: 'Yoga', category: 'Restorative', type: 'yoga', baseMET: 3.0 },
  { id: 'stretching', name: 'Stretching', category: 'Restorative', type: 'restorative', baseMET: 2.3 },
  { id: 'mobility', name: 'Mobility Work', category: 'Restorative', type: 'mobility', baseMET: 2.5 },
];

/**
 * Search the activity library by keyword
 */
export function lookupActivity(query: string): ActivityDefinition[] {
  const cleanQuery = query.toLowerCase().trim();
  if (!cleanQuery) return ACTIVITY_LIBRARY;

  return ACTIVITY_LIBRARY.filter(
    (activity) =>
      activity.name.toLowerCase().includes(cleanQuery) ||
      activity.category.toLowerCase().includes(cleanQuery)
  );
}

/**
 * Get activities grouped by category
 */
export function getGroupedActivities(): Record<string, ActivityDefinition[]> {
  const groups: Record<string, ActivityDefinition[]> = {};
  
  ACTIVITY_LIBRARY.forEach((activity) => {
    if (!groups[activity.category]) {
      groups[activity.category] = [];
    }
    groups[activity.category].push(activity);
  });
  
  return groups;
}
