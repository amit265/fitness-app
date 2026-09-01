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
