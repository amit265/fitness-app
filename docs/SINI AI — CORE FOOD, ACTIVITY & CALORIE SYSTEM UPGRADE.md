# Sini — CORE FOOD, ACTIVITY & CALORIE SYSTEM UPGRADE

You are working on an existing, functional Sini mobile application.

The app already contains:

- Cycle tracking and cycle calendar
- Dynamic cycle-based themes
- AI Coach
- AI food/activity logging
- Daily dashboard
- Body measurements
- BMI
- Sleep, hydration, steps, mood and energy tracking
- Multi-language architecture
- Advertising / Premium system
- Existing navigation and UI

**DO NOT rebuild the application.**

**DO NOT replace existing working systems.**

This is an architectural and product upgrade focused on making:

> **Food + Activity + Calorie Balance**

the strongest daily-use loop inside Sini.

---

# 1. FIRST — AUDIT THE EXISTING IMPLEMENTATION

Before writing code, inspect the existing project and understand:

- Current food logging
- Current calorie calculations
- Current activity logging
- Current calorie-burn calculations
- Existing AI service
- Existing user profile
- Existing Home dashboard
- Existing cycle engine
- Existing persistence/database
- Existing charts
- Existing theme system
- Existing i18n
- Existing navigation

Identify what already works.

**Reuse existing components, services, models and calculations wherever possible.**

Do not create duplicate systems simply because a new feature is being added.

The final implementation should feel like an evolution of the existing Sini app.

---

# 2. DEFINE SINI'S CORE DAILY LOOP

The primary daily loop should become:

```text
             Sini
                │
        ┌───────┴────────┐
        ↓                ↓
      FOOD            ACTIVITY
        ↓                ↓
     CALORIES        CALORIES BURNED
        │                │
        └───────┬────────┘
                ↓
          DAILY BALANCE
                ↓
      CALORIES REMAINING
                ↓
        "WHAT NEXT?"
                ↓
       Sini's Guidance
                ↓
          User continues
```

The cycle system remains extremely important, but it acts as a **personalization/context layer** around this daily loop.

---

# 3. HOME SCREEN SHOULD MAKE THIS OBVIOUS

The Home screen should prominently answer:

### What have I eaten?

### What have I burned?

### How many calories do I have remaining?

### What should I do next?

The existing cycle information should remain visible and beautiful, but the calorie/activity loop should become one of the dominant elements.

Do not remove the existing cycle experience.

---

# 4. DAILY CALORIE SUMMARY

Create a clear daily calorie model.

Conceptually:

```text
Daily calorie target
        +
Food consumed
        -
Activity expenditure
        =
Current daily balance
```

However, distinguish between:

### Food calories

Energy consumed from food/drinks.

### Activity calories

Estimated energy expenditure from logged activity.

### Remaining calories

How much food energy the user can approximately consume while staying around their configured daily target.

Do NOT let the AI calculate these numbers.

Use deterministic application logic.

---

# 5. AI IS NOT THE CALCULATOR

This is extremely important.

AI can:

- Understand natural language
- Identify food
- Identify activity
- Estimate ambiguous portions
- Explain numbers
- Coach
- Recommend options
- Personalize communication

But deterministic code should calculate:

- Daily calorie target
- Calories consumed
- Calories remaining
- Macro totals
- Activity expenditure
- BMI
- Cycle day
- Cycle phase
- Measurement changes

The AI should consume these calculated values and explain them.

---

# 6. FOOD INPUT — THREE LEVELS

Food logging should support three modes.

## MODE 1 — QUICK / AI

User can simply say:

> "I had nasi goreng with an egg and iced tea."

Sini should identify:

- Food
- Approximate portions
- Calories
- Protein
- Carbohydrates
- Fat

and clearly mark the result as an estimate.

Example:

```text
Estimated meal

Nasi goreng
1 plate

Egg
1

Iced tea
1 glass

≈ 720 kcal
Protein 24g
Carbs 88g
Fat 30g

[Add to Today]
[Edit Details]
```

The user must be able to review/edit AI estimates before saving when appropriate.

