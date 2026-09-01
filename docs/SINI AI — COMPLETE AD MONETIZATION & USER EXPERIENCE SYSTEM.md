# SINI AI — COMPLETE AD MONETIZATION & USER EXPERIENCE SYSTEM

The existing Sini AI application is already built, functional, and has an established design system.

This task is to implement a **professional, user-friendly advertising system** without redesigning the existing app.

## CORE MONETIZATION MODEL

Sini AI has three levels of experience:

### Free

Users can use the complete core app with tasteful advertising.

### Rewarded

Users can voluntarily watch a rewarded ad to receive:

> **15 minutes without pop-up ads**

### Premium

Users can purchase Premium to permanently remove all advertising.

The current Premium price is **$2.99**, but this price must NOT be hardcoded into the application. Read the current localized price from the existing in-app purchase/product configuration so the price can be changed later without modifying the ad system.

---

# 1. AD FORMATS

Implement support for:

1. **Native Ads — PRIMARY**
2. **Rewarded Ads — PRIMARY**
3. **Interstitial Ads — LIMITED**
4. **App Open Ads — LIMITED**
5. **Banner Ads — OPTIONAL / VERY LIMITED**

### IMPORTANT CHANGE FROM A TYPICAL AD-SUPPORTED APP

**Do NOT use banners throughout the main tab screens.**

Do not put banners:

- At the bottom of every tab
- Between major cards
- In the middle of primary workflows
- Directly underneath important calorie information
- As a persistent element on every screen

Sini AI should feel like a premium wellness product, not a banner-heavy utility app.

**Native ads should be the primary everyday advertising format.**

---

# 2. AD EXPERIENCE PHILOSOPHY

The user should feel:

> "Sini is free and occasionally shows me a sponsored piece of content."

Not:

> "Every time I tap something, Sini shows me an ad."

Ads must monetize **around the user's workflow**, never interfere with important health, nutrition, fitness, or cycle-tracking actions.

Prioritize:

```text
User value
    ↓
Retention
    ↓
Natural ad impressions
    ↓
Rewarded engagement
    ↓
Premium conversion
    ↓
Revenue optimization
```

Do NOT optimize solely for maximum ad impressions.

---

# 3. CENTRALIZED AD ARCHITECTURE

Do not scatter ad SDK calls throughout the application.

Create a centralized advertising layer.

Recommended structure:

```text
src/
  services/
    ads/
      adService.ts
      adConfig.ts
      adPolicy.ts
      adEligibility.ts
      adFrequency.ts
      rewardedAdService.ts
      interstitialAdService.ts
      appOpenAdService.ts
```

Adapt this structure to the existing project if necessary.

The architecture should be:

```text
Screens
   ↓
Ad Policy
   ↓
Ad Eligibility
   ↓
Ad Service
   ↓
Ad SDK
```

Screens should never need to understand AdMob implementation details.

---

# 4. CENTRALIZED AD CONFIGURATION

Create a centralized configuration.

Example:

```typescript
export const AD_CONFIG = {
  native: {
    enabled: true,
  },

  banner: {
    enabled: false,
  },

  interstitial: {
    enabled: true,
  },

  rewarded: {
    enabled: true,
    silenceDurationMinutes: 15,
  },

  appOpen: {
    enabled: true,
  },

  frequency: {
    interstitialCooldownMinutes: 10,
    appOpenCooldownMinutes: 30,
  },
};
```

These are starting values only.

Keep all ad policies configurable.

Do not hardcode frequency rules inside individual screens.

---

# 5. CENTRALIZED AD UNIT IDs

Do not scatter ad unit IDs throughout the application.

Create or extend:

```text
src/constants/ads.ts
```

Example:

```typescript
export const AD_UNIT_IDS = {
  native: '...',
  banner: '...',
  interstitial: '...',
  rewarded: '...',
  appOpen: '...',
};
```

Support separate:

```text
Development/Test IDs
Production IDs
```

using the existing environment/configuration system.

## IMPORTANT

Use only official test ad IDs during development.

Never test by repeatedly interacting with production ads.

---

# 6. PREMIUM MUST OVERRIDE EVERYTHING

Premium users must receive:

