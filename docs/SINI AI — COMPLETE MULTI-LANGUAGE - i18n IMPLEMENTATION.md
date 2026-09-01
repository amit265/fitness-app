# SINI AI — COMPLETE MULTI-LANGUAGE / i18n IMPLEMENTATION

The existing Sini AI application is already built and functional.

This task is to add a **production-ready internationalization (i18n) system** throughout the existing application.

## IMPORTANT

This is NOT a redesign.

Do NOT rebuild screens.

Do NOT change the existing UX unnecessarily.

Do NOT modify the existing cycle logic, calorie calculations, activity calculations, theme system, or data model unless required for localization.

The goal is to make the existing application fully localization-ready.

---

# 1. LANGUAGES FOR INITIAL RELEASE

Implement these 7 application languages:

```text
en → English
id → Bahasa Indonesia
hi → हिन्दी
es → Español
pt-BR → Português (Brasil)
fr → Français
de → Deutsch
```

### Language priority

1. English
2. Bahasa Indonesia
3. Hindi
4. Spanish
5. Brazilian Portuguese
6. French
7. German

English is the source language.

Do NOT add additional languages until this architecture is stable.

---

# 2. DO NOT IMPLEMENT HINGLISH AS A NORMAL UI LANGUAGE

Do NOT create:

```text
hinglish.json
```

for the entire application.

Hinglish is not a standard UI localization in the same way as Hindi, German, French, etc.

Instead, keep the UI language and Sini's conversational language separate.

Future architecture should support:

```text
uiLanguage
coachLanguage
```

For example:

```text
UI → English
Sini → Hinglish
```

or:

```text
UI → Hindi
Sini → Hindi
```

For this implementation, build the architecture so `coachLanguage` can be added later, but do not build a fake Hinglish translation of the entire UI unless the existing product specifically requires it.

---

# 3. FIRST TASK — COMPLETE STRING AUDIT

Before changing the UI, inspect the entire project.

Search for all user-facing text.

Search for:

```text
Text
placeholder
label
title
subtitle
description
alert
toast
message
error
accessibilityLabel
accessibilityHint
button text
navigation titles
tab labels
```

Also search for literal strings in:

```text
.ts
.tsx
.js
.jsx
.json
```

and configuration files where user-facing text may exist.

---

# 4. EXTRACT EVERY USER-FACING STRING

Create translation keys for every static user-facing string.

Bad:

```tsx
<Text>Calories remaining</Text>
```

Good:

```tsx
<Text>{t('nutrition.caloriesRemaining')}</Text>
```

Bad:

```tsx
<Button title="Log Food" />
```

Good:

```tsx
<Button title={t('nutrition.logFood')} />
```

Bad:

```tsx
<Text>Your cycle is on day {cycleDay}</Text>
```

Good:

```tsx
<Text>
  {t('cycle.currentDay', { day: cycleDay })}
</Text>
```

Do NOT leave hidden hardcoded English strings in the application.

---

# 5. CREATE A CENTRALIZED i18n ARCHITECTURE

Use a mature i18n solution compatible with the existing Expo/React Native architecture.

Prefer the library already used by the project if one exists.

If no i18n system exists, use a lightweight, well-supported solution such as:

```text
i18next
react-i18next
```

or the most appropriate Expo-compatible alternative already present in the project.

Do NOT create a homemade translation engine.

---

# 6. TRANSLATION FILE STRUCTURE

Create a dedicated localization directory.

Recommended:

```text
src/
  i18n/
    index.ts
    config.ts
    locales/
      en/
        common.json
        onboarding.json
        home.json
        cycle.json
        nutrition.json
        activity.json
        progress.json
        coach.json
        profile.json
        settings.json
        validation.json
        notifications.json

      id/
        ...

      hi/
        ...

      es/
        ...

      pt-BR/
        ...

      fr/
        ...

      de/
        ...
```

The exact structure may be simplified if the existing architecture benefits from fewer files.

The important requirement is:

**translations must be centralized and maintainable.**

---

# 7. USE SEMANTIC TRANSLATION KEYS

Do NOT use English text as translation keys.

