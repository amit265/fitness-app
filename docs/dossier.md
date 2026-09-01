# AuraFit: Technical & Product Dossier

AuraFit is a production-ready, cycle-aware female fitness and wellness mobile application built with React Native and Expo. The application is designed to help users optimize their nutrition, workout intensities, and recovery in alignment with their menstrual cycles.

---

## 1. Product Overview & Design System

AuraFit is crafted around the concept of **Empathetic Wellness**. Unlike traditional fitness trackers, AuraFit adapts to the user's natural cycle and hormonal fluctuations, avoiding clinical or neon styles in favor of a warm, organic, and premium aesthetic.

### Brand Design Tokens
*   **Sage Green** (Primary Action & Health): Represents recovery, safety, and balance.
    *   Default: `#5F7D6B` • Light: `#EAF0EC` • Dark: `#3F5747`
*   **Soft Rose** (Menstrual Highlights): Represents flow, comfort, and cycle awareness.
    *   Default: `#D4A373` (with soft rose tones `#E8C5C1`) • Light: `#FAF1F0` • Dark: `#8E5854`
*   **Cream & Oat** (Backgrounds): High-comfort soft cream backdrops.
    *   Oat: `#FAF8F5` • White: `#FFFFFF`
*   **Typography**:
    *   Headings: **Playfair Display** (Serif - premium and high-end feel).
    *   Body text & Numbers: **Outfit** (Sans-serif - readable and clean).

---

## 2. Technical Architecture & File Layout

The app is built on a clean Expo TypeScript folder structure:

```
src/
├── app/                       # Expo File Router Layouts & Screens
│   ├── (tabs)/                # Bottom Tabs Navigation Layout
│   │   ├── _layout.tsx        # Tabs layout styling (Sage colors)
│   │   ├── index.tsx          # Today Screen Dashboard (SVG Dial)
│   │   ├── log.tsx            # Logging Pane (Natural Language + Manual)
│   │   ├── progress.tsx       # Recomposition trends (SVG Line Chart)
│   │   └── profile.tsx        # Profile configuration, API keys, diagnostics
│   ├── _layout.tsx            # Navigation Guard redirect redirect and Root
│   └── onboarding.tsx         # Progressive 5-step onboarding screen
├── components/                # Reusable UI controls
│   ├── Button.tsx             # Rounded action buttons
│   ├── Card.tsx               # Styled container with soft shadows
│   ├── CoachChat.tsx          # Conversational chatbot modal sheet
│   ├── InputField.tsx         # Outlined text entry fields
│   ├── LineChart.tsx          # Lightweight SVG line chart
│   └── Typography.tsx         # Outfit & Playfair font styles wrapper
├── constants/                 # Shared configurations
│   ├── appConfig.ts           # Model settings & endpoint addresses
│   └── theme.ts               # Theme tokens (colors, margins, shadows)
├── domain/                    # Pure business logic calculations
│   ├── cycle/                 # Menstrual Math Engine & cycle metrics tests
│   │   ├── cycleEngine.ts
│   │   └── test-runner.ts
│   └── readiness/             # Readiness Engine algorithms & tests
│       ├── readinessEngine.ts
│       └── test-runner.ts
├── services/                  # Network client & database services
│   ├── ai/                    # Parsing prompts, Groq API, and fallbacks
│   │   ├── aiService.ts
│   │   ├── coachingPrompts.ts
│   │   └── groqClient.ts
│   └── nutrition/             # Local nutrition food search index
│       └── nutritionService.ts
├── store/                     # Global Store State
│   └── useAppStore.ts         # Persistent Zustand Store (Offline First)
└── utils/                     # Helpers
    └── date.ts                # Timezone-safe UTC calculations
```

---

## 3. Core Engine Components

### A. Persistent Offline Store (`useAppStore.ts`)
Built with Zustand and persisted via AsyncStorage, the store provides:
*   `userProfile`: Tracks name, age, height, goal, API key, and pause preferences.
*   `cyclePreferences`: Custom cycle and period lengths.
*   `periods`: Logged menstrual dates.
*   `dailyCheckIns`: Keyed by UTC Date (`YYYY-MM-DD`) storing sleep, energy, stress, hydration, mood, and symptoms.
*   `meals` & `activities`: Logged workouts and food.
*   `measurements`: Time-series weight and body circumferences.
*   `resetStore`: Diagnostics cleanup action.

### B. Menstrual Cycle Engine (`cycleEngine.ts`)
Performs timezone-independent date operations to predict menstrual states:
1.  **Stats Calculator**: Computes historical averages for cycle length and period duration, flagging irregularities.
2.  **Phase Predictor**: Maps any target date to a specific cycle phase (`menstrual`, `follicular`, `ovulatory`, `luteal`) based on the latest logged period.
3.  **Fertile Window Identifier**: Computes the fertile window (5 days prior to ovulation, ovulation day, and 1 day post-ovulation).

### C. Readiness Engine (`readinessEngine.ts`)
Calculates a 0-100 daily readiness index using weighted parameters:
$$\text{Readiness} = (\text{Sleep} \times 0.35) + (\text{Energy} \times 0.25) + (\text{Stress} \times 0.15) + (\text{Hydration} \times 0.10) + (\text{Recovery} \times 0.10) + (\text{CycleModifier} \times 0.05)$$

*   **Symptoms Penalty**: Cramps, bloating, or fatigue deduct cycle modifier scores.
*   **Empathetic Recommendations**: Recommends workouts (e.g. progressive strength) matching goals and scores. If active cramps are logged, it automatically downgrades the suggestion to a **Cramp Relief Mobility Flow**, bypassing high readiness sub-scores.

### D. Unified AI Parser & Coach Chat (`aiService.ts`)
Implements client-side natural language logging:
*   Checks if a Groq API key is present. If yes, query `llama-3.3-70b-versatile` directly from the client.
*   If key is missing or network fails, automatically falls back to:
    - **Local Curated Database** (`nutritionService.ts`): Offline keyword lookup for food (e.g., egg, chicken breast, oats) with size multipliers.
    - **Local Regex Parser** (`regexParser.ts`): Extract weights ("62kg") and workouts ("walked 30 mins").
*   **Confirmation Card UI**: Shows parsed results as an editable draft before saving.

---

## 4. UI Dashboard & Visualization

### Today Dashboard (SVG Dial)
Renders a custom circular progress dial inside the dashboard using React Native SVG. Shows the numerical score and lists factor contributions (Sleep, Stress, Hydration, Energy) below. Renders the AI daily insight card and a quick hydration log button (+250ml).

### Progress Charts (SVG Line Chart)
Plots time-series weights over 7d, 30d, or 90d. Color-codes dots representing menstrual phases on each date (Menstrual = Rose, Follicular/Ovulatory = Sage, Luteal = Plum) to highlight cyclical weight shifts. Includes educational tips explaining progesterone-induced water retention (2-3kg spikes) to manage scale anxiety.

---

## 5. Verification & Code Quality

Static typing checks and test suites ensure compilation clean states:

### Unit Tests
*   `src/domain/cycle/test-runner.ts`: Checks 26 assertions verifying phase transitions, regular lengths, irregular cycles, and fertile margins.
*   `src/domain/readiness/test-runner.ts`: Checks 7 assertions verifying perfect logs, sub-optimal parameters, symptoms-based mobility overrides, and workout strain recovery deductions.
*   **Command to Run Tests**:
    ```bash
    npx ts-node -O '{"module": "commonjs", "types": ["node"]}' src/domain/cycle/test-runner.ts
    npx ts-node -O '{"module": "commonjs", "types": ["node"]}' src/domain/readiness/test-runner.ts
    ```