```text
NO banner
NO native ad
NO interstitial
NO app-open ad
NO rewarded-ad prompt
```

Create one centralized eligibility check:

```typescript
canShowAds()
```

Conceptually:

```text
Premium?
   ↓ YES
NO ADS

NO
 ↓
Rewarded silence active?
 ↓ YES
NO POP-UP ADS

NO
 ↓
Normal ad policy
```

Do not duplicate Premium checks across every screen.

---

# 7. NATIVE ADS — PRIMARY AD FORMAT

Native ads should be the primary everyday advertising format.

They should visually fit naturally into Sini's content/card system while remaining clearly identifiable as advertising.

Use native ads as **content cards**, not intrusive banners.

Always clearly label them:

> Sponsored

or the platform-required equivalent.

Do not make the ad indistinguishable from Sini's own content.

---

# 8. NATIVE AD DESIGN

The native ad container should respect the existing Sini theme.

For example:

```text
Sini Card
────────────────────
Sponsored
[Ad creative]

Headline
Description

[CTA]
────────────────────
```

Use the existing:

- Card radius
- Spacing
- Typography
- Theme surface
- Border treatment

However, do NOT manipulate or recolor the actual network ad assets in violation of ad-network requirements.

The surrounding container can be theme-aware.

---

# 9. NATIVE AD LOCATIONS

Use native ads primarily in **content-heavy, scrollable screens**.

### Best location: Progress

Example:

```text
Weight trend
      ↓
Body measurements
      ↓
Progress insight
      ↓
────────────────
Sponsored
Native Ad
────────────────
      ↓
Additional insights
```

This is a strong location because the user is browsing information rather than performing an active task.

---

# 10. HOME SCREEN NATIVE AD

The Home screen is Sini's most important screen.

Do NOT place the ad above the primary daily experience.

The Home hierarchy should remain:

```text
Cycle
   ↓
Calories
   ↓
Food / Nutrition
   ↓
Activity
   ↓
Sini's recommendation
```

Only after the primary value has been delivered may a native ad appear.

Example:

```text
Today's Sini
────────────────
Cycle status

Calories remaining

Food summary

Activity summary

Sini's recommendation
────────────────

Sponsored
Native Ad
────────────────

Additional daily content
```

Do NOT place the native ad between:

```text
Calories remaining
```

and:

```text
Sini's recommendation
```

if that disrupts the primary experience.

---

# 11. EDUCATIONAL / CONTENT AREAS

If Sini contains educational or wellness content, native ads can be inserted between legitimate content sections.

Example:

```text
Cycle Insight

Nutrition Tip

Sponsored
Native Ad

Recovery Tip
```

This is an ideal native-ad environment.

The ad must remain clearly identified as sponsored.

---

# 12. CYCLE CALENDAR

The Cycle Calendar should remain a **clean, focused experience**.

Do NOT place native ads inside:

- Calendar grid
- Phase legend
- Period logging
- Symptom selection
- Calendar navigation

If an ad is ever used on this screen, place it only below the primary calendar content and only if it does not interfere with the experience.

For the initial release:

> Prefer NO ad inside the Cycle Calendar.

---

# 13. FOOD LOGGING

Food logging is a core Sini workflow.

While the user is actively logging food:

```text
NO banner
NO native ad
NO interstitial
NO app-open interruption
```

The user should be able to:

```text
Enter meal
↓
Analyze meal
↓
See calories
↓
See macros
↓
Save meal
```

without interruption.

If monetization is needed, it can happen later at a natural transition, subject to the global cooldown.

---

# 14. ACTIVITY LOGGING

Same principle.

During active workout/activity logging:

```text
NO banner
NO native ad
NO interstitial
```

Do not interrupt the user while they are exercising or recording an activity.

---

# 15. AI COACH

The AI Coach should feel like a premium personal interaction.

Do NOT put ads:

- Inside the conversation
- Between user and assistant messages
- Between a question and answer
- While the user is typing
- Immediately after sending a message

Prefer:

```text
NO ADS INSIDE ACTIVE COACH CHAT
```

If the Coach screen contains separate educational content outside the conversation, native ads may be considered there.

---

