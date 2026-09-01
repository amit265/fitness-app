# MISSION: DESIGN AND BUILD A PRODUCTION-READY CYCLE-AWARE FEMALE FITNESS & WELLNESS APP

You are acting as a **Principal Mobile Engineer, Product Architect, UX Designer, and Technical Product Lead**.

Build a polished, production-ready cross-platform mobile application using **React Native + Expo + TypeScript**.

The product is a **cycle-aware fitness, nutrition, body-composition, and wellness companion for women**.

The core product promise is:

> **Help the user understand how she feels today and give her a realistic, personalized plan for today.**

The application should feel like an **empathetic personal wellness coach**, not a clinical medical application and not a calorie-counting punishment system.

---

# 0. CRITICAL EXECUTION RULE — PLAN BEFORE CODE

**DO NOT immediately start implementing the application.**

Before writing substantial application code:

1. Analyze the entire specification.
2. Identify contradictions, unrealistic assumptions, technical risks, UX problems, and unnecessary complexity.
3. Propose the complete product architecture.
4. Define the MVP scope and explicitly identify what should be postponed to V2/V3.
5. Define the screen architecture and navigation.
6. Define the data architecture and TypeScript models.
7. Define the cycle calculation architecture.
8. Define the nutrition/activity estimation architecture.
9. Define the AI architecture and its boundaries.
10. Define the state-management architecture.
11. Define the offline-first strategy.
12. Define the component/design-system architecture.
13. Define the implementation phases.
14. Identify any dependencies that should be avoided or replaced.
15. Present the proposed plan for approval.

**Do not build the complete application until the architecture and implementation plan have been reviewed and approved.**

When implementation begins, work incrementally and keep the application runnable after every major phase.

---

# 1. PRODUCT VISION

Create a premium wellness application centered around four connected systems:

### A. Cycle Awareness

Understand the user's menstrual cycle and use it as one input when personalizing recommendations.

### B. Daily Readiness

Understand how the user feels today using:

* Sleep
* Energy
* Mood
* Stress
* Hydration
* Activity
* Cycle phase

### C. Nutrition & Activity Logging

Allow users to quickly record meals and exercise using natural language, structured inputs, or quick actions.

### D. Body Recomposition & Progress

Track weight, body measurements, activity, and long-term trends without creating unhealthy scale anxiety.

The application should continuously answer:

> **“Given where I am in my cycle and how I feel today, what would be a good choice for me today?”**

---

# 2. PRODUCT PRINCIPLES

## 2.1 Empathetic, Never Punitive

Never use shame-based language.

Avoid:

* “You failed.”
* “You went over your calories.”
* “Bad day.”
* “You didn't complete your goal.”
* “You need to burn this off.”
* “You are behind.”

Prefer:

* “Today was a higher-energy day. That's okay.”
* “Your energy is a little lower today. A lighter workout may feel better.”
* “You’re close to your protein target.”
* “Your cycle and sleep suggest giving yourself a little more recovery today.”

The application should reinforce consistency and self-awareness rather than perfection.

---

# 3. IMPORTANT HEALTH & SCIENCE BOUNDARIES

The cycle engine must **NOT assume that every woman has a 28-day cycle or predictable ovulation**.

The system must support:

* Variable cycle lengths
* Variable period lengths
* Irregular cycles
* User corrections
* Missed/late periods
* Manually recorded cycle events

The default 28-day model may be used when insufficient information exists, but it must be treated as an **estimate**, not biological certainty.

Never present estimated ovulation, hormonal states, calorie requirements, or metabolic changes as medical facts about an individual user.

Use language such as:

* “estimated”
* “may”
* “often”
* “some people experience”
* “based on your logged patterns”

Avoid presenting wellness recommendations as diagnosis or treatment.

The application should clearly communicate that it is a wellness tool and not a substitute for medical care.

---

# 4. CORE USER LOOP

The primary experience should follow this architecture:

```text
USER DATA
    ↓
Cycle State
    +
Sleep
    +
Energy
    +
Mood
    +
Hydration
    +
Activity
    +
Nutrition
    ↓
DAILY READINESS
    ↓
TODAY'S RECOMMENDATION
    ↓
USER LOGS ACTIVITY
    ↓
APP LEARNS USER PATTERNS
```

