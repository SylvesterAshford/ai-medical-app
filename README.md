# MediAI — Myanmar's AI Health Navigator

A cross-platform AI medical assistant built with **React Native (Expo)** and **TypeScript**. Provides health information, symptom triage, hospital finding, and bilingual support (English + Burmese).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native (Expo SDK 54) |
| Language | TypeScript |
| AI | Google Gemini via Supabase Edge Function proxy |
| Auth | Supabase Auth |
| Database | Supabase (Managed Postgres) |
| State | Zustand |
| Navigation | React Navigation (native-stack + bottom-tabs) |
| Storage | Supabase Storage (medical images) |
| Location | expo-location |
| Voice | expo-speech + expo-av |

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator, or Expo Go on a physical device

### Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd ai-medical-app

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your actual keys (see Environment Variables below)

# 4. Start the dev server
npx expo start
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `EXPO_PUBLIC_AI_API_KEY` | Google Gemini API key (used by edge function) |
| `EXPO_PUBLIC_AI_API_URL` | Gemini API endpoint URL |

> ⚠️ Never commit `.env` to version control. It's already in `.gitignore`.

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Card.tsx
│   ├── DisclaimerModal.tsx
│   ├── EmptyState.tsx
│   ├── ErrorBoundary.tsx
│   ├── GradientBackground.tsx
│   ├── GradientButton.tsx
│   ├── HospitalCard.tsx
│   ├── OfflineBanner.tsx
│   ├── TabBar.tsx
│   └── TriageQuestionCard.tsx
├── hooks/            # Custom React hooks
│   ├── useNetworkStatus.ts
│   └── useVoiceInput.ts
├── navigation/       # React Navigation setup
│   ├── AppNavigator.tsx
│   ├── MainTabNavigator.tsx
│   └── types.ts
├── screens/          # App screens
│   ├── HomeScreen.tsx
│   ├── CompanionScreen.tsx   (AI Chat)
│   ├── AnalysisScreen.tsx    (Image Analysis)
│   ├── VisitsScreen.tsx      (Health Tools / BMI)
│   ├── ProfileScreen.tsx
│   ├── LoginScreen.tsx
│   ├── OnboardingScreen.tsx
│   ├── SubscriptionScreen.tsx
│   ├── HospitalFinderScreen.tsx
│   └── EmergencyScreen.tsx
├── services/         # External service integrations
│   ├── ai.ts              (Gemini AI proxy)
│   ├── analytics.ts       (Event & screen tracking)
│   ├── errorTracking.ts   (Error capture & reporting)
│   ├── hospitals.ts       (Hospital search)
│   └── supabase.ts        (Auth & storage)
├── store/            # Zustand global state
│   └── useAppStore.ts
├── theme/            # Design system tokens
│   └── index.ts
├── types/            # TypeScript type definitions
│   └── index.ts
└── utils/            # Helper functions
    ├── index.ts
    ├── performance.ts     (Timing & perf monitoring)
    ├── translations.ts    (i18n strings)
    ├── triageRules.ts     (Deterministic triage engine)
    └── validation.ts      (Form validation helpers)
```

## Key Architecture Decisions

1. **Supabase Edge Function Proxy** — AI calls are routed through a Supabase Edge Function to bypass geo-restrictions on the Gemini API in Myanmar.
2. **Deterministic Triage** — Emergency/symptom detection uses keyword matching (`triageRules.ts`), not the LLM, ensuring consistent safety behavior.
3. **Bilingual First** — All screens support English and Burmese via `translations.ts`. The AI system prompt adapts per language.
4. **Zustand (no Redux)** — Single flat store with no boilerplate. Keeps state simple for an MVP.
5. **Safety Guardrails** — AI responses are sanitized to block prescriptions and diagnoses. Emergency keywords trigger immediate 192 (Myanmar ambulance) guidance.

## Scripts

```bash
npm start        # Start Expo dev server
npm run ios      # Start on iOS simulator
npm run android  # Start on Android emulator
npm run web      # Start web version
npm run lint     # TypeScript type checking
```