---

# 7. MODE 2 — FOOD SEARCH

Provide a searchable food database/reference system.

Users should be able to search common foods such as:

```text
Rice
Chicken
Egg
Bread
Milk
Banana
Nasi goreng
Rendang
Tempe
Tahu
Mie goreng
Soto
Bakso
Roti
Dal
Roti canai
Pizza
Burger
etc.
```

Do NOT attempt to manually hardcode every food in the world.

Design the food system so it can work with an appropriate nutrition data source/database.

The system should eventually support:

- Common foods
- Regional foods
- Restaurant foods where data exists
- Packaged foods
- Branded foods
- User-created foods

---

# 8. MODE 3 — CUSTOM FOOD / BUILD A MEAL

This is a major feature.

Users must be able to enter detailed information themselves.

Example:

```text
BUILD YOUR MEAL

Rice
[ 180 ] [ grams ]

Chicken
[ 120 ] [ grams ]

Egg
[ 1 ] [ piece ]

Cooking oil
[ 10 ] [ grams ]

Sauce
[ 20 ] [ grams ]

+ Add ingredient
```

Then:

```text
MEAL TOTAL

612 kcal

Protein   38g
Carbs     65g
Fat       21g

[Add to Today]
```

The user should have control over:

- Quantity
- Unit
- Serving size
- Ingredients
- Cooking method where useful
- Brand where useful

Do not force advanced information on users.

---

# 9. PROGRESSIVE COMPLEXITY

Do not make every food entry look like a nutrition spreadsheet.

Use:

```text
Quick
↓
Search
↓
Custom
↓
Advanced details
```

A casual user should be able to log food in seconds.

A highly motivated user should be able to enter detailed quantities.

Both users should use the same underlying nutrition model.

---

# 10. CUSTOM FOOD SHOULD SUPPORT USER-CREATED FOODS

Allow users to save custom foods/meals.

Example:

> My Breakfast Bowl

with:

```text
Calories
Protein
Carbs
Fat
Ingredients
Serving size
```

Then the user can quickly reuse it later.

Store stable IDs and numerical values.

Do not store translated UI strings as food identifiers.

---

# 11. PORTION SIZE MATTERS

The system should recognize that:

> "1 bowl of rice"

is an estimate.

Where possible, provide editable quantity:

```text
1 bowl
↓
150g
200g
250g
Custom
```

For AI estimates, communicate uncertainty honestly.

Do not pretend that AI knows exact calories from an ambiguous description.

---

# 12. INDONESIAN FOOD SHOULD BE WELL SUPPORTED

Because Sini's initial real-world testing is centered around Indonesian eating patterns, make Indonesian foods a strong test category.

Test examples:

- Nasi putih
- Nasi goreng
- Mie goreng
- Mie instan
- Rendang
- Ayam goreng
- Ayam bakar
- Tempe
- Tahu
- Gado-gado
- Soto
- Bakso
- Martabak
- Pisang goreng
- Kerupuk
- Sambal
- Es teh manis
- Kopi susu

But do not limit the architecture to Indonesian food.

The final system must be globally extensible.

---

# 13. WORKOUT INPUT — THREE LEVELS

Activity tracking should follow the same philosophy.

## MODE 1 — QUICK / AI

Example:

> "I walked for 40 minutes."

Sini interprets:

```text
Walking
40 minutes
Estimated expenditure
```

Clearly identify the value as an estimate.

---

# 14. MODE 2 — ACTIVITY SEARCH

Users should be able to select from a broad activity library.

Categories should include:

### Walking

- Casual walking
- Brisk walking
- Hiking
- Treadmill

### Running

- Jogging
- Running
- Sprinting
- Treadmill running

### Cycling

- Outdoor cycling
- Stationary bike
- Indoor cycling

### Swimming

- General swimming
- Laps
- Water walking
- Water aerobics

### Strength

- Weight training
- Bodyweight
- Resistance training
- Gym workouts

### Cardio

- HIIT
- Aerobics
- Dance
- Jump rope
- Rowing
- Stair climbing
- Elliptical