Bad:

```typescript
t("Calories remaining")
```

Good:

```typescript
t("nutrition.caloriesRemaining")
```

Bad:

```typescript
t("Log Food")
```

Good:

```typescript
t("nutrition.logFood")
```

This makes the code independent of the English language.

---

# 8. KEEP TRANSLATION KEYS CONSISTENT

The same key structure must exist across every language.

Example:

```json
{
  "nutrition": {
    "calories": "Calories",
    "caloriesRemaining": "Calories remaining",
    "consumed": "Consumed",
    "remaining": "Remaining",
    "logFood": "Log food"
  }
}
```

Every language must implement the same keys.

Do not silently omit keys.

---

# 9. TRANSLATION COMPLETENESS CHECK

Create a validation mechanism or development script that compares:

```text
English keys
vs
Indonesian keys
vs
Hindi keys
vs
Spanish keys
vs
Portuguese keys
vs
French keys
vs
German keys
```

The build/development validation should report missing translation keys.

Example:

```text
Missing translations:

de:
  coach.lowEnergy
  cycle.currentPhase

fr:
  progress.measurements
```

Do not allow silent missing translations in production.

---

# 10. ENGLISH IS THE SOURCE OF TRUTH

English is the canonical translation structure.

When a new string is added:

```text
English key
↓
Translation task
↓
All supported languages
```

Do not add a user-facing string to only one language.

---

# 11. DO NOT MACHINE-TRANSLATE BLINDLY

Translations should sound natural to native speakers.

Pay special attention to:

- Women's health terminology
- Menstrual-cycle terminology
- Nutrition
- Fitness
- Exercise
- BMI
- Calories
- Recovery
- Emotional language
- AI coaching
- Warnings

Do not produce awkward literal translations.

For example, Sini should sound like a natural wellness application in each language, not English translated word-for-word.

---

# 12. BRAND NAME MUST NOT BE TRANSLATED

Always preserve:

**Sini AI**

Do not translate or localize:

```text
Sini
Sini AI
```

The tagline can be translated.

---

# 13. SINI'S PERSONALITY MUST SURVIVE TRANSLATION

The translations must preserve the Sini persona:

- Warm
- Intelligent
- Encouraging
- Honest
- Non-judgmental
- Practical

Do not translate supportive English into language that sounds:

- Clinical
- Robotic
- Patronizing
- Overly formal

The tone is part of the product.

---

# 14. CYCLE TERMINOLOGY

Create standardized translations for:

```text
Menstrual
Follicular
Ovulatory
Luteal
Period
Cycle day
Cycle length
Flow
Spotting
Cramps
Bloating
Breast tenderness
Cravings
Energy
Mood
Symptoms
```

Use medically appropriate/common terminology for each language.

Do not invent unusual translations.

---

# 15. MOOD AND SYMPTOMS

Every predefined mood and symptom must be translated.

Example:

```text
mood.joyful
mood.calm
mood.anxious
mood.tired
mood.irritable
mood.bloated
```

Symptoms:

```text
symptom.cramps
symptom.bloating
symptom.tenderBreasts
symptom.cravings
...
```

Do not store translated strings inside the database.

Store stable identifiers:

```typescript
"cramps"
"bloating"
"tenderBreasts"
```

and translate them at render time.

---

# 16. CYCLE PHASES MUST REMAIN DATA IDENTIFIERS

Never store:

```text
"Menstrual"
```

as the underlying cycle-phase value.

Keep:

```typescript
"menstrual"
"follicular"
"ovulatory"
"luteal"
```

Then render:

```typescript
t(`cycle.phase.${phase}`)
```

This is essential because the same data must work across all languages.

---

# 17. CALORIE / NUTRITION DATA

Numbers remain numbers.

Do not translate or store:

```text
"430 kcal"
```

as a database string.

Store:

```typescript
caloriesRemaining: 430
```

Then format it according to locale.

Example:

```text
430 kcal remaining
```

The translated string and formatted number should be generated at display time.

---

# 18. NUMBER FORMATTING

Use locale-aware formatting.

Examples:

```text
1,420 kcal
```

may format differently depending on locale.

Use:

```typescript
Intl.NumberFormat
```

or the appropriate i18n/formatting utility.

Do not manually insert commas.

---

# 19. DATE FORMATTING

Dates must be locale-aware.

Do not hardcode:

```text
MM/DD/YYYY
```

Use locale-aware date formatting.

For example, the same date may display differently in:

- English
- Indonesian
- German
- French
- Hindi

The underlying stored date should remain standardized.

Recommended internal storage:

```text
YYYY-MM-DD
```

or ISO timestamps where appropriate.

---

# 20. TIME FORMATTING

Respect locale conventions.

Some locales commonly use:

```text
12-hour
```

others commonly use:

```text
24-hour
```

Use locale-aware formatting while allowing the user's explicit preference if the existing app supports one.

---

# 21. UNITS

Do not assume all users use the same display conventions.

Keep internal values standardized.

For example:

```text
heightCm
weightKg
waterLitres
```

Then format for display.

If the app later supports imperial units:

```text
cm → ft/in
kg → lb
litres → oz
```

without changing stored canonical values.

For this release, do not introduce an unnecessary unit-system redesign unless already supported.

---

# 22. BMI

BMI calculation must remain language-independent.

Underlying calculation:

```text
BMI = weightKg / (heightM * heightM)
```

Translate:

- BMI
- Underweight
- Healthy range
- Overweight
- Obesity
- Explanation text

The numerical result must remain identical regardless of language.

---

# 23. PLURALIZATION

Do not hardcode English plurals.

Bad:

```typescript
`${days} days`
```

Good:

```typescript
t('cycle.days', { count: days })
```

Support proper plural rules for every language.

This is especially important for:

- Days
- Calories
- Meals
- Workouts
- Steps
- Measurements
- Weeks
- Months

Use the i18n library's pluralization system.

---

# 24. GENDERED / GRAMMATICAL LANGUAGES

Be careful with languages such as:

- Hindi
- German
- French
- Spanish

Do not assume English sentence structure can simply be translated word-for-word.

Use complete natural phrases where grammatical context matters.

Avoid constructing sentences by concatenating translated fragments.

Bad:

```typescript
t('youHave') + ' ' + count + ' ' + t('calories')
```

Prefer:

```typescript
t('nutrition.caloriesRemainingMessage', { count })
```

where the entire sentence can be translated naturally.

---

# 25. TEXT EXPANSION

Some translations will be significantly longer than English.

Audit:

- Buttons
- Cards
- Headers
- Tabs
- Bottom sheets
- Calendar labels
- Onboarding
- Settings

Do not rely on fixed widths.

Use flexible layouts.

Avoid truncating important information.

---

# 26. RIGHT-TO-LEFT PREPARATION

The current release does not require Arabic/Hebrew.

However, structure layouts so future RTL support is possible.

Prefer logical spacing/alignment APIs where available.

Do not hardcode assumptions such as:

```text
left = always left
right = always right
```

Do not implement full RTL unless a supported RTL language is added.

---

# 27. LANGUAGE SELECTION UI

Add language selection to the existing Settings screen.

Recommended:

```text
Language

English
Bahasa Indonesia
हिन्दी
Español
Português (Brasil)
Français
Deutsch
```

Show the native language name where appropriate.

For example:

```text
English
Bahasa Indonesia
हिन्दी
Español
Português (Brasil)
Français
Deutsch
```

Do not display:

```text
Indonesian
Hindi
Spanish
Portuguese
French
German
```

only.

Native labels make the selector easier to understand.

---

# 28. LANGUAGE PERSISTENCE

Store:

```typescript
language
```

in the existing persistent user/settings store.

Use the existing Zustand persistence architecture if already present.

Do not introduce another persistence system.

After restarting the application:

```text
Saved language
↓
i18n initialization
↓
Application renders in saved language
```

---

# 29. INITIAL LANGUAGE DETECTION

On first launch:

1. Check whether the user already selected a language.
2. If not, inspect the device locale.
3. If supported, use the matching language.
4. Otherwise use English.

