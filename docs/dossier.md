# Sini: Technical & Product Dossier

**Full Name**: Sini: Cycle Syncing & Fitness
**Tech Stack**: React Native, Expo (SDK 52), Expo Router, Zustand, i18next, React Native Reanimated.

Sini is a production-ready, cycle-aware female fitness and wellness mobile application. It is designed to help users optimize their nutrition, workout intensities, and recovery in alignment with their natural hormonal fluctuations and menstrual cycles.

---

## 1. Product Overview & Design System

Sini is crafted around the concept of **Empathetic Wellness**. The app dynamically adapts to the user's natural cycle phases, utilizing a warm, organic, and premium aesthetic that evolves visually based on cycle states.

### Dynamic Cycle-Adaptive Theme System
The UI automatically shifts its color palette based on the user's current menstrual phase, creating a deeply personalized and empathetic visual experience:
*   **Menstrual Phase (Soft Rose)**: Warm, comforting tones (`#D4A373`, `#FAF1F0`) emphasizing rest and recovery.
*   **Follicular/Ovulatory Phase (Sage Green)**: Vibrant, energetic tones (`#5F7D6B`, `#EAF0EC`) encouraging high-intensity workouts and movement.
*   **Luteal Phase (Plum/Lavender)**: Calming, transitional tones focusing on steady-state activities and prep.
*   **Dark Mode Support**: Full native dark mode integration that seamlessly darkens the phase-specific palettes for low-light environments.

### Typography
*   **Headings**: **Playfair Display** (Serif - premium and high-end feel).
*   **Body text & Numbers**: **Outfit** (Sans-serif - readable and clean).

---

## 2. Technical Architecture & File Layout

The app is built on a clean Expo TypeScript folder structure using file-based routing:

```
src/
├── app/                       # Expo File Router Layouts & Screens
│   ├── (tabs)/                # Bottom Tabs Navigation Layout
│   │   ├── _layout.tsx        # Tabs layout styling & icon definitions
│   │   ├── index.tsx          # Dashboard (SVG Readiness Dial, Quick Actions)
│   │   ├── log.tsx            # Manual & AI-powered logging (Food, Symptoms, Activity)
│   │   ├── progress.tsx       # Historical charts (Cycle mapping, weight, macros)
│   │   └── profile.tsx        # Profile configuration, API keys, diagnostics
│   ├── _layout.tsx            # Navigation Guard & Root Stack setup
│   ├── index.tsx              # Root entry point redirecting to (tabs)
│   ├── settings.tsx           # Global app settings (Ads, Premium, UI language)
│   ├── bmi.tsx                # BMI Calculator sub-screen
│   ├── cycle.tsx              # Deep-dive cycle analytics and fertile window
│   ├── edit-profile.tsx       # User data modification
│   └── onboarding.tsx         # Progressive 5-step onboarding screen
├── components/                # Reusable UI controls (Buttons, Cards, Modals)
├── constants/                 # Shared configurations (Theme tokens, colors)
├── domain/                    # Pure business logic calculations
│   ├── cycle/                 # Menstrual Math Engine
│   └── readiness/             # Readiness & Recommendations Engine
├── i18n/                      # Internationalization config & language JSONs
├── services/                  # Network client & database services
│   ├── ai/                    # Groq API integration & prompt crafting
│   ├── nutrition/             # Local nutrition food search index & macro engine
│   └── AdManager.ts           # Google Mobile Ads wrapper (Banners, Interstitial)
├── store/                     # Global State Management
│   └── useAppStore.ts         # Persistent Zustand Store (Offline First)
└── utils/                     # Helpers (Timezone-safe UTC calculations, Navigation fallbacks)
```

### Expo Router Native Stack Architecture
The app's routing is deeply integrated with native Android/iOS stacks. It utilizes a root `index.tsx` redirect to `(tabs)` alongside robust `router.canGoBack()` fallbacks on all modal screens to ensure completely foolproof hardware back-button support without breaking the Activity lifecycle on Android.

---

## 3. Core Engine Components

