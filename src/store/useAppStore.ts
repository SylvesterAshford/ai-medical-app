// Zustand global store

import { create } from 'zustand';
import { ChatMessage, User, TriageResponse, Hospital, SymptomCategory, HealthProfile, MedicalRecord } from '../types';
import { generateId } from '../utils';

interface AppState {
    // Auth
    isAuthenticated: boolean;
    user: User | null;
    hasSeenOnboarding: boolean;
    login: (name: string, email: string) => void;
    logout: () => void;
    setOnboardingSeen: () => void;

    // Chat
    messages: ChatMessage[];
    disclaimerShown: boolean;
    isTyping: boolean;
    addMessage: (text: string, sender: 'user' | 'ai', triageCategory?: string, hospitals?: Hospital[]) => void;
    setTyping: (typing: boolean) => void;
    showDisclaimer: () => void;
    clearMessages: () => void;

    // Profile
    language: 'en' | 'my';
    setLanguage: (lang: 'en' | 'my') => void;
    updateProfile: (updates: Partial<User>) => void;

    // Triage
    triageResponses: TriageResponse[];
    currentTriageCategory: SymptomCategory | null;
    addTriageResponse: (response: TriageResponse) => void;
    setTriageCategory: (category: SymptomCategory | null) => void;
    clearTriage: () => void;

    // Emergency
    isEmergencyMode: boolean;
    setEmergencyMode: (emergency: boolean) => void;

    // Offline
    isOffline: boolean;
    setOffline: (offline: boolean) => void;

    // Cached Hospitals
    cachedHospitals: Hospital[];
    setCachedHospitals: (hospitals: Hospital[]) => void;

    // Companion
    healthProfile: HealthProfile | null;
    medicalRecords: MedicalRecord[];
    setHealthProfile: (profile: HealthProfile | null) => void;
    addMedicalRecord: (record: MedicalRecord) => void;
    setMedicalRecords: (records: MedicalRecord[]) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
    // Auth
    isAuthenticated: false,
    user: null,
    hasSeenOnboarding: false,

    login: (name: string, email: string) => set({
        isAuthenticated: true,
        user: {
            id: generateId(),
            name,
            email,
            language: 'en',
            isPremium: false,
            createdAt: new Date().toISOString(),
        },
    }),

    logout: () => set({
        isAuthenticated: false,
        user: null,
        messages: [],
        disclaimerShown: false,
        triageResponses: [],
        currentTriageCategory: null,
        isEmergencyMode: false,
        healthProfile: null,
        medicalRecords: [],
    }),

    setOnboardingSeen: () => set({ hasSeenOnboarding: true }),

    // Chat
    messages: [],
    disclaimerShown: false,
    isTyping: false,

    addMessage: (text: string, sender: 'user' | 'ai', triageCategory?: string, hospitals?: Hospital[]) => set(state => ({
        messages: [
            ...state.messages,
            {
                id: generateId(),
                text,
                sender,
                timestamp: new Date(),
                triageCategory,
                hospitals,
            },
        ],
    })),

    setTyping: (typing: boolean) => set({ isTyping: typing }),

    showDisclaimer: () => set({ disclaimerShown: true }),

    clearMessages: () => set({ messages: [] }),

    // Profile
    language: 'en',

    setLanguage: (lang: 'en' | 'my') => set(state => ({
        language: lang,
        user: state.user ? { ...state.user, language: lang } : null,
    })),

    updateProfile: (updates: Partial<User>) => set(state => ({
        user: state.user ? { ...state.user, ...updates } : null,
    })),

    // Triage
    triageResponses: [],
    currentTriageCategory: null,

    addTriageResponse: (response: TriageResponse) => set(state => ({
        triageResponses: [...state.triageResponses, response],
    })),

    setTriageCategory: (category: SymptomCategory | null) => set({
        currentTriageCategory: category,
    }),

    clearTriage: () => set({
        triageResponses: [],
        currentTriageCategory: null,
    }),

    // Emergency
    isEmergencyMode: false,

    setEmergencyMode: (emergency: boolean) => set({ isEmergencyMode: emergency }),

    // Offline
    isOffline: false,

    setOffline: (offline: boolean) => set({ isOffline: offline }),

    // Cached Hospitals
    cachedHospitals: [],

    setCachedHospitals: (hospitals: Hospital[]) => set({ cachedHospitals: hospitals }),

    // Companion
    healthProfile: null,
    medicalRecords: [],

    setHealthProfile: (profile: HealthProfile | null) => set({ healthProfile: profile }),

    addMedicalRecord: (record: MedicalRecord) => set(state => ({
        medicalRecords: [record, ...state.medicalRecords]
    })),

    setMedicalRecords: (records: MedicalRecord[]) => set({ medicalRecords: records }),
}));

