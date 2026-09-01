import { lookupFood } from '../nutrition/nutritionService';

export interface ParsedLogResult {
  type: 'meal' | 'activity' | 'weight' | 'unknown';
  payload: any;
}

/**
 * Fallback parser using local Regex rules (returns array to support multi-item statements).
 */
export function parseLocalInput(input: string): ParsedLogResult[] {
  const text = input.trim().toLowerCase();
  const results: ParsedLogResult[] = [];

  // 1. Check Weight Match (e.g. "Weight 65.5" or "65.5kg")
  const weightRegex = /(?:weight\s*|log\s*)?(\d+(?:\.\d+)?)\s*(?:kg|lbs|weight)/;
  const weightMatch = text.match(weightRegex);
  if (weightMatch) {
    const val = parseFloat(weightMatch[1]);
    if (val >= 30 && val <= 250) {
      results.push({
        type: 'weight',
        payload: {
          weight: val,
        },
      });
    }
  }

  // 2. Check Activity Match (e.g. "Walked 45 mins" or "30 min strength session")
  const activityRegex = /(\d+)\s*(?:mins?|minutes?|min)\s*(?:of\s*)?([a-zA-Z\s]+)/;
  const activityMatch = text.match(activityRegex) || text.match(/([a-zA-Z\s]+)\s*(?:for\s*)?(\d+)\s*(?:mins?|minutes?)/);

  if (activityMatch) {
    let duration = 30;
    let activityKey = '';

    if (isNaN(Number(activityMatch[1]))) {
      activityKey = activityMatch[1].trim();
      duration = parseInt(activityMatch[2]) || 30;
    } else {
      duration = parseInt(activityMatch[1]) || 30;
      activityKey = activityMatch[2].trim();
    }

    const type = mapActivityType(activityKey);
    if (type !== 'other' || ['workout', 'exercise', 'training', 'session', 'run', 'walk'].some((w) => activityKey.includes(w))) {
      const intensity = text.includes('hard') || text.includes('intense') || text.includes('heavy')
        ? 'challenging'
        : text.includes('easy') || text.includes('light') || text.includes('slow')
        ? 'easy'
        : 'moderate';

      const calPerMin = type === 'running' ? 10 : type === 'strength' ? 6 : type === 'cardio' ? 8 : 4;
      const caloriesBurned = duration * calPerMin;

      results.push({
        type: 'activity',
        payload: {
          type,
          durationMinutes: duration,
          intensity,
          caloriesBurned,
          notes: `Parsed: "${input}"`,
        },
      });
    }
  }

  // 3. Check Food Match (e.g. "ate 2 eggs" or "had oatmeal")
  const foodResult = lookupFood(text);
  if (foodResult) {
    results.push({
      type: 'meal',
      payload: {
        name: foodResult.name,
        calories: foodResult.calories,
        protein: foodResult.protein,
        carbs: foodResult.carbs,
        fat: foodResult.fat,
      },
    });
  }

  if (results.length > 0) {
    return results;
  }

  return [
    {
      type: 'unknown',
      payload: {},
    },
  ];
}

function mapActivityType(key: string): 'strength' | 'cardio' | 'walking' | 'running' | 'swimming' | 'cycling' | 'mobility' | 'yoga' | 'restorative' | 'other' {
  if (key.includes('walk')) return 'walking';
  if (key.includes('run') || key.includes('jog')) return 'running';
  if (key.includes('lift') || key.includes('strength') || key.includes('weights') || key.includes('gym')) return 'strength';
  if (key.includes('swim')) return 'swimming';
  if (key.includes('cycle') || key.includes('bike')) return 'cycling';
  if (key.includes('yoga')) return 'yoga';
  if (key.includes('stretch') || key.includes('mobility')) return 'mobility';
  if (key.includes('rest') || key.includes('meditat')) return 'restorative';
  if (key.includes('hiit') || key.includes('cardio')) return 'cardio';
  return 'other';
}
