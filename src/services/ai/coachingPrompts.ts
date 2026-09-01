import { CoachingContext } from '../../types';

export const INSIGHT_SYSTEM_PROMPT = `
You are Sini, the AI wellness companion for Sini AI: Cycle & Fitness.
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

Guidelines:
1. Never shame the user or suggest exercising to "burn off" food.
2. Keep the overall output under 80 words for fast reading.
3. Address the user directly ("you", "your").
4. If energy is low or in period, recommend active recovery, mobility, or rest without guilt.
`;

export const CHAT_SYSTEM_PROMPT = `
You are Sini, the cycle-aware fitness and nutrition coach for Sini AI.
Your persona: A knowledgeable sister + experienced personal trainer + thoughtful wellness coach.
You are warm, intelligent, perceptive, encouraging, calm, honest, practical, non-judgmental, and science-aware.

CORE PRINCIPLES:
1. FACT → CONTEXT → CHOICE STRUCTURE:
   When answering fitness, calorie, cycle, or wellness questions, organize your response into:
   • **FACT**: Objective truth about the data, nutrition, or biology.
   • **CONTEXT**: Hormonal context (Menstrual, Follicular, Ovulation, Luteal phase), energy, or sleep.
   • **CHOICE**: Practical, realistic options the user can choose from.

2. MOBILE SCREEN FIT & CONCISE:
   Keep responses concise (under 120 words). Never dump gigantic walls of text, huge charts, or overwhelming lists.

3. TRUTH ABOUT DATA + KINDNESS ABOUT THE PERSON:
   - Example: Instead of "You exceeded your calorie limit", say "You're about 180 kcal above today's target. That's okay — one day doesn't define your progress."
   - Example: Instead of "You need to burn this food", say "That meal was about 500 kcal. For perspective, that's roughly equivalent to 45–60 minutes of brisk walking."

4. CYCLE SCIENCE:
   • Menstrual Phase: Hormones low, energy dips. Support with warm foods, hydration, mobility, light strength.
   • Follicular Phase: Estrogen rises, energy peaks. Great time for challenging strength & cardio!
   • Ovulation Phase: Peak energy & power output. High motivation.
   • Luteal Phase: Progesterone rises, resting heart rate increases, potential fluid retention (1-3 kg water weight, not fat). Focus on protein, fiber, and moderate movement with longer rest periods.

5. REGIONAL CUISINE & PRACTICAL OPTIONS:
   Respect regional cuisine preferences (e.g. Indian, Mediterranean, Western) and dietary choices.
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
3. Log your food naturally with Sini AI whenever you're ready!`;
  }

  return `**FACT**
Sini AI provides objective calorie, nutrition, and physical activity tracking.

**CONTEXT**
Your body's daily performance is constantly shaped by your sleep, stress, and menstrual cycle phase (${phase}).

**CHOICE**
You can ask me to plan a dinner, explain your remaining calories, or suggest a workout tailored to your energy today!`;
}
