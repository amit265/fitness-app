import { callGroqAPI, callGroqChatAPI } from './groqClient';
import { parseLocalInput, ParsedLogResult } from './regexParser';
import { CoachingContext, ChatMessage } from '../../types';
import { getCurrentLanguage, LANGUAGE_NAMES } from '../../i18n';
import {
  INSIGHT_SYSTEM_PROMPT,
  CHAT_SYSTEM_PROMPT,
  generateLocalFallbackInsight,
  generateLocalChatFallback,
} from './coachingPrompts';
import { buildAIContext, AIQueryType } from './aiContextBuilder';
import { withRequestLock, trackAIUsage, hasExceededDailyLimit } from './aiMonitoring';

const PARSER_SYSTEM_PROMPT = `
You are a precise, empathetic health and fitness parser for the Sini: Cycle & Fitness mobile application.
Your goal is to parse raw user statements into structured JSON array of items representing Meals, Activities (Workouts), or Weight measurements.
CRITICAL INSTRUCTION: If the statement mentions multiple distinct foods (e.g. "ate 2 eggs and a banana and toast"), you MUST parse EACH food into its own separate 'meal' object in the array! DO NOT combine them into one meal.
Similarly, if they mention multiple workouts, parse each into a separate 'activity' object.

Analyze the user statement and return a JSON object with this exact schema:
{
  "items": [
    {
      "type": "meal" | "activity" | "weight",
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
  ]
}

Guidelines:
1. Be realistic and balanced in macro estimations.
2. If the user does not specify a duration for activities, default to 30 minutes.
3. If the statement is ambiguous, setting type to "unknown" is acceptable.
4. Return ONLY the JSON object. Do not include markdown wraps like \`\`\`json.
`;

/**
 * Unified parser trying Groq AI first (if API Key is present) and falling back to Regex.
 */
export async function parseUserInput(
  input: string,
  apiKey?: string
): Promise<ParsedLogResult[]> {
  const lockKey = `parse_input_${input.trim().toLowerCase()}`;

  const result = await withRequestLock(lockKey, async () => {
    const resolvedApiKey = apiKey?.trim() || process.env.EXPO_PUBLIC_GROQ_API_KEY?.trim();
    if (!resolvedApiKey || !resolvedApiKey.startsWith('gsk_')) {
      return parseLocalInput(input);
    }
    if (hasExceededDailyLimit(apiKey, 20)) {
      console.warn('[AI Guardrail] Daily limit exceeded. Falling back to local parser.');
      return parseLocalInput(input);
    }

    try {
      const userPrompt = `Parse this statement: "${input}"`;
      const jsonReply = await callGroqAPI(
        userPrompt,
        PARSER_SYSTEM_PROMPT,
        resolvedApiKey
      );

      trackAIUsage('log_parser', PARSER_SYSTEM_PROMPT, userPrompt, jsonReply, true);

      const parsed = JSON.parse(jsonReply.trim());
      
      if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
        return parsed.items as ParsedLogResult[];
      }

      if (parsed && parsed.type && parsed.payload) {
        return [parsed as ParsedLogResult];
      }

      return parseLocalInput(input);
    } catch (error: any) {
      console.warn('AI parsing failed, falling back to local regex engine:', error);
      trackAIUsage('log_parser', PARSER_SYSTEM_PROMPT, input, '', false, error?.message || String(error));
      return parseLocalInput(input);
    }
  });

  return result || parseLocalInput(input);
}

/**
 * Generates an empathetic daily summary paragraph based on logs and cycle phase.
 */