### Sports

Support common sports such as:

- Football
- Basketball
- Tennis
- Badminton
- Volleyball
- etc.

### Restorative movement

- Yoga
- Stretching
- Mobility
- Pilates
- Light recovery movement

The architecture should allow more activities to be added later without rewriting the activity system.

---

# 15. MODE 3 — CUSTOM WORKOUT

Allow detailed workout entry.

Example:

```text
CUSTOM WORKOUT

Activity
Strength Training

Duration
52 minutes

Intensity
Moderate

EXERCISES

Squat
40 kg × 10 × 3

Bench Press
30 kg × 10 × 3

Lat Pulldown
35 kg × 12 × 3

+ Add Exercise
```

The user should be able to track performance without being forced to enter every detail.

---

# 16. EXERCISE CALORIE ESTIMATES

Activity expenditure should be calculated using the best available deterministic method/data.

Consider relevant factors such as:

- User body weight
- Activity
- Duration
- Intensity
- Distance/speed when available
- Exercise type

But do NOT pretend the estimate is perfectly accurate.

Display:

```text
Estimated burn
~250–320 kcal
```

when appropriate rather than creating false precision.

For strength training, distinguish:

**Workout performance tracking**

from:

**Estimated energy expenditure**

Do not claim calorie expenditure is exact simply because sets/reps are known.

---

# 17. USER PROFILE MUST SUPPORT CALCULATIONS

Make sure the system has the necessary profile information:

- Age
- Height
- Weight
- Goal
- Activity level where appropriate
- Target weight

Height must be collected during onboarding/profile setup if it is currently missing.

The existing BMI functionality should continue working.

---

# 18. DAILY CALORIE BALANCE

Create one centralized calorie-balance service.

Conceptually:

```typescript
calculateDailyNutritionSummary();
```

It should produce something similar to:

```typescript
{
  (calorieTarget,
    caloriesConsumed,
    activityCalories,
    remainingCalories,
    proteinConsumed,
    proteinTarget,
    carbsConsumed,
    fatsConsumed);
}
```

The exact model can adapt to the existing codebase.

Do not duplicate this calculation inside Home, Food, Progress, or AI.

---

# 19. HOME CALORIE CARD

Make this highly understandable.

Example:

```text
TODAY

1,420 kcal eaten
        ↓
     380 kcal
    remaining

🔥 220 kcal active

Protein
82 / 110g
```

The exact visual design should follow the existing Sini theme.

The user should understand the situation within seconds.

---

# 20. "WHAT CAN I EAT?" GUIDANCE

If calories remain, Sini can provide suggestions.

Example:

```text
You have about 450 kcal left today.

You could have:

🥗 Chicken salad
~380 kcal

🍚 Small rice + chicken bowl
~420 kcal

🥣 Yogurt + fruit
~300 kcal
```

These are suggestions, not mandatory prescriptions.

---

# 21. "WHAT SHOULD I DO?" GUIDANCE

If the user has consumed more than planned, Sini should explain the situation honestly but without shame.

Example:

> You're around 250 kcal above today's target. That's not a failure. You don't need to punish yourself with exercise. If you want to move, a relaxed 30–40 minute walk could help you stay active today.

Never say:

> You need to burn off what you ate.

Exercise should not become punishment for food.

---

# 22. FOOD ↔ ACTIVITY COMPARISONS

The app may use relatable comparisons to help users understand energy.

Example:

```text
🍰 Dessert
≈ 280 kcal

For your current profile, that's roughly equivalent to:
🚶 ~45 minutes of brisk walking
```

However:

- Label all exercise numbers as estimates.
- Never frame food as something that must be "paid back."
- Never encourage excessive exercise.
- Never shame high-calorie foods.
- Never imply that eating requires compensation.

The purpose is **education**, not punishment.

---

# 23. CYCLE CONTEXT SHOULD MODIFY COACHING — NOT THE MATH

The calorie engine should remain consistent.

The cycle engine can influence:

- Tone
- Workout suggestions
- Recovery recommendations
- Food suggestions
- Expectations
- Motivation