The product should feel increasingly personalized over time.

---

# 5. CYCLE ENGINE

Create a dedicated cycle engine:

```text
src/domain/cycle/
```

The cycle engine should calculate:

* Current cycle day
* Estimated cycle phase
* Period status
* Estimated fertile window
* Estimated ovulation window
* Cycle progress
* Next expected period
* Confidence level of predictions

Example:

```typescript
export type CyclePhase =
  | 'menstrual'
  | 'follicular'
  | 'ovulatory'
  | 'luteal'
  | 'unknown';

export interface CycleState {
  cycleDay: number;
  phase: CyclePhase;
  daysUntilExpectedPeriod?: number;
  estimatedOvulationDay?: number;
  confidence: 'low' | 'medium' | 'high';
  isPeriodExpectedSoon: boolean;
}
```

Do not hardcode biological assumptions throughout UI components.

All cycle calculations must live inside the cycle domain.

---

# 6. DAILY READINESS ENGINE

Create a deterministic readiness system.

Inputs may include:

* Sleep duration
* Sleep quality
* Energy
* Mood
* Stress
* Hydration
* Recent activity
* Recovery
* Cycle phase

Output:

```typescript
export interface ReadinessScore {
  score: number; // 0–100
  level: 'low' | 'moderate' | 'good' | 'high';
  factors: ReadinessFactor[];
  recommendation: DailyRecommendation;
}
```

The score must be **explainable**.

For example:

```text
Readiness: 74

Sleep       +12
Energy      +15
Hydration   +8
Recovery    +10
Cycle       +4
Stress      -5
```

Do not allow an LLM to arbitrarily generate the numerical readiness score.

The calculation should be deterministic and testable.

---

# 7. TODAY'S RECOMMENDATION ENGINE

Create a recommendation engine that combines:

* User goal
* Readiness
* Cycle state
* Recent activity
* Recovery
* User preferences

Possible recommendations:

```text
REST
LIGHT_MOVEMENT
WALK
MOBILITY
MODERATE_CARDIO
STRENGTH
HIGHER_INTENSITY_STRENGTH
```

The recommendation engine should produce:

```typescript
export interface DailyRecommendation {
  activityType: ActivityRecommendationType;
  durationMinutes?: number;
  intensity: 'easy' | 'moderate' | 'challenging';
  title: string;
  explanation: string;
  recoveryNote?: string;
}
```

The user should understand **why** the recommendation was made.

---

# 8. NATURAL-LANGUAGE LOGGING

Users should be able to enter:

> “Had two eggs, toast and a banana.”

or:

> “Walked for 40 minutes.”

The system should transform natural language into structured data.

IMPORTANT:

**AI should extract and interpret information. It should not be the source of truth for deterministic calculations.**

Architecture:

```text
Natural Language
      ↓
AI Extraction
      ↓
Structured Food / Activity Objects
      ↓
Nutrition / Activity Calculation Engine
      ↓
User Confirmation
      ↓
Saved Log
```

For uncertain nutrition estimates, clearly indicate that the value is an estimate.

Allow users to edit:

* Portion
* Calories
* Protein
* Carbohydrates
* Fat
* Duration
* Intensity

Never silently save a highly uncertain AI estimate without allowing correction.

---

# 9. NUTRITION SYSTEM

Separate nutrition data from AI.

Create:

```text
src/domain/nutrition/
src/services/nutritionService.ts
```

The system should eventually support:

* Food search
* Common foods
* User-created foods
* Portion sizes
* Calories
* Protein
* Carbohydrates
* Fat
* Fiber

AI may convert:

> “1 bowl chicken rice”

into a structured food query.

The nutrition service determines the actual estimate.

For MVP, use a curated local food dataset/mock database so the app works without an external API.

---

# 10. ACTIVITY SYSTEM

Create a structured activity model:

```typescript
export type ActivityType =
  | 'strength'
  | 'cardio'
  | 'walking'
  | 'running'
  | 'swimming'
  | 'cycling'
  | 'mobility'
  | 'yoga'
  | 'restorative'
  | 'other';
```

Track:

* Activity
* Duration
* Intensity
* Optional distance
* Optional calories
* Notes

Estimated calorie burn should be clearly labeled as an estimate.

---

# 11. BODY & PROGRESS TRACKING

Track:

* Weight
* Chest
* Waist
* Navel/Tummy
* Hips
* Thigh
* Biceps
* Shoulders/Armpit
* Calves
* Neck

Allow users to record measurements periodically rather than requiring daily entry.

Progress views should include:

### Weight

* 7-day trend
* 30-day trend
* 90-day trend

### Measurements

* Baseline
* Current
* Change

### Recomposition

Show weight and measurement changes together.

The UX should explicitly explain that short-term scale fluctuations can occur due to hydration, food volume, and menstrual-cycle-related changes.

Avoid implying that every weight change represents fat gain/loss.

---

# 12. DAILY CHECK-IN

Create a fast check-in that can be completed in under 30 seconds.

Track:

### Sleep

* Duration
* Quality

### Energy

1–5

### Mood

* Great
* Good
* Okay
* Low
* Irritable
* Anxious
* Tired

### Stress

1–5

### Hydration

Litres

### Symptoms

Selectable tags:

* Cramps
* Bloating
* Headache
* Breast tenderness
* Cravings
* Fatigue
* Acne
* Mood changes
* Other

The check-in should be optional and lightweight.

---

# 13. ONBOARDING

Design onboarding around progressive disclosure.

### Step 1 — About You

* Name
* Age
* Height
* Weight

### Step 2 — Goal

Possible goals:

* Lose fat
* Build strength
* Improve fitness
* Maintain weight
* Improve consistency
* General wellness

### Step 3 — Cycle

* Last period start date
* Typical cycle length
* Typical period duration
* Regular / irregular

### Step 4 — Preferences

* Workout preferences
* Available equipment
* Typical workout duration
* Dietary preferences

### Step 5 — Baseline

Optional measurements.

### Step 6 — Personalization

Generate a welcoming summary:

> “We’ll use your cycle, energy, sleep, and goals to help you decide what makes sense today.”

Do not overwhelm the user with a 20-field onboarding form.

---

# 14. PRIMARY NAVIGATION

Use a simple bottom navigation structure.

Recommended:

```text
TODAY
LOG
PROGRESS
CYCLE
PROFILE
```

The Coach experience should initially live inside **Today** and **Log** rather than being another primary tab.

Avoid excessive navigation.

---

# 15. HOME / TODAY SCREEN

This is the most important screen in the application.

Suggested hierarchy:

```text
Good morning, Sarah

Cycle Day 19
Luteal Phase
────────────────

READINESS
74
Good

“Your sleep was solid and your energy
looks good today. A moderate strength
session could be a great fit.”

────────────────

TODAY'S PLAN

🏋 Strength
35 min
Moderate intensity

+ 10 min easy walk

────────────────

NUTRITION FOCUS

Protein • Hydration • Balanced meals

────────────────

QUICK LOG

Sleep   Water   Meal   Workout   Mood
```

The screen should answer:

> **What is happening with me?**
>
> **How am I feeling?**
>
> **What should I do today?**

within a few seconds.

---

# 16. LOG SCREEN

Create one unified logging interface.

At the top:

> “What did you do or eat?”

Input examples:

> “Chicken rice bowl for lunch”

> “30 min treadmill”

> “Slept 7 hours”

Provide quick actions:

```text
+ Meal
+ Workout
+ Water
+ Sleep
+ Weight
+ Check-in
```

After AI parsing, show a confirmation card before saving uncertain data.

---

# 17. PROGRESS SCREEN

Sections:

### Overview

* Current weight
* Weight trend
* Measurement changes
* Consistency

### Measurements

Visual comparison:

```text
Baseline → Current → Change
```

### Trends

Charts should support:

* Weight
* Waist
* Hips
* Activity
* Sleep
* Readiness

Where useful, allow cycle-phase overlays.

---