### A. Persistent Offline Store (`useAppStore.ts`)
Built with Zustand and persisted via `AsyncStorage`, providing offline-first capabilities:
*   `userProfile` & `cyclePreferences`: Demographics and custom cycle lengths.
*   `periods`: Historical menstrual logs.
*   `dailyCheckIns`: Keyed by UTC Date (`YYYY-MM-DD`) tracking sleep, stress, hydration, and mood.
*   `meals` & `activities`: Logged workouts and food, tracking total calories and macronutrient breakdown.

### B. Menstrual Cycle Engine (`domain/cycle/cycleEngine.ts`)
Performs timezone-independent date operations:
1.  **Stats Calculator**: Computes historical averages for cycle length and period duration.
2.  **Phase Predictor**: Maps any target date to a specific cycle phase (`menstrual`, `follicular`, `ovulatory`, `luteal`).
3.  **Fertile Window Identifier**: Computes the fertile window (5 days prior to ovulation, ovulation day, 1 day post-ovulation).

### C. Readiness Engine (`domain/readiness/readinessEngine.ts`)
Calculates a 0-100 daily readiness index using weighted parameters (Sleep, Energy, Stress, Hydration, Recovery, and Cycle Modifiers).
*   **Empathetic Recommendations**: Suggests workouts matching goals and physiological states. Automatically downgrades intensity (e.g., Cramp Relief Mobility Flow) if severe symptoms are logged.

### D. Nutrition, Food, & Activity Engine
*   **Caloric & Macro Tracking**: Users can log detailed meals, aggregating Proteins, Carbs, and Fats.
*   **Activity Logging**: Tracks duration, intensity, and estimates caloric burn based on physical activity.
*   Calculates Daily Deficit/Surplus by combining Base Metabolic Rate (BMR) with burned calories vs. consumed food.

### E. AI Parser & Groq Coach (`services/ai/aiService.ts`)
Client-side natural language processor:
*   Users can type "I ate 2 eggs and walked for 30 minutes".
*   Connects to `llama-3.3-70b-versatile` (via user-provided Groq API Key) to instantly parse text into structured JSON arrays for Food and Activity logs.

### F. Multi-Language (i18n)
Full internationalization implemented using `i18next`. Currently supports dynamic switching between multiple languages (e.g., English, Spanish, Hindi). Translatable strings are strictly decoupled from UI components.

### G. Ad Monetization (`react-native-google-mobile-ads`)
Seamless, non-intrusive monetization architecture:
*   **Banner Ads**: Placed persistently at the bottom of core screens (Dashboard, Progress, Log).
*   **Interstitial Ads**: Triggered sparingly on high-value actions (e.g., saving a complex log) with strict cooldown timers to prevent user fatigue.

---

## 4. UI Dashboard & Visualization

### Today Dashboard (SVG Dial)
Renders a custom circular progress dial using React Native SVG. The dial's color natively morphs based on the cycle-adaptive theme. It visually communicates Readiness, Cycle Day, and quick actionable buttons (+250ml Hydration, Add Meal, Add Workout).

### Progress & Insights Charts
*   Plots time-series data over 7d, 30d, or 90d.
*   Maps cyclical shifts over biological metrics. For example, weight logs are color-coded by menstrual phases to highlight and educate users on progesterone-induced water retention, mitigating scale anxiety.

---

## 5. Future Scope & Things to Do

As the app scales, the following technical and feature milestones are prioritized:

1.  **Wearable HealthKit / Google Fit Integration**:
    *   *Goal*: Automatically pull sleep duration, step counts, and active calories to remove manual logging friction.
2.  **Premium / Subscription Tier (IAP)**:
    *   *Goal*: Implement `react-native-iap` to allow users to purchase an "Ad-Free" or "Pro Analytics" subscription, disabling the Google Mobile Ads engine and unlocking deeper AI insights.
3.  **Local Push Notifications**:
    *   *Goal*: Use `expo-notifications` to schedule local, offline-first reminders based on cycle phases (e.g., "Your luteal phase begins tomorrow. Make sure to prioritize rest and hydration!").
4.  **Community / Partner Sharing Mode**:
    *   *Goal*: Allow users to securely sync their readiness score or cycle phase with a partner's device via a lightweight backend or Firebase, fostering empathetic household communication.
5.  **Offline Database Migration**:
    *   *Goal*: Migrate the massive Zustand `AsyncStorage` JSON blob into a local SQLite database (`expo-sqlite`) for significantly faster querying and memory optimization as the user accumulates years of daily logs.