# 16. BMI CALCULATOR

The BMI calculator should remain clean and trustworthy.

Do not interrupt the calculation with an interstitial.

Avoid placing an ad between:

```text
Height
Weight
Calculate
```

and:

```text
BMI Result
```

If monetization is appropriate, a native ad may appear below the completed result/content, but this is optional.

---

# 17. PROFILE / SETTINGS

Profile and Settings are appropriate places for:

- Premium CTA
- Rewarded ad option
- Possibly a native ad

Avoid persistent banners.

The Premium section should be more prominent than the advertising.

---

# 18. BANNER ADS — DISABLED BY DEFAULT

Do NOT put banners inside the main bottom-tab screens.

Do NOT automatically add a banner to:

- Home
- Cycle Calendar
- Food
- Activity
- Progress
- Coach

Do not create a generic:

```text
<BannerAd />
```

that gets inserted into every tab.

For the initial implementation:

```typescript
banner.enabled = false
```

unless there is a specific secondary screen where a banner genuinely improves monetization without harming UX.

The architecture should still support banners in the future.

---

# 19. REWARDED ADS — 15-MINUTE POP-UP SILENCE

This is one of Sini's key monetization features.

The user can voluntarily choose:

> **Watch a short ad and silence pop-up ads for 15 minutes.**

After successful reward completion:

```typescript
rewardedAdSilenceUntil =
  currentTime + 15 minutes
```

Persist the timestamp using the existing persistence architecture.

Do NOT store a simple boolean such as:

```text
adFree = true
```

because the reward expires.

---

# 20. REWARDED AD IS USER-INITIATED

Never automatically start a rewarded ad.

Use:

```text
Want fewer interruptions?

Watch a short ad
to silence pop-up ads
for 15 minutes.

[Watch & Silence Ads]

[Not now]
```

The user must explicitly choose it.

---

# 21. WHERE TO OFFER REWARDED

Good locations:

### Settings

```text
Need a break from pop-ups?

[Watch & Silence for 15 min]
```

### Before an eligible interstitial

Occasionally:

```text
You can watch a short ad
to silence pop-ups for 15 minutes.

[Watch & Silence]
[Continue]
```

Do NOT show this prompt before every interstitial.

### After an interstitial

Optionally offer it occasionally.

Do not repeatedly nag the user.

---

# 22. REWARDED AD SUCCESS / FAILURE

Reward only after the ad is genuinely completed and the SDK confirms the reward.

If:

- Ad fails
- User closes early
- Reward is not granted
- Network fails

do NOT grant the 15 minutes.

Continue the application normally.

Do not punish the user.

---

# 23. INTERSTITIAL ADS — LIMITED

Interstitials should be used sparingly.

They must only appear at **natural transition points**.

Never interrupt active interaction.

Good examples:

```text
Workout completed
↓
Summary
↓
Possible interstitial
```

or:

```text
Major workflow completed
↓
User returns to Home
↓
Interstitial may be eligible
```

Only if the global frequency policy permits it.

---

# 24. NEVER SHOW INTERSTITIALS DURING

Do NOT show interstitials:

- During onboarding
- During food entry
- During activity entry
- During period logging
- During symptom logging
- During AI chat
- During BMI calculation
- While viewing the Cycle Calendar
- While reading an important health explanation
- Immediately after opening the app
- Immediately after another fullscreen ad

---

# 25. INTERSTITIAL FREQUENCY

Start conservatively:

```text
Minimum interstitial cooldown:
10–15 minutes
```

Also consider an action/session threshold so a user cannot trigger an interstitial simply by rapidly navigating screens.

Use a centralized function:

```typescript
shouldShowInterstitial(context)
```

It should consider:

```text
Premium status
Rewarded silence
Current screen
Last interstitial
Last app-open
Session state
User interaction state
```

---

# 26. APP OPEN ADS — LIMITED

App Open ads should only be shown when appropriate.

Do NOT show an App Open ad on first launch.

Do NOT show one every time the user briefly leaves and returns.

Recommended starting cooldown:

```text
30 minutes
```

Example:

```text
Open Sini
↓
App Open may show

Leave for 2 minutes
↓
Return
↓
NO App Open

Leave for 45 minutes
↓
Return
↓
App Open eligible
```

Make this configurable.

---

# 27. APP OPEN MUST NOT BLOCK STARTUP

If an App Open ad is not ready:

```text
Continue into Sini immediately.
```

Never make the user wait for an advertisement.

Do not delay core application startup simply to load an ad.

---

# 28. APP OPEN + FIRST LAUNCH

Recommended:

```text
First-ever launch
→ No App Open

Early sessions
→ No App Open

After meaningful usage
→ App Open becomes eligible
```

This gives the user time to understand Sini before monetization becomes more visible.

---

# 29. FULLSCREEN AD COOLDOWN

Interstitial and App Open ads share a global fullscreen-ad protection system.

Track:

```typescript
lastInterstitialShownAt
lastAppOpenShownAt
lastFullscreenAdAt
rewardedAdSilenceUntil
```

Avoid:

```text
App Open
↓
2 minutes later
Interstitial
```

or:

```text
Interstitial
↓
immediate App Open
```

A user should never feel bombarded.

---

# 30. REWARDED SILENCE OVERRIDES POP-UP ADS

While:

```text
currentTime < rewardedAdSilenceUntil
```

suppress:

- Interstitial
- App Open

The reward is specifically:

> **No pop-up ads for 15 minutes**

Do not claim that banners/native ads disappear unless the implementation actually suppresses them.

---

# 31. PREMIUM OVERRIDES ALL ADS

Premium users must never receive:

```text
Banner
Native
Interstitial
App Open
Rewarded prompt
```

Premium should provide a completely clean experience.

---

# 32. PREMIUM SCREEN

Do not make Premium feel like punishment for free users.

Position it as:

> **Make Sini yours.**

Possible benefits:

- No ads
- Uninterrupted coaching
- Cleaner experience
- Support continued Sini development

Read the actual localized product price from the existing purchase system.

Never hardcode `$2.99`.

---

# 33. AD POLICY PER SCREEN

Create a centralized screen-level policy.

Example:

```typescript
const screenAdPolicy = {
  home: {
    native: true,
    banner: false,
    interstitial: false,
  },

  cycle: {
    native: false,
    banner: false,
    interstitial: false,
  },

  foodLogging: {
    native: false,
    banner: false,
    interstitial: false,
  },

  activityLogging: {
    native: false,
    banner: false,
    interstitial: false,
  },

  progress: {
    native: true,
    banner: false,
    interstitial: false,
  },

  coach: {
    native: false,
    banner: false,
    interstitial: false,
  },

  settings: {
    native: true,
    banner: false,
    interstitial: false,
  },
};
```

Adapt this to the actual existing screens.

The important principle:

> **Ads must be intentionally allowed on a screen, never automatically inserted everywhere.**

---

# 34. RECOMMENDED SINI SCREEN STRATEGY

## HOME

Primary purpose:

Calories + activity + cycle + coaching.

```text
Native: YES, carefully placed
Banner: NO
Interstitial: NOT on entry
App Open: subject to global policy
Rewarded: optional
```

---

## CYCLE CALENDAR

Primary purpose:

Cycle tracking.

```text
Native: NO initially
Banner: NO
Interstitial: NO
App Open: subject to global policy
Rewarded: optional
```

Keep this screen clean.

---

## FOOD LOGGING

```text
Native: NO during active logging
Banner: NO
Interstitial: NO
App Open: NO interruption
Rewarded: only from a separate user action
```

---

## ACTIVITY

```text
Native: NO during active logging
Banner: NO
Interstitial: NO during activity
App Open: NO interruption
```

---

## PROGRESS

```text
Native: YES
Banner: NO
Interstitial: LIMITED
Rewarded: optional
```

This should be one of the strongest native-ad locations.

---

## COACH

```text
Native: NO inside conversation
Banner: NO
Interstitial: NO during conversation
Rewarded: optional from separate UI
```

---

## PROFILE / SETTINGS

```text
Native: OPTIONAL
Banner: NO
Interstitial: NO
Rewarded: YES
Premium CTA: YES
```

---

# 35. AD CONTAINERS MUST FOLLOW SINI'S THEME