Example:

Same calorie situation:

```text
Calories: +250 above target
```

But:

### High-energy phase

Sini may suggest:

> If you're feeling good, you could do your planned workout or take a brisk walk.

### Low-energy / late-cycle day

Sini may say:

> You're a little above today's target, but you're also feeling low-energy today. Don't try to compensate with a hard workout. A gentle walk or rest is completely reasonable.

The number stays truthful.

The coaching adapts.

---

# 24. WEIGHT / WATER RETENTION

Do not let the calorie system interpret every weight increase as fat gain.

The existing cycle-aware water-retention logic should remain.

Sini should distinguish between:

- Scale weight
- Expected water fluctuation
- Long-term trend
- Actual calorie balance

Do not claim that a 1 kg overnight increase is 1 kg of fat.

---

# 25. DAILY ACTIVITY

Activity should include more than formal workouts.

Track:

- Steps
- Walking
- Exercise
- Swimming
- Cycling
- Sports
- Strength
- Other movement

The Home screen should provide a combined view of daily movement.

---

# 26. DO NOT DOUBLE COUNT ACTIVITY

This is critical.

If steps are already being used to estimate activity expenditure, do not automatically add the same walking activity again unless the data source clearly distinguishes them.

Design the activity/calorie system to avoid:

```text
Walking 5,000 steps
+
Walking workout 40 min
=
same movement counted twice
```

Where overlap exists, use a clear deduplication strategy.

---

# 27. USER CORRECTION

Every AI-estimated food or activity should be editable.

For example:

```text
AI estimate:
720 kcal

[Edit]

User changes:
Rice → 200g
Egg → 2
Tea → unsweetened
```

Then recalculate using deterministic logic.

User correction should take priority over the AI estimate.

---

# 28. DATA MODEL PRINCIPLE

Store structured data.

Example:

```typescript
{
  foodId,
  name,
  quantity,
  unit,
  calories,
  proteinGrams,
  carbsGrams,
  fatsGrams,
  source: 'database' | 'ai_estimate' | 'custom',
}
```

Activity:

```typescript
{
  activityId,
  type,
  durationMinutes,
  intensity,
  caloriesBurned,
  source: 'database' | 'ai_estimate' | 'custom',
}
```

Do not store entire UI sentences as the underlying data.

---

# 29. AI SHOULD RETURN STRUCTURED RESULTS

Where AI is used to interpret food/activity input, prefer structured output.

For example:

```json
{
  "type": "food",
  "items": [
    {
      "name": "Nasi goreng",
      "quantity": 1,
      "unit": "plate",
      "estimatedCalories": 550
    }
  ]
}
```

Then the application validates the result and calculates/normalizes the final values.

Do not allow arbitrary AI text to directly modify calorie totals.

---

# 30. AI CONFIDENCE / UNCERTAINTY

When AI is uncertain about a food or portion:

Ask a useful follow-up.

Example:

> Was that a small, medium, or large plate?

instead of silently pretending the estimate is accurate.

For example:

```text
"1 bowl of rice"
```

could ask:

> Roughly how much was it?

with quick options:

```text
Small
Medium
Large
Custom
```

Do not ask unnecessary questions for every food.

Only ask when uncertainty meaningfully changes the result.

---

# 31. DAILY INSIGHT

The existing AI daily insight should use the new calorie/activity data.

It should summarize:

```text
Food
+
Activity
+
Remaining calories
+
Cycle
+
Energy/recovery
```

But the insight should be cached.

Do NOT call the AI every time Home opens.

---

# 32. AI CALL FREQUENCY

Respect the existing AI guardrails.

Do not trigger AI because:

- App opened
- Screen refreshed
- User switched tabs
- Theme changed
- Language changed
- Component rendered

AI calls should happen because:

- User explicitly asks
- New meaningful data requires an updated AI interpretation
- Daily insight genuinely needs regeneration

Use cached AI results whenever possible.

---

# 33. PERSONAL COACH CONTEXT

Sini should have relevant user context available:

