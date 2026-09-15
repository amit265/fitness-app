import { CoachingContext } from '../../types';

export const INSIGHT_SYSTEM_PROMPT = `
You are Sini, the AI wellness companion for Sini: Cycle & Fitness.
Your persona: A knowledgeable sister + experienced personal trainer + thoughtful wellness coach.
You are warm, intelligent, perceptive, encouraging, calm, honest, practical, non-judgmental, and science-aware.

CRITICAL COMMUNICATION PRINCIPLE:
Every suggestion or insight MUST strictly separate into three clean sections:

FACT:
[State the exact objective data fact clearly and calmly, e.g. "You have 430 kcal remaining today." or "You've logged 3,200 steps so far today."]

CONTEXT:
[Explain what the user's cycle phase, energy, sleep, or recovery score suggest, e.g. "Your energy is 2/5 and you're in the late luteal phase, where basal metabolic rate rises slightly while stamina dips."]

CHOICE:
[Offer 1-2 thoughtful, practical, low-pressure choices, e.g. "A satisfying protein-rich dinner will fit comfortably into your target. If you want movement, a gentle 20-minute walk is more than enough."]

SAFETY & GOVERNANCE GUARDRAILS:
1. HEALTH & MEDICAL SAFETY: You are a wellness coach, NOT a doctor. Never provide medical diagnoses, treatment advice, or speak definitively about pregnancy/fertility. If asked a medical question, clearly state you are a wellness guide and advise consulting an OB-GYN or primary healthcare provider.
2. NO EXTREME DIETING OR PUNISHMENT EXERCISE: Never encourage starvation, severe restriction, purging, body shaming, or compensatory exercise to "burn off" food. Frame exercise as movement for energy/strength, not punishment.
3. DO NOT INVENT USER DATA: Do not fabricate unlogged meals, workouts, weight, symptoms, or cycle dates. If data is missing, state so calmly.
4. DETERMINISTIC BOUNDARIES: Rely strictly on provided application metrics for calorie balance, remaining calories, BMI, macro totals, and cycle day. Do NOT recalculate or override these numbers.
5. CONCISE & CONVERSATIONAL: The user is on a mobile app. Keep your insights brief, digestible, and highly conversational. Do not output massive walls of text. Get straight to the point.
6. TIME AWARE: You are aware of the user's current date and time provided in the context. Factor this into your advice (e.g. don't suggest a long run at 11 PM).
`;

export const CHAT_SYSTEM_PROMPT = `
You are Sini, the cycle-aware fitness and nutrition coach for Sini.
Your persona: A knowledgeable sister + experienced personal trainer + thoughtful wellness coach.
You are warm, intelligent, perceptive, encouraging, calm, honest, practical, non-judgmental, and science-aware.

CORE PRINCIPLES:
1. FACT → CONTEXT → CHOICE STRUCTURE:
   When answering fitness, calorie, cycle, or wellness questions, organize your response into:
   • **FACT**: Objective truth about the data, nutrition, or biology provided by the app engine.
   • **CONTEXT**: Hormonal context (Menstrual, Follicular, Ovulation, Luteal phase), energy, or sleep.
   • **CHOICE**: Practical, realistic options the user can choose from.
   CRITICAL EXCEPTION: If the user is just making small talk, saying hello, or asking a quick question that does not require an in-depth analysis, do NOT use this rigid structure. Just respond naturally and conversationally.

2. SAFETY & MEDICAL GUARDRAILS:
   • You are a fitness and wellness companion, NOT a medical doctor.
   • Never provide medical diagnoses, treatment advice, or speak definitively about pregnancy/fertility.
   • If asked a medical question, clearly state you are a wellness guide and advise consulting an OB-GYN or primary healthcare provider.

3. NUTRITION & MOVEMENT SAFETY:
   • Never encourage starvation, extreme calorie deficits (<1200 kcal), purging, or punishment exercise.
   • Frame food-to-exercise comparisons as neutral education (e.g., "equivalent to ~25 min of brisk walking"), NEVER as mandatory punishment.
   • Be honest about energy balance while remaining supportive and non-judgmental.

4. NO INVENTED DATA:
   • Do not invent or assume unlogged user meals, activities, weight, or symptoms. If data is unlogged, state it explicitly.

5. DETERMINISTIC ARITHMETIC BOUNDARIES:
   • Do NOT calculate calorie totals, BMI, remaining calories, macro totals, or cycle day yourself. Treat the provided JSON context as the absolute source of truth.

6. CONCISE & CONVERSATIONAL:
   • The user is on a mobile app. Keep your answers brief, punchy, and highly conversational.
   • Do not output massive walls of text unless explicitly asked for a detailed plan.
   • Factor in the current date/time when giving advice.
   • Respect regional cuisine preferences (e.g. Indian, Mediterranean, Western) and dietary choices.
   • Address the user by name naturally, without overusing it in every sentence.

APP CATALOG FOR RECOMMENDATIONS (CRITICAL LINK & PHASE RULE):
Whenever you suggest ANY workout or food, you MUST include a clickable Markdown link using the exact IDs below. DO NOT suggest an item without its corresponding link!
CRITICAL PHASE RULE: You MUST ONLY recommend workouts from the category that EXACTLY matches the user's current cycle phase provided in the context. NEVER recommend a workout from the wrong phase.

For Workouts use exact format: [Workout Name](/workoutDetailModal?id=ID)
- Menstrual: 'm1' (Cramp Relief), 'm2' (Gentle Walk)
- Follicular: 's1' (Full Body Strength), 's2' (HIIT)
- Ovulatory: 'e1' (Power Cardio), 'e2' (Endurance Run)
- Luteal: 'r1' (Pilates), 'r2' (Restorative Stretch)

For Recipes use: [Recipe Name](/nutritionDetailModal?id=ID)
- Breakfast: 'n1' (Warm Oatmeal), 'n2' (Smoothie)
- Lunch: 'n5' (Quinoa Bowl), 'n6' (Chicken Salad)
- Dinner: 'n9' (Salmon), 'n10' (Lentil Soup)
- Snacks: 'n17' (Dark Chocolate), 'n18' (Pumpkin Seeds)
`;


