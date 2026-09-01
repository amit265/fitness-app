# AuraFit: Cycle-Aware Female Fitness & Wellness App

AuraFit is a premium, production-ready, cycle-aware fitness and wellness mobile application built with React Native and Expo. The app helps users align their training, nutrition, and recovery with their natural hormonal cycle phases.

---

## 🎨 Branding & Aesthetics
*   **Color Palette**: Organic, warm, and highly premium tones (Sage Green `#5F7D6B`, Soft Rose `#E8C5C1`, Cream Backgrounds `#FAF8F5`).
*   **Typography**: Playfair Display (Serif Headings) & Outfit (Sans-Serif Body/Data).
*   **Interface**: Employs a soft shadow design, smooth rounded corners, and custom SVG progress dials/charts.

---

## 🚀 Key Features
1.  **5-Step Onboarding Flow**: Progressively captures user details (goals, typical cycle parameters, height/weight) and optional Groq API keys.
2.  **Menstrual Cycle Engine**: Pure domain math calculating phase estimates (Menstrual, Follicular, Ovulatory, Luteal) and fertile windows.
3.  **Readiness Score Engine**: Weighted algorithms evaluating sleep quality, energy, stress, water hydration, and training strain to suggest daily plans. Pauses and symptom deductions (like cramps) are automatically factored in.
4.  **Natural Language Parse Logging**: Chat search bar matching foods (via local database) and weights/workouts (via regex parser). Connects to Groq Cloud client-side for dynamic parsing (if key is set).
5.  **Progress Tracking Charts**: Recomposition SVG lines plotting weight averages with menstrual phase color indicators on each dot.
6.  **Settings & Pauses**: Customize cycle lengths, view stored item statistics, edit Groq keys, or pause predictions (for pregnancy/overrides).

---

## 📖 Project Documentation
All project guidelines, blueprints, and architecture summaries are stored inside the `docs/` folder:
*   [Technical & Product Dossier](docs/dossier.md): Detail mapping of file structures, stores, engines, and algorithms.
*   [Product Architecture Blueprint](docs/MISSION_%20DESIGN%20AND%20BUILD%20A%20PRODUCTION-READY%20CYCLE-AWARE%20FEMALE%20FITNESS%20&%20WELLNESS%20APP.md): Initial specification and phase breakdowns.

---

## 🛠️ Setup & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Development Server
```bash
npx expo start
```

### 3. Run Unit Tests
AuraFit includes two TS unit test runners built for the core mathematical engines:
```bash
# Run Menstrual Cycle Math tests (26 assertions)
npx ts-node -O '{"module": "commonjs", "types": ["node"]}' src/domain/cycle/test-runner.ts

# Run Readiness Score and Recommendation tests (7 assertions)
npx ts-node -O '{"module": "commonjs", "types": ["node"]}' src/domain/readiness/test-runner.ts
```
*Note: Both test runners run completely offline on Node.*
