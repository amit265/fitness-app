import { CoachingContext } from '../../types';

export type AIQueryType = 'insight' | 'food' | 'workout' | 'chat';

/**
 * Compact context builder that extracts only the minimum relevant information 
 * required for an AI request, preventing full database dumps to the LLM.
 */
export function buildAIContext(
  queryType: AIQueryType,
  fullContext: Partial<CoachingContext>
): Partial<CoachingContext> {
  const baseContext = {
    userName: fullContext.userName || 'User',
    userGoal: fullContext.userGoal || 'wellness',
    cycleState: fullContext.cycleState
      ? {
          cycleDay: fullContext.cycleState.cycleDay,
          phase: fullContext.cycleState.phase,
          confidence: fullContext.cycleState.confidence,
          isPeriodExpectedSoon: Boolean(fullContext.cycleState.isPeriodExpectedSoon),
        }
      : undefined,
  };

  switch (queryType) {
    case 'food':
      return {
        ...baseContext,
        targetCalories: fullContext.targetCalories,
        consumedCalories: fullContext.consumedCalories,
        remainingCalories: fullContext.remainingCalories,
        loggedMealsSummary: fullContext.loggedMealsSummary || 'None',
        regionalCuisine: fullContext.regionalCuisine,
        dietaryPreference: fullContext.dietaryPreference,
      };

    case 'workout':
      return {
        ...baseContext,
        readinessScore: fullContext.readinessScore,
        energy: fullContext.energy,
        sleepDuration: fullContext.sleepDuration,
        sleepQuality: fullContext.sleepQuality,
        recentWorkoutMinutes: fullContext.recentWorkoutMinutes,
        loggedWorkoutsSummary: fullContext.loggedWorkoutsSummary || 'None',
      };

    case 'insight':
      return {
        ...baseContext,
        readinessScore: fullContext.readinessScore,
        sleepDuration: fullContext.sleepDuration,
        sleepQuality: fullContext.sleepQuality,
        energy: fullContext.energy,
        stress: fullContext.stress,
        hydration: fullContext.hydration,
        symptoms: fullContext.symptoms || [],
        recentWorkoutMinutes: fullContext.recentWorkoutMinutes,
        remainingCalories: fullContext.remainingCalories,
      };

    case 'chat':
    default:
      return {
        ...baseContext,
        userAge: fullContext.userAge,
        userHeight: fullContext.userHeight,
        userWeight: fullContext.userWeight,
        readinessScore: fullContext.readinessScore,
        sleepDuration: fullContext.sleepDuration,
        energy: fullContext.energy,
        stress: fullContext.stress,
        hydration: fullContext.hydration,
        symptoms: fullContext.symptoms || [],
        recentWorkoutMinutes: fullContext.recentWorkoutMinutes,
        targetCalories: fullContext.targetCalories,
        consumedCalories: fullContext.consumedCalories,
        remainingCalories: fullContext.remainingCalories,
        loggedMealsSummary: fullContext.loggedMealsSummary,
        loggedWorkoutsSummary: fullContext.loggedWorkoutsSummary,
        regionalCuisine: fullContext.regionalCuisine,
        dietaryPreference: fullContext.dietaryPreference,
      };
  }
}

/**
 * Generates a lightweight string hash of critical context variables to detect
 * whether user data has changed enough to warrant regenerating cached insight.
 */
export function generateContextHash(context: Partial<CoachingContext>): string {
  const keys = [
    context.userGoal,
    context.cycleState?.phase,
    context.cycleState?.cycleDay,
    context.readinessScore,
    context.energy,
    context.stress,
    context.remainingCalories,
    [...(context.symptoms || [])].sort().join(','),
  ];
  return keys.join('|');
}