# 18. CYCLE SCREEN

Create a visually beautiful cycle calendar.

Display:

* Current cycle day
* Current phase
* Period days
* Symptoms
* Previous cycles
* Estimated next period

Use a clear distinction between:

**Logged information**

and

**Estimated information**

Predicted information should never visually look as certain as user-entered data.

---

# 19. COACH / AI ARCHITECTURE

Create a modular AI service:

```text
src/services/ai/
```

Example:

```typescript
interface AIService {
  parseMeal(input: string): Promise<MealExtraction>;
  parseActivity(input: string): Promise<ActivityExtraction>;
  generateDailyInsight(context: CoachingContext): Promise<CoachInsight>;
  answerCoachQuestion(
    input: string,
    context: CoachingContext
  ): Promise<CoachResponse>;
}
```

Provide:

1. Remote LLM implementation
2. Local/rule-based fallback

The application must remain functional if:

* API key is missing
* Network is unavailable
* AI request fails
* API rate limit occurs

AI should never control core business logic.

---

# 20. COACHING CONTEXT

The AI should receive a structured context object rather than raw application state.

Example:

```typescript
export interface CoachingContext {
  userGoal: UserGoal;
  cycleState: CycleState;
  readiness: ReadinessScore;
  recentSleep: SleepSummary;
  recentActivity: ActivitySummary;
  nutritionSummary?: NutritionSummary;
  recentSymptoms: string[];
}
```

This makes the AI layer modular and testable.

---

# 21. DATA MODEL

Use normalized domain models rather than putting the entire application inside one enormous `DailyLog`.

Recommended domains:

```text
User
Cycle
Period
DailyCheckIn
Meal
FoodItem
Activity
BodyMeasurement
Goal
Recommendation
CoachConversation
```

Use IDs and timestamps.

Do not duplicate derived values unnecessarily.

For example, `cyclePhase` should generally be calculated from cycle data rather than permanently duplicated in every daily record unless there is a strong reason.

---

# 22. TECH STACK

### Core

* React Native
* Expo
* TypeScript
* Expo Router

### State

* Zustand
* AsyncStorage initially

Keep persistence abstract enough that MMKV or another storage layer can be introduced later.

### UI

Use either:

* NativeWind

or

* StyleSheet

Choose one and use it consistently.

### Charts

Prefer lightweight SVG/custom visualizations where practical.

Avoid adding large dependencies merely for simple charts.

### Architecture

Use a feature/domain-oriented structure such as:

```text
src/
  app/
  components/
  features/
    today/
    logging/
    progress/
    cycle/
    profile/
  domain/
    cycle/
    readiness/
    nutrition/
    activity/
    progress/
  services/
    ai/
    nutrition/
    storage/
  store/
  constants/
  utils/
  types/
```

---

# 23. BRANDING

All brand-level configuration must be centralized.

Create:

```text
src/constants/appConfig.ts
```

Example:

```typescript
export const APP_CONFIG = {
  name: 'AuraFit',
  tagline: 'Fitness in sync with your rhythm',
  version: '1.0.0',
  supportEmail: 'support@example.com',
};
```

Do not scatter brand names throughout the application.

---

# 24. VISUAL DESIGN DIRECTION

Create a premium, calm, modern wellness aesthetic.

Palette:

* Sage Green
* Soft Rose
* Warm Oat
* Cream
* Slate Charcoal
* Muted Plum

Avoid:

* aggressive neon fitness aesthetics
* excessive gradients
* clinical hospital aesthetics
* overly feminine clichés
* excessive pink
* childish illustrations

The visual language should feel:

**premium + calm + intelligent + warm + trustworthy**

Use:

* generous spacing
* large typography
* rounded cards
* subtle elevation
* restrained iconography
* clear information hierarchy
* tasteful micro-interactions

---

# 25. OFFLINE-FIRST REQUIREMENTS

The app should work without an internet connection for core functionality.

Offline functionality should include:

* Cycle calculations
* Daily check-ins
* Manual meal logging
* Manual activity logging
* Measurements
* Progress charts
* Readiness calculation
* Basic recommendations

