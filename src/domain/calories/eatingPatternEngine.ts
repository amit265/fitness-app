import { Meal, UserProfile } from '../../types';

export interface EatingPatternSummary {
  cuisinePreference: string;
  dietaryPreference: string;
  topStaples: string[];
  avgMacroSplit: { proteinPct: number; carbsPct: number; fatPct: number };
  summaryText: string;
}

/**
 * Analyzes historical meals logged over the past 30 days to extract eating patterns.
 */
export function analyzeEatingPatterns(
  meals: Meal[],
  userProfile?: UserProfile | null
): EatingPatternSummary {
  const cuisinePreference = userProfile?.regionalCuisine || 'general';
  const dietaryPreference = userProfile?.dietaryPreference || 'anything';

  if (!meals || meals.length === 0) {
    return {
      cuisinePreference,
      dietaryPreference,
      topStaples: [],
      avgMacroSplit: { proteinPct: 25, carbsPct: 50, fatPct: 25 },
      summaryText: `Preferred Cuisine: ${cuisinePreference.toUpperCase()} | Diet: ${dietaryPreference.toUpperCase()} | No meal logs recorded yet.`,
    };
  }

  // Count food name frequency
  const foodCounts: Record<string, number> = {};
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  meals.forEach((m) => {
    const cleanName = m.name.trim().toLowerCase();
    foodCounts[cleanName] = (foodCounts[cleanName] || 0) + 1;
    totalProtein += m.protein || 0;
    totalCarbs += m.carbs || 0;
    totalFat += m.fat || 0;
  });

  // Sort top 5 staple foods
  const topStaples = Object.entries(foodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1));

  // Compute macro percentages
  const totalGrams = totalProtein + totalCarbs + totalFat;
  const proteinPct = totalGrams > 0 ? Math.round((totalProtein / totalGrams) * 100) : 25;
  const carbsPct = totalGrams > 0 ? Math.round((totalCarbs / totalGrams) * 100) : 50;
  const fatPct = totalGrams > 0 ? Math.round((totalFat / totalGrams) * 100) : 25;

  const summaryText = `Cuisine: ${cuisinePreference.toUpperCase()} | Diet: ${dietaryPreference.toUpperCase()} | Frequent Staples: ${
    topStaples.length > 0 ? topStaples.join(', ') : 'Various'
  } | Macro Ratio: ${proteinPct}% P, ${carbsPct}% C, ${fatPct}% F.`;

  return {
    cuisinePreference,
    dietaryPreference,
    topStaples,
    avgMacroSplit: { proteinPct, carbsPct, fatPct },
    summaryText,
  };
}
