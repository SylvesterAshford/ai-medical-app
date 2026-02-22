# 🏥 AI Medical App: Architecture & MVP Design

## 🏗️ Architecture & Tech Stack

This application is built using a modern, serverless mobile stack designed for speed, cross-platform compatibility, and secure AI integration.

### Core Technologies
*   **Frontend Framework:** React Native with Expo (Managed Workflow)
*   **Language:** TypeScript (for type safety and autocompletion)
*   **State Management:** Zustand (lightweight, hook-based global state in [src/store/useAppStore.ts](cci:7://file:///Users/minbhonesan/Desktop/ai-medical-app/src/store/useAppStore.ts:0:0-0:0))
*   **Navigation:** React Navigation v6 (Native Stack for flow, Bottom Tabs for main navigation)
*   **Styling:** Custom theme system (`src/theme/`) utilizing vanilla React Native `StyleSheet` combined with `expo-linear-gradient` for modern, soft medical aesthetics (Teal/Blue gradients).

### Backend & Infrastructure
*   **BaaS (Backend as a Service):** Supabase
*   **Database:** PostgreSQL (managed by Supabase) for storing `health_profiles`, `medical_records`, and `hospitals` data.
*   **Security:** Row Level Security (RLS) enabled on Supabase to ensure users can only access their own medical data, while allowing anonymous reads for public hospital data.
*   **AI Service Proxy:** Supabase Edge Functions (Deno). The app calls a `gemini-proxy` Edge Function rather than calling the Gemini API directly. This hides the API key from the client and bypasses regional API restrictions.

### Third-Party Integrations
*   **AI Engine:** Google Gemini (via Edge Function proxy) for conversational health guidance and image/prescription analysis.
*   **Location Services:** `expo-location` for retrieving GPS coordinates, computing Haversine distances, and reverse geocoding to provide the AI with the user's current city.
*   **Maps & Routing:** Deep linking to Google Maps/Apple Maps for driving directions (`Linking.openURL`).

---

## 🧠 System Design & Flow

### 1. Dual-Layer Triage System
To ensure patient safety, the app does not rely purely on AI for emergencies.
*   **Deterministic Layer (`triageRules.ts`):** Before messages hit the AI, they are scanned against hardcoded arrays of critical English and Burmese keywords (e.g., "chest pain", "stroke", "သွေးမတိတ်"). If triggered, the app immediately intercepts the message and displays an emergency warning with a button to call 192 (Ambulance).
*   **Generative AI Layer:** If no immediate danger is detected, the message is passed to Gemini, which is strictly prompted to act as an empathetic health navigator, avoid medical diagnoses, and refuse prescription dosage requests.

### 2. Context-Aware AI Chat
When the user chats with the AI, the app silently injects their **Health Profile** (allergies, chronic conditions), **Recent Medical Records**, and **Current City** into the hidden system prompt. This allows the AI to give highly personalized advice without the user having to repeat their medical history.

### 3. Smart Localization
The app is built "Burmese-First". A global Zustand toggler switches the UI text (via `translations.ts`). The system prompt dynamically instructs Gemini to output responses strictly in the requested language (English or Burmese), ensuring medical terms are explained simply.

---

## 🚀 MVP Features (Minimum Viable Product)

These are the core features necessary to launch a robust, functional first version of the app:

### 1. Bilingual UI & AI 🇲🇲🇬🇧
*   Instant toggle between English and Burmese across the entire app.
*   AI responses dynamically adapt to the chosen language, using localized terminology and avoiding mixed-language outputs.

### 2. AI Health Companion Chat 💬
*   Conversational interface for general health questions, wellness tips, and symptom explanations.
*   Built-in guardrails that prevent the AI from giving dangerous medical advice or explicit medication dosages.

### 3. Emergency Detection & Triage 🚨
*   Immediate detection of life-threatening keywords in both languages.
*   Emergency banner that bypasses normal chat rules, displaying the Myanmar Emergency ambulance number (192) with a one-tap dialer.

### 4. Location-Based Hospital Finder 🏥
*   **GPS Distance:** Automatically fetches the user's coordinates and lists the closest 5 hospitals (or all within 50km) sorted by distance.
*   **AI Integration:** Users can type "find hospitals in [City]" and the AI will automatically fetch the data from Supabase and render interactive `HospitalCard` components directly inside the chat bubbles.
*   **Actionable Cards:** One-tap to call the hospital or open Google Maps for driving directions.

### 5. Smart Medical Records (OCR) 📄
*   Users can upload photos of medical documents or prescriptions.
*   The AI visually analyzes the image, extracts the text, and provides a simple, structured explanation of what the medication is for and how to take it.

### 6. Personal Health Profile 👤
*   Users can save their basic details, chronic conditions, and allergies.
*   This data is persistently stored and automatically fed into the AI's "memory" during chat sessions to ensure safe, personalized advice.

### 7. Offline Resilience 📶
*   Asynchronous caching (`AsyncStorage`) of the most recently fetched nearby hospitals so the user can still find emergency locations if they lose internet access while traveling.
