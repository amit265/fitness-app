import { callGroqAPI, callGroqChatAPI } from './groqClient';
import { parseLocalInput, ParsedLogResult } from './regexParser';
import { CoachingContext, ChatMessage } from '../../types';
import {
  INSIGHT_SYSTEM_PROMPT,
  CHAT_SYSTEM_PROMPT,
  generateLocalFallbackInsight,
  generateLocalChatFallback,
} from './coachingPrompts';

const SYSTEM_PROMPT = `
You are a precise, empathetic health and fitness parser for the AuraFit mobile application.
Your goal is to parse raw user statements into structured JSON objects representing a Meal, an Activity (Workout), or a Weight measurement.

Analyze the user statement and return a JSON object with this exact schema:
{
  "type": "meal" | "activity" | "weight" | "unknown",
  "payload": {
    // If type is "meal":
    "name": "Clean common name of food/meal",
    "calories": number,
    "protein": number,  // grams (estimate)
    "carbs": number,    // grams (estimate)
    "fat": number       // grams (estimate)
    
    // If type is "activity":
    "type": "strength" | "cardio" | "walking" | "running" | "swimming" | "cycling" | "mobility" | "yoga" | "restorative" | "other",
    "durationMinutes": number,
    "intensity": "easy" | "moderate" | "challenging",
    "caloriesBurned": number // estimate based on duration (walking is ~4/min, strength ~6/min, cardio ~8/min, running ~10/min)
    
    // If type is "weight":
    "weight": number // in kg (convert from lbs if user specifies lbs, e.g. "140 lbs" -> 63.5)
  }
}

Guidelines:
1. Be realistic and balanced in macro estimations.
2. If the user does not specify a duration for activities, default to 30 minutes.
3. If the user does not specify macros for foods, estimate them using standard nutritional profiles.
4. If the statement is ambiguous, setting type to "unknown" is acceptable.
5. Return ONLY the JSON object. Do not include markdown wraps like \`\`\`json.
`;

/**
 * Unified parser trying Groq AI first (if API Key is present) and falling back to Regex.
 */
export async function parseUserInput(
  input: string,
  apiKey?: string
): Promise<ParsedLogResult> {
  const resolvedApiKey = apiKey?.trim() || process.env.EXPO_PUBLIC_GROQ_API_KEY?.trim();
  if (!resolvedApiKey || !resolvedApiKey.startsWith('gsk_')) {
    // No API key, fallback immediately
    return parseLocalInput(input);
  }

  try {
    const jsonReply = await callGroqAPI(
      `Parse this statement: "${input}"`,
      SYSTEM_PROMPT,
      resolvedApiKey
    );

    const parsed = JSON.parse(jsonReply.trim());
    
    if (
      parsed &&
      ['meal', 'activity', 'weight', 'unknown'].includes(parsed.type) &&
      parsed.payload
    ) {
      return parsed as ParsedLogResult;
    }

    // Fallback if structured result was invalid
    return parseLocalInput(input);
  } catch (error) {
    console.warn('AI parsing failed, falling back to local regex engine:', error);
    // Network/key errors fallback to local parsing
    return parseLocalInput(input);
  }
}

/**
 * Generates an empathetic daily summary paragraph based on logs and cycle phase.
 */
export async function generateDailyInsight(
  context: CoachingContext,
  apiKey?: string
): Promise<string> {
  const resolvedApiKey = apiKey?.trim() || process.env.EXPO_PUBLIC_GROQ_API_KEY?.trim();
  if (!resolvedApiKey || !resolvedApiKey.startsWith('gsk_')) {
    return generateLocalFallbackInsight(context);
  }

  try {
    const userPrompt = `Today's Context: ${JSON.stringify(context)}. Give me today's insight. Return a JSON object with this key: "insight": "your text".`;
    const jsonReply = await callGroqAPI(userPrompt, INSIGHT_SYSTEM_PROMPT, resolvedApiKey);
    const parsed = JSON.parse(jsonReply.trim());
    return parsed.insight || generateLocalFallbackInsight(context);
  } catch (error) {
    console.warn('AI insight failed, falling back to local engine:', error);
    return generateLocalFallbackInsight(context);
  }
}

/**
 * Conversational completions for the Coach tab/overlay.
 */
export async function answerCoachQuestion(
  question: string,
  history: ChatMessage[],
  context: CoachingContext,
  apiKey?: string
): Promise<string> {
  const resolvedApiKey = apiKey?.trim() || process.env.EXPO_PUBLIC_GROQ_API_KEY?.trim();
  if (!resolvedApiKey || !resolvedApiKey.startsWith('gsk_')) {
    return generateLocalChatFallback(question, context);
  }

  try {
    const recentHistory = history.slice(-10);
    const systemPrompt = `${CHAT_SYSTEM_PROMPT}\n\nToday's Context:\n${JSON.stringify(context)}`;
    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentHistory.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: question },
    ];

    const reply = await callGroqChatAPI(messages as any, resolvedApiKey);
    return (reply || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/?[^>]+(>|$)/g, '')
      .trim();
  } catch (error) {
    console.warn('AI Chat failed, falling back to local chat engine:', error);
    return generateLocalChatFallback(question, context);
  }
}