- Name
- Age
- Height
- Goal
- Current weight
- Cycle information
- Recent food
- Recent activity
- Calorie balance
- Sleep
- Energy
- Relevant mood/symptoms

But do NOT send the entire database with every request.

Build a compact contextual representation.

---

# 34. SCOPE OF THIS UPGRADE

This task is specifically about improving:

```text
FOOD
ACTIVITY
CALORIES
DAILY BALANCE
AI COACHING AROUND THESE
```

Do not redesign:

- Cycle tracking
- Dynamic themes
- Ads
- Premium
- i18n
- Navigation

unless a small integration change is necessary.

---

# 35. USER EXPERIENCE PRINCIPLE

Sini should never make the user feel like they need to be perfect.

The core message is:

> **Know what you ate. Know how you moved. Understand the numbers. Make the next good decision.**

Not:

> Eat less.
> Exercise more.
> Feel guilty.

---

# 36. THE DESTYA TEST CASE

Use realistic scenarios when testing the system.

Do not design exclusively around one person, but use realistic real-world behavior as a stress test.

Test scenarios such as:

### Scenario A — Normal day

User eats normal meals and exercises.

Expected:

Clear calorie balance and positive reinforcement.

### Scenario B — High-calorie meal

User eats a large meal.

Expected:

Accurate estimate, no shame, clear remaining balance.

### Scenario C — Low-energy cycle day

User eats more than target and feels exhausted.

Expected:

Truthful calorie information + gentle recommendation.

Do not recommend excessive exercise.

### Scenario D — Cravings

User wants something sweet.

Expected:

Sini explains how it can fit into the remaining calories.

### Scenario E — No workout

User does not exercise.

Expected:

No guilt.

Suggest achievable movement if appropriate.

### Scenario F — Detailed user

User wants precise tracking.

Expected:

Custom food/workout mode gives them control.

### Scenario G — Casual user

User wants simplicity.

Expected:

Quick AI logging takes only a few seconds.

---

# 37. SUCCESS CRITERIA

The upgraded system should make these questions extremely easy to answer:

> **What did I eat today?**

> **How many calories did I consume?**

> **How much did I move?**

> **How much activity energy did I use?**

> **How many calories do I have approximately remaining?**

> **What could I eat next?**

> **What would be a sensible activity choice today?**

> **How does my cycle/recovery affect what I should do next?**

---

# 38. DO NOT OVERCOMPLICATE THE FIRST VERSION

Build the architecture so it can become comprehensive, but don't make every screen overwhelming.

Use progressive disclosure:

```text
Simple
  ↓
More details
  ↓
Custom
  ↓
Advanced
```

The system should serve both:

> "I just want to log my dinner."

and:

> "I want to enter exactly 180g cooked rice, 120g chicken and 10g oil."

---

# 39. FINAL PRODUCT ARCHITECTURE

The final system should conceptually be:

```text
                 Sini
                    │
          ┌─────────┴─────────┐
          ↓                   ↓
        FOOD               ACTIVITY
          │                   │
    ┌─────┼─────┐       ┌────┼─────┐
    ↓     ↓     ↓       ↓    ↓     ↓
   AI   Search Custom   AI  Search Custom
    │     │     │        │    │     │
    └─────┼─────┘        └────┼─────┘
          ↓                   ↓
       Nutrition           Activity
       Database             Engine
          │                   │
          └─────────┬─────────┘
                    ↓
            CALORIE ENGINE
                    ↓
        ┌───────────┼───────────┐
        ↓           ↓           ↓
     Consumed     Burned      Remaining
        │           │           │
        └───────────┼───────────┘
                    ↓
             SINI COACH
                    ↑
                    │
          Cycle + Recovery
          + Goals + Profile
```

---

# 40. FINAL IMPLEMENTATION RULE

Before implementing anything:

**Audit the existing code and reuse what already works.**

Then implement this as an enhancement.

The end result should not feel like a different application.

It should feel like:

> **The same Sini you already built, but now food, activity, and calorie balance are dramatically more powerful, accurate, flexible, and useful every day.**
