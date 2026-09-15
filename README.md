# Sini (formerly AuraFit)

**Sini** is a premium, production-ready, cycle-aware fitness and wellness mobile application built with React Native and Expo (SDK 57). The app helps users align their training, nutrition, and recovery with their natural hormonal cycle phases, acting as a personal AI-driven fitness coach.

---

## 🎨 Branding & Aesthetics
*   **Color Palette**: Sleek, modern, dark-mode focused. Deep Eggplant Purple (`#3B2938`), Vibrant Coral (`#ED6C80`), Soft Peach (`#F4C1B1`), and Warm Off-White (`#F5EEE6`).
*   **Typography**: *Urbanist* (for data and primary UI) and *Outfit* (for stylistic elements).
*   **Interface**: Employs smooth animations via React Native Reanimated, glassmorphism modals, and fully responsive layouts that support both phones and tablets seamlessly.

---

## 🚀 Key Features
1.  **5-Step Onboarding Flow**: Captures user goals, typical cycle parameters, and baseline body metrics.
2.  **Menstrual Cycle Engine**: Advanced offline engine calculating phase estimates (Menstrual, Follicular, Ovulatory, Luteal) and fertile windows.
3.  **Readiness Score & Dynamic Plans**: Algorithms that evaluate sleep, stress, energy, and cycle phase to suggest tailored daily workout and nutrition plans.
4.  **AI Coach & Natural Language Logging**: Powered by **Groq (LLaMA 3)**. Users can chat with the coach to log food, log workouts, or ask fitness questions. The AI gracefully outputs parsed data that the app digests into local storage.
5.  **In-App Subscriptions (IAP)**: Premium paywalls and subscription management powered by ultra-fast Nitro Modules (`react-native-iap`).
6.  **Progress Tracking**: Rich SVG charts plotting weight averages with menstrual phase color indicators.
7.  **Push Notifications**: Integrated with Firebase Cloud Messaging (FCM) and Expo Notifications for daily reminders.

---

## 🏗️ Architecture & Tech Stack
*   **Framework**: Expo (SDK 57) / React Native 0.86 (New Architecture enabled).
*   **State Management**: Zustand (Persisted via AsyncStorage).
*   **Styling**: Custom utility-based React Native StyleSheet system with responsive constants.
*   **Native Modules**: Uses **Nitro Modules** for high-performance C++ bindings (IAP, Worklets, MMKV-like speeds).
*   **Routing**: Expo Router (File-based navigation).

---

## 🛠️ Setup & Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Development Server
```bash
npx expo start
```
*Note: Sini relies heavily on native modules like Firebase and NitroIap. Running in the standard "Expo Go" app is not supported. You must compile a custom dev client or use prebuilds.*

### 3. Loading Test Data
By default, the app boots cleanly into the Onboarding screen for new users. If you wish to populate the app with 45 days of historical mock data (for UI testing):
1. Navigate to `src/store/useAppStore.ts`
2. Manually invoke `useAppStore.getState().seedMockData()` during initialization, OR use the hidden developer toggle.

---

## 🧪 Testing & Code Quality

### Linting & TypeScript
Due to the size of the codebase, standard `tsc` can trigger call-stack overflows. Always run linting using the optimized script:
```bash
npm run lint
```

### Core Engine Unit Tests
Sini includes standalone TS unit test runners for its mathematical engines:
```bash
# Run cycle prediction and readiness algorithm tests
npm run test

# Run i18n translation validation
npm run test:i18n
```

---

## 🚢 CI/CD & Deployments

Sini is configured for automated cloud building and TestFlight submission.

### GitHub Actions (Recommended)
A workflow is configured in `.github/workflows/ios-build.yml`.
1. Go to the **Actions** tab on GitHub.
2. Select **"🍎 iOS Build & TestFlight"**.
3. Click **Run Workflow**.
This utilizes free macOS runner minutes to build the `.ipa` locally via EAS and submit it to App Store Connect using the injected API Keys.

### Manual CLI Release
If you wish to build locally or trigger EAS cloud builds manually from your Linux/Mac terminal:
```bash
npm run release
```
This script (`build-and-submit.sh`) will automatically:
1. Prompt you to bump the version number.
2. Auto-increment the internal `buildNumber` and `versionCode`.
3. Commit the version bump.
4. Trigger EAS builds and submit to TestFlight / Play Console.