The existing Sini dynamic theme system must remain untouched.

Ad containers/loading placeholders should use the active theme:

```text
Rose Dawn
Sage Bloom
Golden Glow
Plum Dusk
Sini Classic
Dark Mode
```

Do not allow an ad placeholder to suddenly display a random white rectangle in Dark Mode.

However:

**Do not modify third-party ad creative itself.**

Only style the surrounding Sini-owned container.

---

# 36. MULTI-LANGUAGE SUPPORT

All Sini-created ad UI must use the existing i18n system.

Translate:

```text
Sponsored
Ad
Watch & Silence Ads
15 minutes
Not now
Ads are temporarily silenced
Premium removes all ads
```

Do not hardcode English.

The ad network's own creative is controlled by the advertising platform.

---

# 37. AD LOADING

Preload ads when practical.

Example:

```text
App running
↓
Load native/interstitial/rewarded in background
↓
Keep ready
↓
User reaches eligible location
↓
Check policy
↓
Show if appropriate
```

If an ad isn't ready:

```text
Continue normally.
```

Never block the user waiting for an ad.

---

# 38. ERROR HANDLING

Handle:

- Network unavailable
- Ad failed to load
- Ad failed to show
- Reward failed
- Ad expired
- SDK initialization failure

All failures should fail silently from the user's perspective.

Ads are optional.

The core application must continue working.

---

# 39. ANALYTICS

Track useful monetization events:

```text
ad_loaded
ad_failed
ad_impression
ad_dismissed

rewarded_started
rewarded_completed
rewarded_failed

ad_silence_started
ad_silence_expired

premium_screen_viewed
premium_purchase
```

Useful dimensions:

```text
ad_format
screen
session
```

Do NOT send sensitive health information to advertising systems merely for optimization.

Do not use:

- Menstrual phase
- Symptoms
- Mood
- Food logs
- Body measurements
- Weight
- Health information

as advertising targeting data.

Keep health data and advertising analytics separate.

---

# 40. ADS MUST NEVER INFLUENCE COACHING

Sini's health/fitness recommendations must never be dependent on ad engagement.

Never say:

> Watch an ad to unlock your workout.

Never make health guidance contingent on viewing ads.

Do not use fear, guilt, body shame, or health anxiety to increase ad engagement.

---

# 41. DEVELOPMENT MODE

Use test ad IDs during development.

Create a clean environment configuration:

```text
development
→ test ads

production
→ production ads
```

Never accidentally ship development/test configuration to production.

---

# 42. DEVELOPMENT LOGGING

In development only, provide useful logs:

```text
[ADS] Premium → all ads disabled
[ADS] Rewarded silence active → fullscreen ads blocked
[ADS] Interstitial blocked → cooldown
[ADS] Interstitial blocked → screen policy
[ADS] App Open blocked → first launch
[ADS] Native ad loaded
[ADS] Reward granted → silence until ...
```

Disable verbose ad debugging in production.

---

# 43. TESTING MATRIX

Test every format against:

### User status

```text
Free
Free + rewarded silence
Premium
```

### Theme

```text
Rose Dawn
Sage Bloom
Golden Glow
Plum Dusk
Classic
Dark
```

### Language

At minimum test:

```text
English
Hindi
Bahasa Indonesia
```

Then verify the remaining supported languages.

---

# 44. CRITICAL TEST SCENARIOS

### Scenario 1

Free user opens app.

Expected:

```text
No unnecessary immediate interstitial.
```

### Scenario 2

Premium user opens app.

Expected:

```text
Zero ads.
```

### Scenario 3

Free user watches rewarded ad.

Expected:

```text
15-minute fullscreen/pop-up silence begins.
```

### Scenario 4

User tries to trigger interstitial during the 15 minutes.

Expected:

```text
Interstitial suppressed.
```

### Scenario 5

User leaves app for 2 minutes and returns.

Expected:

```text
No App Open if within cooldown.
```

### Scenario 6

User leaves for 45 minutes.

Expected:

```text
App Open may become eligible.
```

### Scenario 7

User is actively logging food.

Expected:

```text
No interruption.
```

### Scenario 8

