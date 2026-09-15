import { useAppStore } from '../../store/useAppStore';

const activeLocks = new Set<string>();

/**
 * Executes an async function with lock protection to prevent duplicate parallel requests.
 * If a request with the specified lockKey is already running, returns null or existing execution.
 */
export async function withRequestLock<T>(
  lockKey: string,
  fn: () => Promise<T>
): Promise<T | null> {
  if (activeLocks.has(lockKey)) {
    console.warn(`[AI Guardrail] Request "${lockKey}" is already in progress. Skipping duplicate submission.`);
    return null;
  }

  activeLocks.add(lockKey);
  try {
    const result = await fn();
    return result;
  } finally {
    activeLocks.delete(lockKey);
  }
}

/**
 * Estimates token count based on standard ~4 characters per token heuristic.
 */
export function estimateTokenCount(text: string | object | undefined): number {
  if (!text) return 0;
  const str = typeof text === 'string' ? text : JSON.stringify(text);
  return Math.ceil(str.length / 4);
}

/**
 * Logs AI request usage metrics into the persistent Zustand store.
 */
export function trackAIUsage(
  feature: 'home_insight' | 'coach_chat' | 'log_parser',
  systemPrompt: string,
  userPrompt: string | object,
  responseText: string,
  success: boolean,
  error?: string,
  modelUsed: string = 'llama-3.3-70b-versatile'
): void {
  const promptTokensEst = estimateTokenCount(systemPrompt) + estimateTokenCount(userPrompt);
  const outputTokensEst = estimateTokenCount(responseText);

  try {
    useAppStore.getState().logAIUsage({
      feature,
      model: modelUsed,
      promptTokensEst,
      outputTokensEst,
      success,
      error,
    });
  } catch (e) {
    console.warn('[AI Guardrail] Failed to log AI usage metric:', e);
  }
}

/**
 * Checks how many AI requests the user has made today.
 */
export function getDailyAIUsageCount(): number {
  try {
    const logs = useAppStore.getState().aiLogs || [];
    const today = new Date().toISOString().split('T')[0];
    return logs.filter(l => l.timestamp.startsWith(today)).length;
  } catch (e) {
    return 0;
  }
}

/**
 * Validates if the user can make another AI request.
 * Allows infinite requests if using a custom key, otherwise enforces a free tier limit.
 */
export function hasExceededDailyLimit(apiKey?: string, dailyLimit: number = 20): boolean {
  // If they provided a custom key that starts with gsk_, no limit.
  if (apiKey && apiKey.trim().startsWith('gsk_')) {
    return false;
  }
  
  // Otherwise, they are using the system default key, enforce limit.
  const todayCount = getDailyAIUsageCount();
  return todayCount >= dailyLimit;
}