Example:

```text
en-IN → English
id-ID → Bahasa Indonesia
hi-IN → Hindi
es-* → Spanish
pt-BR → Portuguese (Brasil)
fr-* → French
de-* → German
```

Do not assume that every regional locale should automatically map to a language without considering the supported locale list.

---

# 30. LANGUAGE CHANGE MUST BE IMMEDIATE

When the user changes language:

```text
Settings
↓
Select language
↓
i18n changes
↓
Entire application updates
```

No app restart should be required unless the chosen i18n/native architecture technically requires it.

Do not reload the entire app unnecessarily.

---

# 31. NAVIGATION MUST LOCALIZE

Translate:

- Tab labels
- Screen titles
- Navigation headers
- Back labels where applicable
- Menu labels

Do not leave navigation in English.

---

# 32. FORMS MUST LOCALIZE

Translate:

- Labels
- Placeholders
- Helper text
- Validation
- Error messages
- Required-field messages
- Buttons

---

# 33. CALENDAR MUST LOCALIZE

The Cycle Calendar should localize:

- Month names
- Weekday names
- Phase names
- Flow labels
- Symptoms
- Buttons
- Calendar controls
- Tooltips
- Date formatting

But preserve the four phase colors and the existing cycle-theme behavior.

Localization must NOT break the dynamic theme system.

---

# 34. CHARTS MUST LOCALIZE

Charts should localize:

- Labels
- Legends
- Tooltips
- Date labels
- Metric names

But chart data remains language-independent.

Do not translate the underlying metric identifiers.

---

# 35. AI COACH LANGUAGE

The AI coach must eventually support generation in the user's selected language.

Create an abstraction such as:

```typescript
coachLanguage
```

or:

```typescript
getCoachLanguage()
```

Do not hardcode:

```text
"Respond in English"
```

inside random AI service calls.

Centralize the AI language instruction.

For example:

```text
Selected UI language:
Hindi

Coach language:
Hindi
```

or later:

```text
Selected UI language:
English

Coach language:
Hinglish
```

The AI service should receive the desired language explicitly.

---

# 36. AI LANGUAGE SAFETY

AI-generated coaching must preserve Sini's voice regardless of language.

For every language:

- Warm
- Honest
- Non-shaming
- Practical
- Evidence-aware
- Clear

Do not allow translated AI prompts to accidentally make the coach more judgmental.

---

# 37. AI ESTIMATIONS

Food and activity estimates remain numerical data.

For example:

```typescript
{
  calories: 540,
  proteinGrams: 36
}
```

The UI translates:

```text
Calories
Protein
Estimated
```

Do not store:

```text
"540 calories"
```

as the data model.

---

# 38. NOTIFICATIONS

Audit every notification string.

Examples:

- Meal reminders
- Water reminders
- Workout reminders
- Cycle reminders
- Progress notifications
- AI suggestions

Notifications must use the selected language.

If notification scheduling is currently implemented with static English strings, migrate those strings to the i18n system.

---

# 39. ERROR MESSAGES

Every user-visible error must be localized.

Search especially for:

```text
catch(...)
throw new Error(...)
Alert.alert(...)
Toast(...)
```

Do not expose raw technical errors to users.

---

# 40. ACCESSIBILITY

Localize:

- accessibilityLabel
- accessibilityHint
- screen-reader descriptions
- chart descriptions
- button descriptions

Accessibility text is user-facing text and must not remain hardcoded in English.

---

# 41. URLs AND CONFIGURATION

The current application is using constants directly in code and some links/configuration are scattered.

Clean this up as part of this task.

Create or extend:

```text
src/constants/appConfig.ts
```

and/or a dedicated configuration file such as:

```text
src/constants/links.ts
```

depending on the existing architecture.

Centralize:

- Privacy Policy URL
- Terms of Service URL
- Support URL
- Website URL
- Contact email
- App store links
- Social links
- Help center URL
- Other external URLs

Example:

```typescript
export const APP_LINKS = {
  privacyPolicy: '...',
  termsOfService: '...',
  support: '...',
  website: '...',
};
```