User is chatting with Sini.

Expected:

```text
No ad between messages.
```

### Scenario 9

User is browsing Progress.

Expected:

```text
Native ad can appear naturally between content sections.
```

### Scenario 10

User changes theme.

Expected:

```text
Ad container/loading UI follows theme.
```

---

# 45. NO AD STACKING

Avoid:

```text
App Open
↓
Native
↓
Interstitial
↓
Rewarded prompt
```

within a short period.

The ad system should actively prevent excessive ad density.

A user should never experience multiple monetization mechanisms simultaneously.

---

# 46. AD DENSITY TARGET

As a starting point:

> **Prefer fewer, higher-quality impressions over constant low-value impressions.**

Native ads should be occasional.

Interstitials should be rare.

App Open should be rare.

Rewarded is user-controlled.

Banners should remain disabled unless a specific placement proves useful.

---

# 47. FUTURE OPTIMIZATION

Do not over-engineer A/B testing now.

However, make these values configurable so they can be tuned later:

```text
Interstitial cooldown
App Open cooldown
Native ad frequency
Reward duration
First App Open eligibility
Screen-specific ad policies
```

Later we can optimize based on:

- Retention
- Session length
- Ad impressions
- eCPM
- ARPDAU
- Reward completion rate
- Premium conversion
- Churn
- User feedback

Do not optimize prematurely.

---

# 48. FINAL ACCEPTANCE CRITERIA

## Architecture

- [ ] Central ad service
- [ ] Central ad configuration
- [ ] Central ad IDs
- [ ] Central eligibility logic
- [ ] Central frequency control
- [ ] Premium override
- [ ] Rewarded silence state
- [ ] Screen-level ad policies
- [ ] Error handling

## Native

- [ ] Primary in-content ad format
- [ ] Natural content placement
- [ ] Clearly labeled Sponsored
- [ ] Theme-aware container
- [ ] Hidden on sensitive workflows
- [ ] Hidden for Premium

## Banner

- [ ] Supported architecturally
- [ ] Disabled by default
- [ ] NOT placed on main tab screens
- [ ] NOT persistent across the app
- [ ] Only enabled later for specifically approved placements

## Interstitial

- [ ] Natural transitions only
- [ ] 10–15 minute starting cooldown
- [ ] No sensitive workflows
- [ ] No ad stacking
- [ ] Suppressed by rewarded silence
- [ ] Suppressed for Premium

## Rewarded

- [ ] User initiated
- [ ] Clear reward explanation
- [ ] 15-minute timestamp
- [ ] Persisted
- [ ] Reward only after successful completion
- [ ] No repeated nagging
- [ ] Premium users never see the offer

## App Open

- [ ] No first-launch ad
- [ ] Delayed until meaningful usage
- [ ] 30-minute starting cooldown
- [ ] Does not block startup unnecessarily
- [ ] Suppressed by rewarded silence
- [ ] Suppressed for Premium

## UX

- [ ] No ads during onboarding
- [ ] No ads during active food logging
- [ ] No ads during active activity logging
- [ ] No ads inside AI conversation
- [ ] No ads inside Cycle Calendar initially
- [ ] No interruption during BMI calculation
- [ ] No unexpected fullscreen ads
- [ ] No ad stacking
- [ ] Ad UI localized
- [ ] Ad containers theme-aware

---

# FINAL PRODUCT PRINCIPLE

Sini AI is a **women's fitness, nutrition, cycle and wellness product**, not an advertising application.

The monetization should therefore feel like this:

### Free

> "Sini is genuinely useful for free, and you'll occasionally see sponsored content."

### Rewarded

> "If you don't want pop-up interruptions right now, you can choose to watch one ad and get 15 minutes of silence."

### Premium

> "If you love Sini and want the cleanest experience, Premium removes all advertising."

The user's core journey must always remain:

```text
Understand my day
       ↓
Track food
       ↓
Track activity
       ↓
Understand calories
       ↓
Understand my cycle
       ↓
Get Sini's guidance
```

Ads should exist **around that journey, never inside it**.

Prioritize:

**User trust + retention + Premium conversion + sustainable ad revenue**

over maximum ad impressions.