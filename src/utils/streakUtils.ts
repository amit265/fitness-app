import { diffInDays } from './date';

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

/**
 * Calculates updated streak state when user completes a daily target.
 */
export function calculateUpdatedStreak(
  currentStreakState: StreakState | null,
  todayStr: string
): StreakState {
  const state = currentStreakState || {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
  };

  if (!state.lastActiveDate) {
    return {
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: todayStr,
    };
  }

  const daysDiff = diffInDays(todayStr, state.lastActiveDate);

  if (daysDiff === 0) {
    // Already active today
    return state;
  }

  if (daysDiff === 1) {
    // Consecutive day! Increment streak
    const nextCurrent = state.currentStreak + 1;
    const nextLongest = Math.max(nextCurrent, state.longestStreak);
    return {
      currentStreak: nextCurrent,
      longestStreak: nextLongest,
      lastActiveDate: todayStr,
    };
  }

  // Broken streak (more than 1 day missed)
  return {
    currentStreak: 1,
    longestStreak: state.longestStreak,
    lastActiveDate: todayStr,
  };
}