Do NOT scatter raw URLs throughout screens.

If a URL is truly environment-specific, use the existing environment/configuration mechanism rather than hardcoding it into UI components.

Do not change existing URLs unless necessary.

---

# 42. DO NOT TRANSLATE URLs

URLs should remain actual URLs.

Do not create separate translated URLs unless the backend/site actually provides localized destinations.

Translate the label:

```text
Privacy Policy
```

but keep the URL centralized.

---

# 43. USER-GENERATED CONTENT

Do NOT attempt to translate the user's own data automatically.

Examples:

User meal:

> Chicken rice bowl with two eggs

Store the original user input.

User notes:

> Feeling tired today

Store the original user input.

User-entered names:

Do not translate.

AI-generated interpretations can be localized separately.

---

# 44. DATABASE COMPATIBILITY

Never store translated UI strings as persistent identifiers.

Bad:

```text
mood = "Tired"
```

Good:

```text
mood = "tired"
```

Bad:

```text
phase = "Menstrual"
```

Good:

```text
phase = "menstrual"
```

Bad:

```text
activityType = "Swimming"
```

Good:

```text
activityType = "swimming"
```

This guarantees that changing language does not corrupt existing user data.

---

# 45. TRANSLATION KEY NAMING

Use predictable namespaces.

Example:

```text
common.*
onboarding.*
home.*
cycle.*
nutrition.*
activity.*
progress.*
coach.*
profile.*
settings.*
validation.*
notifications.*
errors.*
```

Example:

```text
cycle.phase.menstrual
cycle.phase.follicular
cycle.phase.ovulatory
cycle.phase.luteal

nutrition.calories
nutrition.caloriesRemaining
nutrition.protein
nutrition.logFood

activity.steps
activity.workout
activity.duration

settings.language
settings.theme
```

---

# 46. DO NOT DUPLICATE BUSINESS LOGIC PER LANGUAGE

Business logic must remain language-independent.

Do not create:

```text
calculateCaloriesHindi()
calculateCaloriesGerman()
```

or:

```text
cycleEngineSpanish()
```

There should be:

```text
one cycle engine
one calorie engine
one activity engine
one BMI calculation
```

and localized presentation.

---

# 47. LANGUAGE + THEME MUST WORK TOGETHER

The application has two independent user preferences:

```text
language
themePreference
```

They must not interfere with each other.

Example:

```text
Hindi + Automatic
```

should work.

```text
German + Dark Mode
```

should work.

```text
French + Classic
```

should work.

Changing language must not reset the theme.

Changing theme must not reset the language.

---

# 48. LANGUAGE + CYCLE THEME MUST WORK TOGETHER

Test combinations such as:

```text
Hindi + Rose Dawn
Hindi + Sage Bloom
Hindi + Golden Glow
Hindi + Plum Dusk
```

and:

```text
German + Dark Mode
French + Classic
Indonesian + Automatic
Spanish + Automatic
Portuguese + Automatic
```

The theme and language must operate independently.

---

# 49. TEST ALL SUPPORTED LANGUAGES

At minimum test:

```text
English
Bahasa Indonesia
Hindi
Spanish
Brazilian Portuguese
French
German
```

For each language test:

- Onboarding
- Home
- Cycle Calendar
- Food logging
- Activity
- Progress
- Coach
- Profile
- Settings
- BMI
- Modals
- Forms
- Empty states
- Error states
- Navigation

---

# 50. TEST TEXT EXPANSION

Pay special attention to:

- Buttons becoming too wide
- Tabs overflowing
- Headings wrapping badly
- Calendar labels
- Long German words
- French/Spanish expansion
- Hindi text rendering
- Portuguese accents
- Indonesian text expansion

Never solve translation overflow by arbitrarily shrinking all fonts.

Fix the layout.

---

# 51. DEVELOPMENT FALLBACK

During development, if a translation is missing:

```text
missing key
↓
show English fallback
```

but log the missing key clearly in development.

Do not silently show:

```text
nutrition.caloriesRemaining
```

to users.

Production should ideally have zero missing translation keys.

---

# 52. TRANSLATION QA

