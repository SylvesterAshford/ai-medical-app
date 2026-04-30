<![CDATA[# 🏥 ZawgyiAI — AI-Powered Health Navigator for Myanmar

<div align="center">

**An intelligent mobile health companion built for the people of Myanmar**

*Bridging the healthcare accessibility gap with AI-powered symptom triage, medical image analysis, bilingual support (English + Burmese), and real-time hospital discovery.*

[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_54-000020?logo=expo)](https://expo.dev/)
[![Gemini AI](https://img.shields.io/badge/Gemini_2.0_Flash-AI-4285F4?logo=google)](https://ai.google.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Screen-by-Screen Walkthrough](#-screen-by-screen-walkthrough)
- [AI & Safety System](#-ai--safety-system)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Supabase Setup](#-supabase-setup)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🌟 Overview

**ZawgyiAI** is a cross-platform mobile health navigator designed specifically for Myanmar. It uses Google's Gemini 2.0 Flash model (proxied through a Supabase Edge Function to bypass regional API restrictions) to provide:

- Conversational health guidance in both **English** and **Burmese (မြန်မာ)**
- **AI-powered medical image analysis** (X-rays, MRIs, scans)
- **Prescription translation** — snap a photo of a prescription and get plain-language explanations
- **Structured symptom triage** with deterministic emergency detection
- **Nearby hospital finder** with interactive map, routing, and one-tap calling
- **Visit summary generation** exported as shareable PDF documents

> ⚠️ **Disclaimer**: ZawgyiAI is **not** a replacement for professional medical advice. It provides general health information only and always directs users to qualified healthcare providers for emergencies.

---

## 🎯 Problem Statement

Myanmar faces significant healthcare accessibility challenges:

- **Doctor-to-patient ratio**: ~1 doctor per 1,600 people (rural areas far worse)
- **Language barrier**: Medical information is predominantly in English
- **Geographic isolation**: Many communities are hours from the nearest hospital
- **Low health literacy**: Difficulty understanding prescriptions and medical terminology

ZawgyiAI addresses these gaps by putting an AI-powered, Burmese-speaking health navigator in every user's pocket.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **🤖 AI Health Companion** | WhatsApp-style chat interface powered by Gemini 2.0 Flash. Supports multi-turn conversations with patient context. |
| **🔍 Medical Image Analysis** | Upload X-rays, MRIs, CT scans for AI-powered analysis with structured markdown reports. |
| **💊 Prescription Reader** | Photograph a prescription to get each medication explained in plain Burmese/English. |
| **🚨 Emergency Triage** | Deterministic (non-LLM) keyword detection for chest pain, stroke, breathing difficulty, etc. Auto-routes to emergency screen with one-tap 119 dialing. |
| **📋 Structured Triage** | Category-specific yes/no questionnaires that evaluate symptom severity and escalate when needed. |
| **🗺️ Hospital Finder** | Interactive map (Apple/Google Maps) with live routing via OSRM, distance calculations (Haversine), and offline caching. |
| **🌐 Bilingual UI** | Full English ↔ Burmese toggle across every screen, including AI responses. |
| **📄 Visit Summary PDF** | AI generates structured medical visit summaries from chat history, exportable as shareable PDFs. |
| **📊 Health Tools** | BMI calculator with visual scale, symptom checker quick-link, health risk assessment cards. |
| **💎 Subscription System** | Tiered pricing (Weekly / Monthly / Yearly) with premium feature gating. |
| **🔇 Offline Support** | Network status detection, hospital data caching (24h TTL), and graceful degradation. |
| **🎙️ Voice Input** | Audio recording infrastructure with microphone input (ready for cloud STT integration). |

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React Native 0.81** | Cross-platform mobile framework (iOS + Android) |
| **Expo SDK 54** | Build tooling, managed workflow, OTA updates |
| **TypeScript 5.9** | Type safety across the entire codebase |
| **Zustand 5** | Lightweight global state management |
| **React Navigation 7** | Native stack + bottom tab navigation with screen tracking |
| **Expo Linear Gradient** | Gradient backgrounds and button styling |
| **Expo Blur** | Frosted glass UI effects (subscription screen) |
| **react-native-maps** | Interactive hospital map with custom markers and polylines |
| **react-native-markdown-display** | Rendering AI analysis results as rich markdown |
| **expo-image-picker** | Camera and gallery image selection |
| **expo-image-manipulator** | Client-side image compression + base64 encoding |
| **expo-location** | GPS positioning and reverse geocoding |
| **expo-print + expo-sharing** | PDF generation and native share sheet |
| **expo-speech / expo-av** | Voice recording infrastructure |
| **@react-native-async-storage** | Persistent local storage (hospital caching) |
| **@react-native-community/netinfo** | Real-time network connectivity monitoring |

### Backend

| Technology | Purpose |
|---|---|
| **Supabase** | PostgreSQL database, auth, storage, edge functions |
| **Supabase Edge Functions** | Deno-based serverless proxy for Gemini API (bypasses Myanmar geo-restrictions) |
| **Google Gemini 2.0 Flash** | LLM powering chat, image analysis, prescription reading, and visit summaries |
| **OSRM** | Open-source routing engine for driving directions (no API key required) |

### Design System

| Aspect | Details |
|---|---|
| **Color Palette** | Soft teal/blue NHS-inspired theme with mint backgrounds |
| **Typography** | System fonts with generous `lineHeight` for Burmese script rendering |
| **Gradients** | Primary (teal→aqua), accent (purple), header, send button |
| **Shadows** | Three-tier shadow system (card, button, modal) |
| **Spacing** | 8-point grid system (xs=4 → huge=48) |
| **Border Radius** | Consistent rounded corners (xs=8 → full=999) |

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                     │
│                                                          │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌───────────┐  │
│  │  Home    │ │ Companion │ │ Analysis │ │  Hospital  │  │
│  │  Screen  │ │  Screen   │ │  Screen  │ │  Finder    │  │
│  └────┬─────┘ └─────┬─────┘ └────┬─────┘ └─────┬─────┘  │
│       │             │            │              │        │
│  ┌────┴─────────────┴────────────┴──────────────┴────┐   │
│  │              REUSABLE COMPONENTS                  │   │
│  │  Card • GradientButton • HospitalCard • TabBar    │   │
│  │  DisclaimerModal • TriageQuestionCard • EmptyState │   │
│  │  OfflineBanner • ErrorBoundary • GradientBG       │   │
│  └───────────────────────┬───────────────────────────┘   │
├──────────────────────────┼───────────────────────────────┤
│                   STATE LAYER                            │
│                                                          │
│  ┌───────────────────────┴───────────────────────────┐   │
│  │            Zustand Store (useAppStore)             │   │
│  │  Auth • Chat • Profile • Triage • Emergency       │   │
│  │  Offline • Hospitals • HealthProfile • Records     │   │
│  └───────────────────────┬───────────────────────────┘   │
├──────────────────────────┼───────────────────────────────┤
│                 SERVICE LAYER                            │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐  │
│  │ AI       │ │ Hospital │ │ Analytics │ │ Error     │  │
│  │ Service  │ │ Service  │ │ Service   │ │ Tracking  │  │
│  └────┬─────┘ └────┬─────┘ └───────────┘ └───────────┘  │
│       │            │                                     │
├───────┼────────────┼─────────────────────────────────────┤
│       ▼            ▼          BACKEND                    │
│  ┌─────────────────────────────────────────────────┐     │
│  │  Supabase Edge Function (gemini-proxy)          │     │
│  │  ┌──────────────┐  ┌─────────────────────────┐  │     │
│  │  │ Gemini 2.0   │  │ PostgreSQL (hospitals,  │  │     │
│  │  │ Flash API    │  │ health_profiles,        │  │     │
│  │  │              │  │ medical_records)        │  │     │
│  │  └──────────────┘  └─────────────────────────┘  │     │
│  └─────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────┘
```

### Data Flow: Chat Message

```
User types message
       │
       ▼
┌──────────────┐     ┌──────────────────┐
│  runPreChecks│────►│ Emergency?       │──► Emergency Screen (119 dial)
│  (triage     │     │ Hospital search? │──► Hospital Finder Screen
│   rules)     │     │ Symptom triage?  │──► Triage Question Cards
└──────┬───────┘     └──────────────────┘
       │ normal
       ▼
┌──────────────────┐
│ Get user location│ (reverse geocode → city)
│ Build system     │ (patient profile, records, city context)
│ prompt           │
└──────┬───────────┘
       ▼
┌──────────────────┐     ┌──────────────────┐
│ POST to Supabase │────►│ Edge Function    │
│ Edge Function    │     │ (gemini-proxy)   │
└──────────────────┘     └──────┬───────────┘
                                │
                                ▼
                         ┌──────────────┐
                         │ Gemini 2.0   │
                         │ Flash API    │
                         └──────┬───────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ sanitizeAIResponse()  │ ← blocks prescriptions/diagnoses
                    │ Check SEARCH_HOSPITAL │ ← inline hospital cards
                    │ Append disclaimer     │
                    └───────────┬───────────┘
                                │
                                ▼
                          Chat bubble
```

---

## 📂 Project Structure

```
ai-medical-app-startup/
├── App.tsx                        # Root entry — Navigation + ErrorBoundary
├── index.ts                       # Expo registerRootComponent
├── app.json                       # Expo configuration
├── package.json                   # Dependencies & scripts
├── tsconfig.json                  # TypeScript config
├── .env.example                   # Environment variable template
│
├── src/
│   ├── components/                # Reusable UI components
│   │   ├── Card.tsx               # Base card with shadow
│   │   ├── DisclaimerModal.tsx    # Medical disclaimer modal
│   │   ├── EmptyState.tsx         # Generic empty state component
│   │   ├── ErrorBoundary.tsx      # React error boundary wrapper
│   │   ├── GradientBackground.tsx # App-wide gradient background
│   │   ├── GradientButton.tsx     # Reusable gradient CTA button
│   │   ├── HospitalCard.tsx       # Hospital info card (inline in chat)
│   │   ├── OfflineBanner.tsx      # Network disconnection banner
│   │   ├── TabBar.tsx             # Custom floating bottom tab bar
│   │   └── TriageQuestionCard.tsx  # Yes/No triage question UI
│   │
│   ├── screens/                   # Application screens
│   │   ├── HomeScreen.tsx         # Dashboard with feature cards + health topics
│   │   ├── CompanionScreen.tsx    # AI chat (main feature)
│   │   ├── AnalysisScreen.tsx     # Medical image + prescription analysis
│   │   ├── VisitsScreen.tsx       # Health tools (BMI, symptom checker, risk)
│   │   ├── ProfileScreen.tsx      # User profile + settings
│   │   ├── HospitalFinderScreen.tsx # Interactive map + routing
│   │   ├── EmergencyScreen.tsx    # Full-screen emergency flow
│   │   ├── LoginScreen.tsx        # Authentication entry
│   │   ├── OnboardingScreen.tsx   # First-launch walkthrough
│   │   └── SubscriptionScreen.tsx # Premium subscription modal
│   │
│   ├── navigation/                # React Navigation setup
│   │   ├── AppNavigator.tsx       # Root stack (auth flow + main tabs)
│   │   ├── MainTabNavigator.tsx   # Bottom tab navigator
│   │   └── types.ts               # Navigation type exports
│   │
│   ├── services/                  # External service integrations
│   │   ├── ai.ts                  # Gemini AI — chat, image analysis, prescriptions, summaries
│   │   ├── hospitals.ts           # Supabase hospital queries + caching + Haversine distance
│   │   ├── supabase.ts            # Supabase client, auth helpers, image upload
│   │   ├── analytics.ts           # Lightweight event/screen tracking (PostHog-shaped)
│   │   └── errorTracking.ts       # Error capture service (Sentry-shaped)
│   │
│   ├── store/
│   │   └── useAppStore.ts         # Zustand global store (auth, chat, triage, profile)
│   │
│   ├── hooks/
│   │   ├── useNetworkStatus.ts    # Real-time connectivity monitoring
│   │   └── useVoiceInput.ts       # Audio recording with expo-av
│   │
│   ├── theme/
│   │   └── index.ts               # Design system tokens (colors, typography, spacing, shadows)
│   │
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces & type definitions
│   │
│   └── utils/
│       ├── index.ts               # General utilities (BMI calc, formatters, ID gen)
│       ├── translations.ts        # Centralized i18n (English + Burmese)
│       ├── triageRules.ts         # Deterministic triage engine (keywords, questions, evaluation)
│       ├── validation.ts          # Input validation helpers
│       └── performance.ts         # Performance measurement utilities
│
├── supabase/
│   ├── config.toml                # Supabase local dev config
│   └── functions/
│       └── gemini-proxy/          # Edge Function — Gemini API proxy
│
├── supabase_migrations.sql        # Database schema (health_profiles, medical_records)
├── seed_hospitals.sql             # Hospital seed data (Mandalay, Yangon, Naypyidaw)
├── seed_hospitals.ts              # TypeScript hospital seeder script
└── assets/                        # App icons, splash screen, logo
```

---

## 📱 Screen-by-Screen Walkthrough

### 1. Onboarding → Login Flow

The app begins with an **onboarding carousel** introducing core features, followed by a **login screen** where users enter their name and email. Authentication state is managed in Zustand (with Supabase auth helpers available for production integration).

### 2. Home Screen (`HomeScreen.tsx`)

The dashboard presents a gradient header with the ZawgyiAI branding and a greeting that adapts by time of day. Below, a **feature card grid** provides quick access to:
- **AI Chat** — primary CTA with gradient button
- **BMI Check** — navigates to health tools
- **Image Analysis** — medical imaging AI

A horizontally scrollable **Topics section** offers health education cards (blood pressure, sleep, heart health, stress management).

### 3. AI Companion (`CompanionScreen.tsx`) ⭐

The core feature — a WhatsApp-style chat interface with:

- **Disclaimer modal** shown on first visit (must accept before chatting)
- **AI avatar** and branded message bubbles
- **Typing indicator** with animated bouncing dots
- **Pre-check pipeline**: Before every message hits the LLM, deterministic rules check for emergencies, hospital search requests, and symptom categories
- **Inline triage questions**: When symptoms are detected, a structured yes/no questionnaire slides in
- **Inline hospital cards**: When the AI returns `[SEARCH_HOSPITAL: City]`, hospitals are fetched from Supabase and rendered as tappable cards within the chat
- **Visit summary export**: Header button generates a PDF summary of the conversation via the AI, saved as a medical record
- **Voice input**: Microphone button for audio recording
- **Keyboard-aware**: Input bar adjusts for the floating tab bar and keyboard

### 4. Image Analysis (`AnalysisScreen.tsx`)

Two analysis modes controlled by a toggle switch:

- **General Mode**: Upload X-rays, MRIs, CTs — receives structured markdown analysis covering image type, anatomical region, key observations, potential diagnoses, and recommendations
- **Prescription Mode**: Photograph a prescription — each medication is identified and explained in plain language

Images are compressed client-side (resized to 800px, JPEG 70% quality) before base64 encoding to minimize payload.

### 5. Health Tools (`VisitsScreen.tsx`)

- **BMI Calculator**: Input weight (kg) and height (cm), get a calculated BMI with a color-coded visual scale (Underweight → Normal → Overweight → Obese)
- **Symptom Checker**: Quick-link to the AI companion for conversational symptom assessment
- **Health Risk Assessment**: Cards for heart health, diabetes risk, and fitness scoring
- **Daily Health Tips**: Rotating wellness advice

### 6. Hospital Finder (`HospitalFinderScreen.tsx`)

A full-screen interactive map (Apple Maps / Google Maps) featuring:

- **GPS location** with fallback to Mandalay if permissions denied
- **Custom markers** with pulse animation on selection
- **Animated bottom sheet** with hospital details (name, city, type, 24h ER status)
- **OSRM routing**: Calculates and draws driving directions as a polyline with distance/duration info
- **Google Maps deep-link**: Opens turn-by-turn navigation in Google Maps
- **One-tap calling**: Direct phone call to hospital
- **Myanmar bounds clamping**: Map is restricted to Myanmar's geographic boundaries
- **Emergency mode**: When triggered from the emergency screen, shows a prominent "Call 119" banner

### 7. Emergency Screen (`EmergencyScreen.tsx`)

A full-screen amber-gradient emergency flow triggered when the triage engine detects life-threatening symptoms:

- **119 call button** — prominent, one-tap ambulance dialing
- **Find nearest hospital** — routes to Hospital Finder in emergency mode
- **Back to chat** — returns to the companion screen
- **Always-visible disclaimer** — "This AI is not a doctor"

### 8. Profile Screen (`ProfileScreen.tsx`)

User settings including:
- **Language toggle** (English ↔ Burmese)
- **Subscription status** (Free / Premium)
- **Account management** links
- **Logout**

### 9. Subscription Screen (`SubscriptionScreen.tsx`)

Modal overlay with three pricing tiers:
- Weekly ($2.99 / 7 days)
- Monthly ($7.99 / 30 days) — **Best Offer**
- Yearly ($49.99 / 365 days)

Includes feature list, restore purchases, and terms/privacy links.

---

## 🧠 AI & Safety System

ZawgyiAI implements a **multi-layered safety architecture** that combines deterministic rules with LLM guardrails:

### Layer 1: Pre-Check Engine (Deterministic, No LLM)

Located in [`src/utils/triageRules.ts`](src/utils/triageRules.ts), this runs **before** any message reaches the AI:

| Check | Action |
|---|---|
| **Emergency keywords** (chest pain, stroke, bleeding, consciousness loss, etc.) in English + Burmese | Immediately routes to Emergency Screen |
| **Hospital search phrases** ("find hospital near me", "အနီးဆုံး ဆေးရုံ") | Navigates to Hospital Finder |
| **Symptom category detection** (headache, abdominal, fever, injury, etc.) | Triggers structured triage questionnaire |

### Layer 2: Structured Triage Questionnaires

When symptoms are detected, a category-specific questionnaire is presented (e.g., chest pain → 4 questions about severity, sweating, arm spread, breathing). Responses are evaluated with:

- **Emergency indicators**: If any emergency-flag question is answered "Yes" → escalate to Emergency Screen
- **Severity scoring**: Count of positive answers determines Low / Medium / High / Critical

### Layer 3: LLM Safety Guardrails

The Gemini system prompt enforces:
- Never diagnose or prescribe specific dosages
- Always remind users it's not a doctor
- Direct to 119 for emergencies
- Only suggest hospitals when explicitly asked
- Respond in the user's selected language

### Layer 4: Response Sanitization

Post-LLM processing ([`sanitizeAIResponse()`](src/utils/triageRules.ts)):
- Detects and flags explicit prescription dosages
- Removes hallucinated disclaimers to apply the app's own consistent disclaimer
- Strips blocked content patterns (diagnosis statements, dosage instructions)

### Layer 5: Consistent Disclaimers

Every AI response automatically appends a standardized disclaimer in the user's language, ensuring users always see the "not a doctor" warning.

---

## 🗃 Database Schema

### `hospitals` table

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | TEXT | Hospital name (bilingual) |
| `city` | TEXT | City name |
| `latitude` | FLOAT | GPS latitude |
| `longitude` | FLOAT | GPS longitude |
| `phone` | TEXT | Contact number |
| `type` | TEXT | `'public'` or `'private'` |
| `emergency_24hr` | BOOLEAN | 24-hour ER availability |

### `health_profiles` table (RLS-protected)

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key → `auth.users` |
| `chronic_conditions` | TEXT[] | List of chronic conditions |
| `allergies` | TEXT[] | Known allergies |
| `current_medications` | TEXT[] | Active medications |
| `updated_at` | TIMESTAMPTZ | Auto-updated on modification |

### `medical_records` table (RLS-protected)

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key → `auth.users` |
| `type` | TEXT | `'Visit'`, `'Lab'`, or `'Prescription'` |
| `summary` | TEXT | AI-generated summary text |
| `raw_text_ocr` | TEXT | Raw OCR output (optional) |
| `image_url` | TEXT | Storage reference (optional) |
| `follow_up_date` | TIMESTAMPTZ | Follow-up reminder (optional) |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **yarn**
- **Expo CLI** (`npx expo`)
- **Expo Go** app on your phone (for development)
- **Supabase** account (for backend features)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/SylvesterAshford/ai-medical-app.git
cd ai-medical-app-startup

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env

# 4. Configure environment variables (see below)
# Edit .env with your Supabase and API credentials

# 5. Start the development server
npm start
# or
npx expo start
```

### Running on Device

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Scan QR code with Expo Go
npm start
```

---

## 🔑 Environment Variables

Create a `.env` file from `.env.example`:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google Gemini AI (via Supabase Edge Function proxy)
EXPO_PUBLIC_AI_API_KEY=your-api-key
EXPO_PUBLIC_AI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
```

> **Note**: The app works in **demo mode** without credentials — AI responses use a built-in demo responder and hospital data is unavailable.

---

## ☁️ Supabase Setup

### 1. Create Supabase Project

Create a new project at [supabase.com](https://supabase.com).

### 2. Run Database Migrations

Execute the SQL in `supabase_migrations.sql` in the Supabase SQL Editor to create:
- `health_profiles` table with RLS policies
- `medical_records` table with RLS policies
- Auto-update trigger for `updated_at`

### 3. Create Hospitals Table & Seed Data

```sql
-- Create the hospitals table
CREATE TABLE public.hospitals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    phone TEXT,
    type TEXT CHECK (type IN ('public', 'private')),
    emergency_24hr BOOLEAN DEFAULT false
);
```

Then run `seed_hospitals.sql` to populate with initial hospital data for Mandalay, Yangon, and Naypyidaw.

### 4. Deploy the Gemini Proxy Edge Function

```bash
# From the project root
npx supabase functions deploy gemini-proxy

# Set the Gemini API key as an edge function secret
npx supabase secrets set GEMINI_API_KEY=your-google-ai-api-key
```

The edge function acts as a proxy between the mobile app and Google's Gemini API, solving regional API availability issues in Myanmar.

---

## 🗺 Roadmap

- [ ] **Supabase Auth integration** — Email/password + social login
- [ ] **Cloud STT** — Voice-to-text transcription for voice input
- [ ] **Push notifications** — Medication reminders, follow-up alerts
- [ ] **Offline AI** — On-device model for basic triage without internet
- [ ] **Health records sync** — Persist medical records to Supabase with RLS
- [ ] **In-app payments** — Stripe/RevenueCat for subscription management
- [ ] **Expanded hospital database** — All districts and townships
- [ ] **Community health workers module** — Peer-to-expert knowledge flow
- [ ] **Wearable integration** — Heart rate, SpO2 from connected devices

---

## 📄 License

This project is private. All rights reserved.

---

<div align="center">

**Built with ❤️ for Myanmar**

*ZawgyiAI — Making healthcare accessible, one conversation at a time.*

</div>
]]>