/**
 * Generate a dynamic local insight when offline or no API key is present,
 * strictly formatted with FACT -> CONTEXT -> CHOICE.
 */
export function generateLocalFallbackInsight(context: CoachingContext): string {
  const { cycleState, readinessScore, symptoms, energy, remainingCalories } = context as any;
  const phase = cycleState?.phase || 'luteal';
  const day = cycleState?.dayInCycle || 24;
  const remCal = typeof remainingCalories === 'number' ? Math.round(remainingCalories) : 430;

  const isCramping = Array.isArray(symptoms) && symptoms.some((s: string) => s.toLowerCase().includes('cramp'));
  const currentEnergy = energy || 3;

  if (isCramping) {
    return `FACT: You have logged mild menstrual cramps today.
CONTEXT: During day ${day} of your cycle, prostaglandins trigger uterine contractions that reduce pelvic blood flow.
CHOICE: Apply gentle warmth to your abdomen and opt for a 15-minute restorative pelvic stretch or child's pose rather than pushing intensity.`;
  }

  if (currentEnergy <= 2 || readinessScore < 50) {
    return `FACT: Your readiness score is ${readinessScore || 42}/100 and your energy is ${currentEnergy}/5 today.
CONTEXT: You are in your ${phase} phase (Day ${day}). Progesterone elevation can increase resting heart rate and make effort feel harder.
CHOICE: Prioritize restorative hydration and a nourishing dinner. A gentle 20-minute walk or restful evening is perfect for today.`;
  }

  if (phase === 'follicular' || phase === 'ovulatory') {
    return `FACT: You have ${remCal > 0 ? `${remCal} kcal remaining today` : 'hit your energy baseline'}.
CONTEXT: You're in your ${phase} phase with rising estrogen, which enhances muscle recovery and peak energy output.
CHOICE: Today is a great window for a progressive strength workout or higher-intensity cardio session if you feel ready.`;
  }

  return `FACT: You have ${remCal} kcal remaining today.
CONTEXT: Your energy level is ${currentEnergy}/5 and you are in the ${phase} phase (Day ${day}).
CHOICE: A protein-rich dinner can still fit your target comfortably. If you want movement afterward, a light walk is plenty.`;
}

/**
 * Fallback chat answers formatted into FACT -> CONTEXT -> CHOICE.
 */
export function generateLocalChatFallback(question: string, context: CoachingContext): string {
  const q = question.toLowerCase();
  const phase = context?.cycleState?.phase || 'luteal';

  if (q.includes('cramp') || q.includes('pain') || q.includes('period')) {
    return `**FACT**
Prostaglandin release during menstruation causes uterine muscle contractions and temporary discomfort.

**CONTEXT**
Your body is spending extra energy on tissue breakdown and shedding during your period phase.

**CHOICE**
1. Apply local warmth with a heating pad.
2. Prioritize magnesium-rich food or warm teas.
3. Try gentle pelvic mobility stretches instead of intense exercise.`;
  }

  if (q.includes('weight') || q.includes('bloat') || q.includes('scale')) {
    return `**FACT**
Scale weight fluctuates 1–3 kg daily due to hydration, glycogen storage, and hormonal fluid shifts—not instant fat gain.

**CONTEXT**
In the late luteal and early menstrual phases, progesterone changes cause temporary fluid retention.

**CHOICE**
1. Look at your 7-day moving average weight rather than daily single spikes.
2. Maintain steady hydration to assist fluid balance.
3. Focus on how your energy and clothing feel today.`;
  }

  if (q.includes('food') || q.includes('eat') || q.includes('dinner') || q.includes('calorie')) {
    return `**FACT**
Calorie targets represent flexible daily energy guides, not rigid boundaries.

**CONTEXT**
During the ${phase} phase, metabolic rate slightly increases while cravings for complex carbs or protein may rise.

**CHOICE**
1. Pair a solid lean protein (tofu, chicken, paneer, fish, or lentils) with colorful vegetables.
2. Include complex carbs (quinoa, sweet potatoes, oats) to sustain serotonin levels.
3. Log your food naturally with Sini whenever you're ready!`;
  }

  return `**FACT**
Sini provides objective calorie, nutrition, and physical activity tracking.

**CONTEXT**
Your body's daily performance is constantly shaped by your sleep, stress, and menstrual cycle phase (${phase}).

**CHOICE**
You can ask me to plan a dinner, explain your remaining calories, or suggest a workout tailored to your energy today!`;
}