Create a translation QA checklist.

For every language verify:

### Meaning

Does it accurately communicate the English meaning?

### Tone

Does it sound like Sini?

### Fitness terminology

Is the terminology natural?

### Cycle terminology

Is the terminology appropriate?

### Nutrition

Are calories/macros correctly described?

### Grammar

Is the sentence natural?

### UI length

Does it fit?

---

# 53. SOURCE OF TRUTH

The application should have:

```text
English
   ↓
Translation keys
   ↓
All supported locale files
```

The code should only reference translation keys.

Never reference language-specific strings directly from components.

---

# 54. IMPLEMENTATION ORDER

## Stage 1 — Audit

Audit every user-facing string and every raw URL/configuration value.

Do not immediately modify all screens.

Produce an internal inventory.

---

## Stage 2 — i18n foundation

Create:

- i18n provider
- Locale configuration
- Translation loader
- Translation files
- Language preference state
- Persistence

---

## Stage 3 — Extract strings

Migrate shared components first:

- Buttons
- Inputs
- Cards
- Navigation
- Modals
- Common labels
- Errors

---

## Stage 4 — Migrate screens

Migrate:

1. Onboarding
2. Home
3. Cycle Calendar
4. Nutrition
5. Activity
6. Progress
7. Coach
8. Profile
9. Settings

---

## Stage 5 — Data formatting

Add locale-aware:

- Dates
- Times
- Numbers
- Plurals

---

## Stage 6 — AI language

Centralize the coach-language instruction.

Ensure Sini can respond in the selected language.

Prepare architecture for future Hinglish coach mode.

---

## Stage 7 — URL/config cleanup

Move all raw external URLs into centralized constants/configuration.

---

## Stage 8 — QA

Run every supported language through every major screen.

---

# 55. ACCEPTANCE CRITERIA

The implementation is complete only when:

- [ ] 7 languages are available
- [ ] Language selection exists in Settings
- [ ] Language preference persists
- [ ] Device locale is detected on first launch
- [ ] All user-facing static strings are translated
- [ ] Navigation is translated
- [ ] Calendar is translated
- [ ] Symptoms/moods are translated
- [ ] Forms are translated
- [ ] Errors are translated
- [ ] Notifications are translated
- [ ] Accessibility labels are translated
- [ ] Charts are translated
- [ ] Dates are locale-aware
- [ ] Numbers are locale-aware
- [ ] Plurals work correctly
- [ ] BMI presentation is translated
- [ ] Underlying data identifiers remain language-independent
- [ ] AI coach language is centralized
- [ ] Existing theme system still works
- [ ] Language and theme operate independently
- [ ] All raw external URLs are centralized
- [ ] No major hardcoded English UI strings remain
- [ ] No missing translation keys remain
- [ ] TypeScript passes
- [ ] Existing functionality remains intact

---

# 56. FINAL ARCHITECTURE

The desired architecture is:

```text
                         SINI AI
                            │
             ┌──────────────┴──────────────┐
             │                             │
          LANGUAGE                       THEME
             │                             │
       ┌─────┴─────┐              ┌───────┴────────┐
       ↓           ↓              ↓                ↓
   UI Language  Coach Language  Automatic       Manual
       │                         ↓              ↓      ↓
       ↓                     Cycle Phase     Classic  Dark
       ↓                         ↓
  Translation                 Cycle Theme
     Engine                       │
       │                          │
       └──────────────┬───────────┘
                      ↓
                 PRESENTATION
                      ↓
              Existing Sini UI
```

Language controls **what the application says**.

Theme controls **how the application looks**.

Cycle engine controls **the user's cycle data**.

Business logic remains independent of all three.

---

# FINAL RULE

Do not treat localization as simply translating English strings.

Build Sini AI so that:

> **The application is language-independent at the data and business-logic level, while the presentation layer adapts naturally to the user's language and locale.**

The same user data must work identically in every language.

The same cycle calculations must work identically in every language.

The same calorie calculations must work identically in every language.

Only the presentation changes.

The result should feel like Sini AI was **designed for each language**, not mechanically translated into it.