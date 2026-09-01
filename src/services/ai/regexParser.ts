import { lookupFood } from '../nutrition/nutritionService';

export interface ParsedLogResult {
  type: 'meal' | 'activity' | 'weight' | 'unknown';
  payload: any;
}

/**
 * Fallback parser using local Regex rules.
 */
export function parseLocalInput(input: string): ParsedLogResult {
  const text = input.trim().toLowerCase();

  // 1. Check Weight Match (e.g. "Weight 65.5" or "65.5kg")
  const weightRegex = /(?:weight\s*|log\s*)?(\d+(?:\.\d+)?)\s*(?:kg|lbs|weight)/;
  const weightMatch = text.match(weightRegex);
  if (weightMatch) {
    const val = parseFloat(weightMatch[1]);
    if (val >= 30 && val <= 250) {
      return {
        type: 'weight',
        payload: {
          weight: val,
        },
      };
    }
  }

  // 2. Check Activity Match (e.g. "Walked 45 mins" or "30 min strength session")
  const activityRegex = /(\d+)\s*(?:mins?|minutes?|min)\s*(?:of\s*)?([a-zA-Z\s]+)/;
  const activityMatch = text.match(activityRegex) || text.match(/([a-zA-Z\s]+)\s*(?:for\s*)?(\d+)\s*(?:mins?|minutes?)/);

  if (activityMatch) {
    let duration = 30;
    let activityKey = '';

    // Determine which regex matched
    if (isNaN(Number(activityMatch[1]))) {
      // First is keyword, second is number
      activityKey = activityMatch[1].trim();
      duration = parseInt(activityMatch[2]) || 30;
    } else {
      // First is number, second is keyword
      duration = parseInt(activityMatch[1]) || 30;
      activityKey = activityMatch[2].trim();
    }

    const type = mapActivityType(activityKey);
    if (type !== 'other' || ['workout', 'exercise', 'training', 'session'].some((w) => activityKey.includes(w))) {
      const intensity = text.includes('hard') || text.includes('intense') || text.includes('heavy')
        ? 'challenging'
        : text.includes('easy') || text.includes('light') || text.includes('slow')
        ? 'easy'
        : 'moderate';

      const calPerMin = type === 'running' ? 10 : type === 'strength' ? 6 : type === 'cardio' ? 8 : 4;
      const caloriesBurned = duration * calPerMin;

      return {
        type: 'activity',
        payload: {
          type,
          durationMinutes: duration,
          intensity,
          caloriesBurned,
          notes: `Parsed: "${input}"`,
        },
      };
    }
  }

  // 3. Fallback to Meal Match via curated lookup (e.g. "2 eggs" or "chicken rice")
  const foodResult = lookupFood(text);
  if (foodResult) {
    return {
      type: 'meal',
      payload: {
        name: foodResult.name,
        calories: foodResult.calories,
        protein: foodResult.protein,
        carbs: foodResult.carbs,
        fat: foodResult.fat,
      },
    };
  }

  // 4. Default Unknown
  return {
    type: 'unknown',
    payload: null,
  };
}

/**
 * Maps raw keyword string to standard Activity Type.
 */
function mapActivityType(keyword: string): any {
  const k = keyword.toLowerCase();
  if (k.includes('walk')) return 'walking';
  if (k.includes('run') || k.includes('jog') || k.includes('treadmill')) return 'running';
  if (k.includes('strength') || k.includes('lift') || k.includes('weights') || k.includes('gym') || k.includes('squat') || k.includes('push')) return 'strength';
  if (k.includes('cycling') || k.includes('cycle') || k.includes('bike') || k.includes('spin')) return 'cycling';
  if (k.includes('swim') || k.includes('pool')) return 'swimming';
  if (k.includes('yoga') || k.includes('stretch')) return 'yoga';
  if (k.includes('mobility') || k.includes('foam')) return 'mobility';
  if (k.includes('cardio') || k.includes('hiit') || k.includes('aerobics')) return 'cardio';
  return 'other';
}
