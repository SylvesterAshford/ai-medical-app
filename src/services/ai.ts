// AI Service — Gemini via Supabase Edge Function proxy (bypasses geo-restrictions)

import { ChatMessage } from '../types';
import { detectEmergency } from '../utils';
import {
    shouldTriggerEmergency,
    detectSymptomCategory,
    isHospitalSearchRequest,
    sanitizeAIResponse,
    BURMESE_DISCLAIMER,
} from '../utils/triageRules';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Edge function endpoint
const GEMINI_PROXY_URL = `${SUPABASE_URL}/functions/v1/gemini-proxy`;

const SYSTEM_PROMPT = `You are a helpful medical AI assistant for Myanmar. You provide general health information and guidance.

IMPORTANT RULES:
1. Always remind users that you are NOT a replacement for professional medical advice.
2. Never diagnose conditions — only provide general information.
3. Never prescribe medications or suggest specific dosages.
4. Never make diagnosis statements like "you have X disease".
5. For emergencies, instruct users to call 192 (Myanmar ambulance) immediately.
6. Be empathetic, clear, and professional.
7. If asked about medications, advise consulting a doctor or pharmacist.
8. Support both English and Burmese languages.
9. When responding in Burmese, use simple and clear language.
10. Keep responses concise but helpful.`;

// Pre-check result type
export interface AIPreCheckResult {
    type: 'normal' | 'emergency' | 'triage' | 'hospital_search';
    category?: string;
    message?: string;
}

// Run safety pre-checks before sending to LLM
export function runPreChecks(userMessage: string): AIPreCheckResult {
    if (shouldTriggerEmergency(userMessage)) {
        return { type: 'emergency' };
    }
    if (isHospitalSearchRequest(userMessage)) {
        return { type: 'hospital_search' };
    }
    const category = detectSymptomCategory(userMessage);
    if (category) {
        return { type: 'triage', category };
    }
    return { type: 'normal' };
}

export async function sendChatMessage(
    messages: ChatMessage[],
    userMessage: string
): Promise<string> {
    // Check for emergency keywords
    if (detectEmergency(userMessage)) {
        return 'အရေးပေါ် အခြေအနေ ဖြစ်နိုင်ပါသည်။ ကျေးဇူးပြု၍ 192 သို့ ချက်ချင်းဖုန်းခေါ်ပါ သို့မဟုတ် အနီးဆုံးဆေးရုံသို့ သွားပါ။\n\nThis may be an emergency. Please call 192 immediately or go to the nearest hospital.' + BURMESE_DISCLAIMER;
    }

    // If no Supabase URL, return a demo response
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        return getDemoResponse(userMessage) + BURMESE_DISCLAIMER;
    }

    try {
        // Build conversation history
        const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

        for (const m of messages) {
            contents.push({
                role: m.sender === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }],
            });
        }

        contents.push({
            role: 'user',
            parts: [{ text: userMessage }],
        });

        // Call Supabase Edge Function (proxy to Gemini)
        const response = await fetch(GEMINI_PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
                contents,
                systemInstruction: {
                    parts: [{ text: SYSTEM_PROMPT }],
                },
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 800,
                    topP: 0.95,
                    topK: 40,
                },
                safetySettings: [
                    {
                        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                        threshold: 'BLOCK_ONLY_HIGH',
                    },
                    {
                        category: 'HARM_CATEGORY_HARASSMENT',
                        threshold: 'BLOCK_ONLY_HIGH',
                    },
                ],
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Gemini proxy error:', JSON.stringify(data));
            throw new Error(data?.error?.message || 'API request failed');
        }

        let aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiResponse) {
            if (data?.candidates?.[0]?.finishReason === 'SAFETY') {
                aiResponse = 'ဤမေးခွန်းကို ဖြေကြားရန် မသင့်လျော်ပါ။ ဆရာဝန်နှင့် တိုက်ရိုက် တိုင်ပင်ပါ။\n\nI cannot answer this question. Please consult a doctor directly.';
            } else {
                aiResponse = 'I apologize, I could not process your request. Please try again.';
            }
        }

        aiResponse = sanitizeAIResponse(aiResponse);
        return aiResponse + BURMESE_DISCLAIMER;
    } catch (error) {
        console.error('AI proxy error:', error);
        return 'I apologize, there was an error processing your request. Please check your connection and try again.' + BURMESE_DISCLAIMER;
    }
}

export async function analyzeImage(imageUri: string): Promise<{
    insights: string[];
    disclaimer: string;
}> {
    return {
        insights: [
            'The image has been received for analysis.',
            'Based on visual assessment, this appears to be a dermatological image.',
            'Recommended: Consult with a dermatologist for a professional evaluation.',
            'Monitor for any changes in size, color, or shape.',
        ],
        disclaimer: 'This AI analysis is for informational purposes only and should NOT be used as a medical diagnosis. Always consult a qualified healthcare professional for proper evaluation and treatment.\n\nဒီ AI သည် ဆရာဝန်မဟုတ်ပါ။ အရေးပေါ် လက္ခဏာများရှိပါက ဆေးရုံသို့ ချက်ချင်းသွားပါ။',
    };
}

function getDemoResponse(message: string): string {
    const lower = message.toLowerCase();

    if (lower.includes('headache') || lower.includes('head pain') || lower.includes('ခေါင်းကိုက်')) {
        return 'Headaches can be caused by many factors including stress, dehydration, lack of sleep, or eye strain. Here are some general tips:\n\n• Stay hydrated — drink plenty of water\n• Rest in a quiet, dark room\n• Apply a cold or warm compress\n• Practice relaxation techniques\n\nIf headaches are severe, persistent, or accompanied by other symptoms like vision changes or fever, please consult a doctor promptly.\n\n⚕️ *This is general information only, not medical advice.*';
    }

    if (lower.includes('fever') || lower.includes('temperature') || lower.includes('ဖျား')) {
        return 'A fever is typically a sign that your body is fighting an infection. General guidelines:\n\n• Rest and stay hydrated\n• A temperature above 38°C (100.4°F) is considered a fever\n• Over-the-counter medications like paracetamol may help\n• Seek medical attention if fever persists beyond 3 days\n\n⚕️ *Please consult a healthcare professional for proper evaluation.*';
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('မင်္ဂလာ')) {
        return 'Hello! 👋 I\'m your AI health assistant. I can help you with general health questions, provide wellness tips, and guide you to appropriate care.\n\nHow can I help you today?\n\n⚕️ *Remember: I provide general health information only, not medical diagnoses.*';
    }

    return 'Thank you for your question. I\'m here to help with general health information.\n\nI can assist you with:\n• General health questions\n• Wellness and lifestyle tips\n• Understanding common symptoms\n• Guidance on when to seek medical care\n• Finding nearby hospitals\n\nCould you provide more details about what you\'d like to know?\n\n⚕️ *This is general information only, not medical advice. Always consult a healthcare professional for personal medical concerns.*';
}
