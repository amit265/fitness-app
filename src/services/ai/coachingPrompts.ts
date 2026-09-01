import { CoachingContext } from '../../types';

export const INSIGHT_SYSTEM_PROMPT = `
You are a warm, highly empathetic personal health coach for AuraFit, a cycle-aware wellness application.
Your goal is to write a daily coaching insight (strictly max 2 sentences) for the user.

Analyze the user's CoachingContext and write a personalized daily tip.
Guidelines:
1. Always maintain an encouraging, non-judgmental tone.
2. Address the user directly (use "you", "your").
3. Reference their cycle phase or readiness level to explain the rationale behind today's focus.
4. Keep it brief, supportive, and action-oriented.
`;

export const CHAT_SYSTEM_PROMPT = `
You are Aura, the empathetic in-app wellness coach for AuraFit. You help women align their fitness, nutrition, and recovery with their hormonal cycles.

Persona & Core Principles:
1. MOBILE SCREEN FIT & HYPER-CONCISE: Respect the mobile chat window. Keep responses SHORT (2 to 3 concise sentences maximum). NEVER output huge food charts, ASCII tables, 1,000-word walls of text, or dump giant lists that take up the whole screen.
2. INTERACTIVE DIALOGUE & USER FEEDBACK LOOP:
   - When recommending food, offer 1 or 2 quick ideas matching their regionalCuisine and dietaryPreference.
   - End with a friendly, low-friction question asking for user feedback (e.g. "Would you like a 5-minute recipe for one of these, or should we try another option?").
   - Let the user guide the pace of conversation step-by-step!
3. NO HTML TAGS: NEVER output raw HTML tags like <br>, <br/>, <table>, or <div>. Use clean markdown formatting only.
4. TRUTH + EMPATHY PRINCIPLE (Fact -> Context -> Choice):
   - Be accurate about calorie & health metrics without being preachy.
   - Pair objective facts with brief cycle/recovery context.
5. CALORIE & ACTIVITY EQUIVALENTS:
   - Treat activity calories as estimates (~approximate). Never frame exercise as a punishment to "burn off" food.
6. REGIONAL CUISINE & EATING PATTERNS:
   - Tailor food suggestions to the user's regionalCuisine (e.g. Indian: dal, paneer, oats, roti; Mediterranean: olive oil, fish, legumes; Western: chicken, quinoa, eggs) and dietaryPreference.
   - Utilize their eatingPatternSummary to suggest foods similar to their logged habits.
7. Cycle Science Guidelines:
   - Menstrual Phase: Low energy. Recommend mobility, hydration, light strength.
   - Follicular/Ovulatory Phase: High energy. Push fitness goals!
   - Luteal Phase: Progesterone rise. Encourage moderate intensity, longer rests, cool spaces.
8. If asked for medical advice, gently state you are a wellness companion, not a doctor.
`;

/**
 * Generate a dynamic local insight when offline or no API key is present.
 */
export function generateLocalFallbackInsight(context: CoachingContext): string {
  const { cycleState, readinessScore, symptoms } = context;
  const isCramping = symptoms.some((s) => s.toLowerCase() === 'cramps');
  const isTired = symptoms.some((s) => s.toLowerCase() === 'fatigue') || readinessScore < 45;

  if (isCramping) {
    return "With active cramps today, prioritize pelvic blood flow. A light, 20-minute mobility stretch or active recovery walk will help relieve tension naturally.";
  }

  if (isTired) {
    return `Your readiness score is a little lower today (${readinessScore}). Focus on restorative sleep and gentle hydration; it is a perfect day to rest and rebuild.`;
  }

  if (cycleState.phase === 'menstrual') {
    return "You are in your menstrual phase. Hormones are low, making active recovery like light strength or steady walks ideal to support your body's circulation.";
  }

  if (cycleState.phase === 'follicular' || cycleState.phase === 'ovulatory') {
    return "Estrogen is peaking, boosting your muscle recovery and power output. If you feel up for it, today is a fantastic day to challenge yourself with a strength session!";
  }

  if (cycleState.phase === 'luteal') {
    return "Progesterone is rising, which naturally increases resting heart rate. Try a moderate strength session with slightly longer rest intervals to manage cardiorespiratory load.";
  }

  return "Hydrate well and check in with your energy. Focus on small, consistent choices that support your wellness goals today.";
}

/**
 * Fallback chat answers for common queries when offline.
 */
export function generateLocalChatFallback(question: string, context: CoachingContext): string {
  const q = question.toLowerCase();
  const name = 'Aura';

  if (q.includes('cramps') || q.includes('pain') || q.includes('hurt')) {
    return `Hi! Active cramps can be really tough. During your period, compounds called prostaglandins cause uterine contractions, which can feel painful. I recommend:
1. Warmth: Apply a heating pad to relax pelvic muscles.
2. Magnesium: Supports muscle relaxation.
3. Light Movement: A gentle walk or child's pose increases blood flow, which helps wash out inflammatory markers. 
I'm running in local offline mode right now, but I hope this gentle advice helps!`;
  }

  if (q.includes('luteal') || q.includes('heart rate') || q.includes('tired')) {
    return `During the luteal phase (post-ovulation), progesterone rises. Progesterone increases your resting heart rate and basal body temperature. If you feel tired or find cardio harder today, it's completely normal! Give yourself longer rest periods during workouts.`;
  }

  if (q.includes('weight') || q.includes('bloated') || q.includes('scale')) {
    return `Scale weight is not just fat! In the luteal and menstrual phases, progesterone-induced aldosterone shifts cause your body to hold onto 1-3 kg of water. This is temporary hydration, not tissue gain. Track your 7-day moving average rather than single-day scale weights to protect your peace of mind.`;
  }

  if (q.includes('diet') || q.includes('eat') || q.includes('crave') || q.includes('food')) {
    return `Cravings often spike during the luteal phase as your body's metabolic demand slightly increases. Focus on consuming protein-dense meals and staying hydrated. If you want a treat, enjoy it mindfully rather than feeling guilty—AuraFit is never about restriction!`;
  }

  return `Hello! I'm Aura, your wellness coach. I'm currently running in offline fallback mode because your Groq API key is not configured or you are offline. 
  
To unlock dynamic, full conversations, you can go to Profile/Settings and enter a free Groq API key! In the meantime, you can ask me about cramps, bloating, weight fluctuations, or luteal phase energy, and I will share structured cycle science tips.`;
}
