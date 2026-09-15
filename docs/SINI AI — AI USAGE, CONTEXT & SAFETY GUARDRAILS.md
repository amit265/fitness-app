# Sini — AI USAGE, CONTEXT & SAFETY GUARDRAILS

The existing Sini AI functionality is already working correctly.

**Do NOT rebuild or redesign the AI system.**

This task is to add a lightweight **AI governance/guardrail layer** around the existing implementation so AI calls are efficient, contextual, safe, and cost-conscious.

---

## 1. DO NOT CALL AI ON EVERY REFRESH

AI must NOT automatically run every time:

- App opens
- Home screen renders
- User switches tabs
- Screen refreshes
- Theme changes
- Language changes
- Navigation occurs
- Component re-renders

Do not place AI calls directly inside ordinary render/effect logic without a clear trigger.

A screen refresh should use existing/cached AI results when available.

---

# 2. HOME SCREEN AI

The Home screen should NOT call the LLM every time the user opens the app.

Use a cached/stored daily AI insight.

Conceptually:

```text
Open Home
   ↓
Is today's insight already available?
   ↓ YES
Use cached insight
   ↓ NO
Generate insight
```

Only regenerate when there is a meaningful reason, such as:

- New day
- Significant new user data
- User explicitly requests a refresh
- Existing insight has expired
- Important completed activity/meal changes the recommendation

Do not regenerate merely because the Home screen mounted again.

---

# 3. DAILY AI INSIGHT

Treat the daily Home insight as a distinct AI product.

Store something similar to:

```typescript
{
  date: "YYYY-MM-DD",
  generatedAt: "...",
  contextVersion: "...",
  content: "...",
}
```

Use the cached result whenever appropriate.

The exact storage mechanism should follow the existing Zustand/persistence architecture.

---

# 4. AI CHAT IS DIFFERENT

The Coach Chat screen is the primary place where frequent AI calls are expected.

Every user message may require an AI call.

However:

- Do not send unnecessary duplicate requests.
- Prevent accidental double-submission.
- Disable/lock send while a request is processing.
- Handle retries carefully.
- Do not automatically resend failed requests multiple times.
- Maintain reasonable conversation history/token limits.

The chat should be allowed to use more tokens than background features because it is an explicit user interaction.

---

# 5. GIVE SINI RELEVANT USER CONTEXT

Sini should understand the user as a continuing personal coach.

When generating AI responses, provide the relevant structured user context, such as:

```text
Name
Age
Height
Weight
Goal
Cycle information
Current cycle day
Current cycle phase
Recent activity
Recent nutrition
Recent calorie totals
Recent sleep
Recent hydration
Recent steps
Energy/mood when relevant
Relevant symptoms when relevant
Recent measurements when relevant
```

This allows Sini to naturally say things like:

> "Amit, you're currently in your luteal phase..."

rather than behaving like a completely new assistant every time.

Only provide data that is relevant to the current request.

---

# 6. DO NOT SEND THE ENTIRE DATABASE EVERY TIME

Do NOT blindly send the complete user database or all historical logs with every AI request.

Instead create a compact context builder:

```typescript
buildAIContext();
```

It should select the minimum relevant information needed for the request.

For example:

### Food question

Prioritize:

```text
Today's meals
Calories
Macros
Activity
Goal
Relevant cycle context
```

### Workout question

Prioritize:

```text
Current phase
Recent activity
Energy
Sleep
Goal
Recent recovery
```

### General conversation

Use:

```text
Name
Goals
Relevant profile information
Current phase
Recent context
Conversation history
```

This reduces token usage and keeps responses focused.

---

# 7. STRUCTURED DATA FIRST

Prefer structured data over sending large natural-language dumps.

For example:

```typescript
{
  name: "User",
  cyclePhase: "luteal",
  cycleDay: 22,
  caloriesConsumed: 1420,
  caloriesRemaining: 380,
  proteinGrams: 82,
  steps: 7200,
  sleepHours: 6.8,
  energyLevel: 3
}
```