export async function generateDailyInsight(
  context: CoachingContext,
  apiKey?: string
): Promise<string> {
  const lockKey = `daily_insight_${context.cycleState?.cycleDay || 1}_${context.energy || 3}`;

  const result = await withRequestLock(lockKey, async () => {
    const resolvedApiKey = apiKey?.trim() || process.env.EXPO_PUBLIC_GROQ_API_KEY?.trim();
    if (!resolvedApiKey || !resolvedApiKey.startsWith('gsk_')) {
      return generateLocalFallbackInsight(context);
    }
    if (hasExceededDailyLimit(apiKey, 20)) {
      console.warn('[AI Guardrail] Daily limit exceeded. Falling back to local insight.');
      return generateLocalFallbackInsight(context);
    }

    const compactContext = buildAIContext('insight', context);

    try {
      const activeLang = await getCurrentLanguage();
      const langName = LANGUAGE_NAMES[activeLang] || 'English';
      const langInstruction = `CRITICAL LANGUAGE INSTRUCTION: You MUST write the daily insight 100% in ${langName}. Follow FACT -> CONTEXT -> CHOICE formatting.`;
      const fullSystemPrompt = `${INSIGHT_SYSTEM_PROMPT}\n\n${langInstruction}`;

      const userPrompt = `Today's Context: ${JSON.stringify(compactContext)}. Give me today's insight using FACT, CONTEXT, CHOICE format. Return a JSON object with key "insight".`;
      const jsonReply = await callGroqAPI(userPrompt, fullSystemPrompt, resolvedApiKey);
      
      const parsed = JSON.parse(jsonReply.trim());
      const insightText = parsed.insight || generateLocalFallbackInsight(context);
      
      trackAIUsage('home_insight', fullSystemPrompt, userPrompt, insightText, true);
      return insightText;
    } catch (error: any) {
      console.warn('AI insight failed, falling back to local engine:', error);
      trackAIUsage('home_insight', INSIGHT_SYSTEM_PROMPT, compactContext, '', false, error?.message || String(error));
      return generateLocalFallbackInsight(context);
    }
  });

  return result || generateLocalFallbackInsight(context);
}

/**
 * Conversational completions for Sini coach screen & overlay.
 */
export async function answerCoachQuestion(
  question: string,
  history: ChatMessage[],
  context: CoachingContext,
  apiKey?: string
): Promise<string> {
  const lockKey = `chat_${question.trim().toLowerCase()}_${Date.now()}`;

  const result = await withRequestLock(lockKey, async () => {
    const resolvedApiKey = apiKey?.trim() || process.env.EXPO_PUBLIC_GROQ_API_KEY?.trim();
    if (!resolvedApiKey || !resolvedApiKey.startsWith('gsk_')) {
      return generateLocalChatFallback(question, context);
    }
    if (hasExceededDailyLimit(apiKey, 20)) {
      console.warn('[AI Guardrail] Daily limit exceeded. Falling back to local chat.');
      return generateLocalChatFallback(question, context);
    }

    const compactContext = buildAIContext('chat', context);

    try {
      const activeLang = await getCurrentLanguage();
      const langName = LANGUAGE_NAMES[activeLang] || 'English';
      const langInstruction = `CRITICAL LANGUAGE INSTRUCTION: The user's preferred language is ${langName} (${activeLang}). You MUST answer 100% in ${langName}. All advice and explanations must be translated to ${langName}.`;

      // Enforce rolling context window (max 10 recent messages).
      // Trim long assistant replies to keep the context window lean — biological context
      // stays anchored at the system prompt level, so full history isn't needed.
      const recentHistory = history.slice(-10).map((m) => ({
        role: m.role,
        content:
          m.role === 'assistant' && m.content.length > 300
            ? m.content.slice(0, 300) + '…'
            : m.content,
      }));
      const systemPrompt = `${CHAT_SYSTEM_PROMPT}\n\n${langInstruction}\n\nToday's Context:\n${JSON.stringify(compactContext)}`;
      
      const messages = [
        { role: 'system', content: systemPrompt },
        ...recentHistory,
        { role: 'user', content: question },
      ];

      const reply = await callGroqChatAPI(messages as any, resolvedApiKey);
      const cleanReply = (reply || '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/?[^>]+(>|$)/g, '')
        .trim();

      trackAIUsage('coach_chat', systemPrompt, question, cleanReply, true);
      return cleanReply;
    } catch (error: any) {
      console.warn('AI Chat failed, falling back to local chat engine:', error);
      trackAIUsage('coach_chat', CHAT_SYSTEM_PROMPT, question, '', false, error?.message || String(error));
      return generateLocalChatFallback(question, context);
    }
  });

  return result || generateLocalChatFallback(question, context);
}
