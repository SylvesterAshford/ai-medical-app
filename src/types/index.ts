// App-wide TypeScript types

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  language: 'en' | 'my';
  isPremium: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
  triageCategory?: string;
  hospitals?: Hospital[];
}

export interface HealthTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface BMIResult {
  bmi: number;
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  color: string;
}

export interface ImageAnalysisResult {
  id: string;
  insights: string[];
  disclaimer: string;
  confidence: number;
  timestamp: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  isBestOffer: boolean;
}

// Hospital types
export interface Hospital {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string;
  type: 'public' | 'private';
  emergency_24hr: boolean;
  distance?: number;
}

// Triage types
export type SymptomCategory =
  | 'chest_pain'
  | 'breathing'
  | 'stroke'
  | 'bleeding'
  | 'fever_child'
  | 'consciousness'
  | 'headache'
  | 'abdominal'
  | 'injury'
  | 'fever';

export interface TriageQuestion {
  id: string;
  symptomCategory: SymptomCategory;
  questionTextMy: string;
  questionTextEn: string;
  key: string;
  isEmergencyIndicator: boolean;
}

export interface TriageResponse {
  questionId: string;
  answer: boolean;
  symptomCategory: SymptomCategory;
  key: string;
}

export interface TriageResult {
  isEmergency: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: SymptomCategory;
  answeredQuestions: number;
  positiveAnswers: number;
}

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  MainTabs: undefined;
  Subscription: undefined;
  HospitalFinder: { emergency?: boolean } | undefined;
  Emergency: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Companion: undefined;
  Analysis: undefined;
  Visits: undefined;
  Profile: undefined;
};

export interface HealthProfile {
  id: string;
  userId: string;
  chronicConditions: string[];
  allergies: string[];
  currentMedications: string[];
  updatedAt: string;
}

export type MedicalRecordType = 'Visit' | 'Lab' | 'Prescription';

export interface MedicalRecord {
  id: string;
  userId: string;
  type: MedicalRecordType;
  summary: string;
  rawTextOcr?: string;
  imageUrl?: string;
  followUpDate?: string;
  createdAt: string;
}