rather than converting the same information into a huge paragraph.

---

# 8. CACHE WHAT DOES NOT CHANGE

Do not repeatedly send/recalculate static information.

Cache or reuse:

- User profile
- Height
- Goal
- Preferences
- Language
- Units
- Stable coaching preferences

Refresh dynamic context only when necessary.

---

# 9. AI SHOULD KNOW WHEN NOT TO CALL THE LLM

Not every feature requires AI.

Use deterministic application logic for:

- BMI calculation
- Calorie arithmetic
- Remaining calories
- Macro totals
- Step totals
- Date calculations
- Cycle-day calculations
- Cycle-phase calculation
- Water totals
- Measurement differences
- Basic charts
- Static scientific reference values

The LLM should explain, coach, summarize, or personalize these results — **not replace deterministic calculations.**

This is particularly important for health-related numerical accuracy.

---

# 10. CALORIE COACHING

The application should calculate calorie values using deterministic business logic.

AI may explain them naturally:

> "You have about 420 kcal remaining today."

But AI must not be the source of truth for:

```text
Calories consumed
Calories remaining
BMI
Weight
Macro totals
Cycle day
```

Those values must come from the application's calculation engine.

---

# 11. AI SHOULD NEVER INVENT USER DATA

If data is unavailable, AI must say so.

Never fabricate:

- Meals
- Calories
- Exercise
- Weight
- Symptoms
- Cycle dates
- Sleep
- Measurements
- Medical history

Do not assume the user performed an activity that wasn't logged.

---

# 12. HEALTH & MEDICAL SAFETY

Sini is a fitness/wellness coach, not a doctor.

AI should provide general wellness and fitness guidance but must not:

- Diagnose medical conditions
- Claim certainty about medical conditions
- Prescribe medication
- Recommend changing medication dosage
- Provide dangerous medical instructions
- Present speculative hormonal claims as established medical facts
- Tell users to ignore professional medical advice

When a question involves potentially serious symptoms, medical diagnosis, treatment, or urgent concerns, provide a cautious response and recommend consulting an appropriate healthcare professional.

Apple states that health/medical apps providing potentially inaccurate or harmful information may receive increased scrutiny and should remind users to consult a doctor before making medical decisions. Google Play similarly requires health apps to avoid misleading or harmful functionality and to remind users to consult healthcare professionals for medical advice, diagnosis, or treatment.

---

# 13. NO EXTREME DIET / EXERCISE COACHING

The AI must not encourage:

- Starvation
- Extreme calorie restriction
- Purging
- Dangerous compensatory exercise
- Self-harm
- Excessive exercise as punishment for eating
- Shame around body weight or food

Sini can be honest about calorie balance while remaining supportive.

For example:

> "That dessert was around 300 kcal. If you're still hungry, you can absolutely fit it into today's intake. If you're already at your target, you don't need to punish yourself with exercise."

Do not use guilt or fear as motivation.

---

# 14. FOOD + EXERCISE EXPLANATIONS

When comparing food calories with exercise, frame it as education rather than punishment.

Good:

> "That snack is roughly equivalent to 25–30 minutes of brisk walking for someone your size."

Avoid:

> "You need to work off that dessert."

Exercise should never be presented as punishment for eating.

---

# 15. AI LANGUAGE

Always respect the existing selected language/coach-language architecture.

Do not hardcode English into AI prompts.

If the user has selected:

```text
Hindi
```

the AI should respond in Hindi.

If the future coach-language preference is:

```text
Hinglish
```

the AI should respond in Hinglish.

Preserve Sini's established personality:

- Warm
- Intelligent
- Encouraging
- Honest
- Non-judgmental
- Practical

---

# 16. PERSONALIZATION

Sini should naturally use the user's name when appropriate, but do not overuse it.

Avoid:

> "Amit, ... Amit, ... Amit, ..."

in every message.

Use the name naturally, especially:

- Greetings
- Important encouragement
- Personalized summaries

---

# 17. CONVERSATION MEMORY

