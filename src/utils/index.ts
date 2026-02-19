// Utility helpers

import { BMIResult } from '../types';

export function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
}

export function calculateBMI(weightKg: number, heightCm: number): BMIResult {
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    const rounded = Math.round(bmi * 10) / 10;

    if (rounded < 18.5) {
        return { bmi: rounded, category: 'Underweight', color: '#74B9FF' };
    } else if (rounded < 25) {
        return { bmi: rounded, category: 'Normal', color: '#00B894' };
    } else if (rounded < 30) {
        return { bmi: rounded, category: 'Overweight', color: '#FDCB6E' };
    } else {
        return { bmi: rounded, category: 'Obese', color: '#E17055' };
    }
}

export function formatTimestamp(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function detectEmergency(text: string): boolean {
    const emergencyKeywords = [
        'suicide', 'kill myself', 'want to die', 'heart attack',
        'chest pain', 'can\'t breathe', 'stroke', 'bleeding heavily',
        'unconscious', 'overdose', 'poisoning', 'emergency',
        'severe pain', 'choking',
    ];
    const lower = text.toLowerCase();
    return emergencyKeywords.some(keyword => lower.includes(keyword));
}

export const MEDICAL_DISCLAIMER =
    'This AI assistant provides general health information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. In case of emergency, call your local emergency services immediately.';

export const EMERGENCY_MESSAGE =
    '⚠️ It sounds like you may be experiencing a medical emergency. Please call emergency services (911 / 999) immediately or go to the nearest emergency room. This AI cannot provide emergency medical assistance.';