AI functionality should gracefully degrade.

Example:

```text
AI unavailable

You can still log your meal manually.
```

Never show a broken screen simply because the AI service is unavailable.

---

# 26. ERROR HANDLING

Handle:

* Missing user data
* Invalid dates
* Invalid cycle length
* Failed AI requests
* Network failures
* Corrupt persisted state
* Empty datasets
* Partial onboarding
* Invalid nutrition estimates

The app should fail gracefully.

---

# 27. PRIVACY & DATA MINIMIZATION

Cycle, body, nutrition, and wellness information is sensitive.

Design the architecture so that:

* Only necessary data is collected.
* AI requests contain only the context required for the task.
* API boundaries are explicit.
* Sensitive data is not logged to console in production.
* Secrets/API keys are never embedded directly in the mobile application.
* Production AI calls should go through a secure backend when required.

Do not claim that data is encrypted or HIPAA/GDPR compliant unless the implementation actually provides it.

---

# 28. MVP SCOPE

Before implementation, explicitly evaluate the following MVP:

### MUST HAVE

* Onboarding
* User profile
* Cycle tracking
* Cycle calculation
* Today dashboard
* Daily check-in
* Manual meal logging
* Manual activity logging
* Weight tracking
* Body measurements
* Basic progress charts
* Readiness score
* Daily recommendation
* Offline persistence

### SHOULD HAVE

* Natural-language meal logging
* Natural-language activity logging
* AI daily insight
* Cycle-aware progress charts
* Coach conversation

### V2

* Voice logging
* Advanced food database
* Personalized recipes
* Advanced trend analysis
* Habit intelligence
* More sophisticated personalization
* Cloud sync
* Account system
* Wearable integrations

Do not allow V2 features to destabilize the MVP.

---

# 29. DEVELOPMENT PHASES

Propose and follow a staged implementation.

### Phase 0

Product architecture and technical plan.

### Phase 1

Project setup + design system + navigation.

### Phase 2

Onboarding + profile + persistence.

### Phase 3

Cycle engine.

### Phase 4

Today dashboard + readiness engine.

### Phase 5

Logging system.

### Phase 6

Progress + measurements.

### Phase 7

AI integration.

### Phase 8

Polish + animations + empty states + error states.

### Phase 9

Testing + performance + production readiness.

After every phase:

* Run TypeScript checks.
* Run linting.
* Test critical flows.
* Ensure the application launches successfully.
* Fix regressions before continuing.

---

# 30. TESTING REQUIREMENTS

Write unit tests for deterministic domain logic, especially:

* Cycle calculations
* Cycle phase calculations
* Readiness score
* Recommendation engine
* Progress calculations
* Nutrition calculations

Do not rely on snapshot tests alone.

The most important business logic must be testable independently from React components.

---

# 31. QUALITY BAR

The final application should not feel like an AI-generated prototype.

It should feel like a real consumer mobile product.

Prioritize:

1. Excellent UX
2. Clear information hierarchy
3. Reliable calculations
4. Maintainable architecture
5. Offline resilience
6. Accessibility
7. Performance
8. Visual polish

Do not create dozens of screens simply to make the application appear complete.

A smaller number of excellent screens is preferable to a large number of mediocre screens.

---

# 32. FIRST RESPONSE REQUIREMENT

Before writing substantial code, respond with a **Product & Engineering Blueprint** containing:

### 1. Product critique

What is good, what should change, and why.

### 2. MVP definition

What should be built first.

### 3. V2 backlog

What should explicitly be postponed.

### 4. Screen map

Every screen and its purpose.

### 5. Navigation architecture

### 6. Data architecture

Entities, relationships, and persistence.

### 7. Cycle engine design

### 8. Readiness/recommendation engine

### 9. AI architecture

### 10. Folder structure

### 11. Design system

### 12. Dependency list

Including why each dependency is needed.

### 13. Testing strategy

### 14. Implementation roadmap

### 15. Risks and unresolved decisions

**STOP AFTER PRESENTING THIS BLUEPRINT.**

Do not begin implementing the full application until the blueprint is approved.

Once approved, implement the application phase by phase.