The Coach should maintain enough recent conversation context to remain coherent.

Do NOT send unlimited conversation history.

Use a sensible rolling context window.

When the conversation becomes long:

```text
Recent messages
+
Compact conversation summary
+
Current user context
```

instead of sending the entire conversation indefinitely.

---

# 18. DUPLICATE REQUEST PROTECTION

Prevent accidental duplicate AI requests caused by:

- Double taps
- Screen re-renders
- Navigation
- Retry buttons
- Network reconnects

Every request should have a clear lifecycle:

```text
idle
→ loading
→ success / error
```

Do not create duplicate simultaneous requests for the same action.

---

# 19. AI REQUEST PRIORITY

Use this priority:

### Highest

Explicit user chat/message.

### Medium

User explicitly asks:

> "Analyze my day."

### Low

Automatic daily insight.

### Avoid

AI calls caused purely by:

- App launch
- Refresh
- Navigation
- Theme change
- Language change
- Component render

---

# 20. OFFLINE / AI FAILURE

If the AI service is unavailable:

The application must continue functioning.

Use existing deterministic/rule-based fallback logic where appropriate.

Do not leave the Home screen broken simply because the AI request failed.

Example:

```text
AI unavailable
↓
Show deterministic daily summary
↓
Continue application normally
```

---

# 21. AI DATA PRIVACY

Treat profile, cycle, nutrition, body measurements, mood, symptoms, and other health information as sensitive.

Only send the minimum necessary information to the AI provider.

Do not send health data to advertising systems.

Do not use health data for ad targeting.

Do not include unnecessary personal identifiers in AI requests.

The privacy policy and in-app disclosures must accurately explain what personal/health data is sent to third-party AI services and how it is used. Apple requires disclosure and permission for sharing personal data with third-party AI, and Google Play's user-data policy applies to third-party AI integrations.

---

# 22. DO NOT EXPOSE API KEYS

AI API keys must never be embedded directly in the mobile application.

Use the existing secure AI service/backend architecture.

Never put private provider keys in:

```text
.env files shipped to the client
React Native source
app config exposed to the client
Git repository
```

---

# 23. AI COST CONTROL

Add basic monitoring for:

```text
AI request count
Tokens/input size
Tokens/output size
Feature generating request
Success/failure
```

The purpose is to identify accidental AI loops and unexpectedly expensive features.

Especially monitor:

```text
Home
Daily insight
Coach chat
```

---

# 24. FINAL AI ARCHITECTURE

The desired behavior is:

```text
                    Sini
                       │
              ┌────────┴────────┐
              │                 │
         User action       Automatic
              │                 │
              ↓                 ↓
          Coach Chat       Cached Insight
              │                 │
              ↓          Generate only when
          AI Request      genuinely necessary
              │
              ↓
      Relevant User Context
              │
              ↓
         AI Service
              │
              ↓
       Safety / Validation
              │
              ↓
           Response
```

The key rule:

> **AI should be available everywhere it adds meaningful value, but it should never be called simply because the app rendered.**

---

# 25. ACCEPTANCE CRITERIA

Before finishing, verify:

- [ ] Home does not call AI on every app open
- [ ] Home insight is cached
- [ ] Chat can make normal conversational AI requests
- [ ] Duplicate requests are prevented
- [ ] User context is available to relevant AI requests
- [ ] AI does not receive unnecessary historical data
- [ ] Deterministic calculations remain outside the LLM
- [ ] AI cannot invent missing user data
- [ ] AI respects selected language
- [ ] AI maintains Sini's personality
- [ ] Long conversations use controlled context
- [ ] AI failures do not break the app
- [ ] AI API keys remain secure
- [ ] Health data is not shared with advertising systems
- [ ] Medical/health safety guardrails are present
- [ ] AI usage/token consumption can be monitored
- [ ] No accidental AI calls occur from refresh/navigation/theme changes

**Do not change the existing AI functionality unnecessarily.**

The goal is simply to make the current AI implementation **efficient, contextual, safe, privacy-conscious, and production-ready.**
