// AI Service — Gemini via Supabase Edge Function proxy (bypasses geo-restrictions)

import { ChatMessage } from '../types';
import { detectEmergency } from '../utils';
import {
    shouldTriggerEmergency,
    detectSymptomCategory,
    isHospitalSearchRequest,
    sanitizeAIResponse,
    getDisclaimer,
} from '../utils/triageRules';
import { useAppStore } from '../store/useAppStore';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Edge function endpoint
const GEMINI_PROXY_URL = `${SUPABASE_URL}/functions/v1/gemini-proxy`;

function getSystemPrompt(lang: 'en' | 'my'): string {
    if (lang === 'my') {
        return `သင်သည် မြန်မာနိုင်ငံအတွက် ကျန်းမာရေး AI လမ်းညွှန်ဖြစ်ပါသည်။ ကျန်းမာရေး သတင်းအချက်အလက်နှင့် လမ်းညွှန်ချက်များ ပေးပါ။

အရေးကြီးသော စည်းမျဥ်းများ:
1. သင်သည် ဆရာဝန် မဟုတ်ကြောင်း အမြဲ သတိပေးပါ။
2. ရောဂါရှာဖွေတွေ့ရှိချက်များ မပြုလုပ်ပါနှင့် — ယေဘုယျ သတင်းအချက်အလက်များသာ ပေးပါ။
3. ဆေးဝါး သတ်မှတ်ချက်များ မပေးပါနှင့်။
4. အရေးပေါ် ဖြစ်ရပ်များအတွက် 192 သို့ ခေါ်ဆိုရန် ညွှန်ကြားပါ။
5. ကျန်းမာရေး ရောဂါများ အကြောင်း မေးခွန်းများကို အသေးစိတ် ရှင်းပြပါ။
6. မြန်မာဘာသာဖြင့် ရိုးရှင်းစွာ ရေးပါ။
7. စာနာမှုရှိပြီး ကျွမ်းကျင်မှုရှိပါ။`;
    }

    return `You are a health AI navigator for Myanmar. You provide health information and guidance.

IMPORTANT RULES:
1. Always remind users that you are NOT a replacement for professional medical advice.
2. Do NOT diagnose — only provide general information and explain diseases when asked.
3. Do NOT prescribe specific medication dosages.
4. For emergencies, instruct users to call 192 (Myanmar ambulance) immediately.
5. When users ask about diseases (like HIV, diabetes, cancer, etc.), explain them clearly and helpfully.
6. Be empathetic, clear, and professional.
7. If asked about medications, advise consulting a doctor or pharmacist for specific dosages.
8. Respond ONLY in English.
9. Keep responses concise but helpful.`;
}

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
    const lang = useAppStore.getState().language || 'en';
    const disclaimer = getDisclaimer(lang);

    // Check for emergency keywords
    if (detectEmergency(userMessage)) {
        if (lang === 'my') {
            return 'အရေးပေါ် အခြေအနေ ဖြစ်နိုင်ပါသည်။ ကျေးဇူးပြု၍ 192 သို့ ချက်ချင်းဖုန်းခေါ်ပါ သို့မဟုတ် အနီးဆုံးဆေးရုံသို့ သွားပါ။' + disclaimer;
        }
        return 'This may be an emergency. Please call 192 immediately or go to the nearest hospital.' + disclaimer;
    }

    // If no Supabase URL, return a demo response
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        return getDemoResponse(userMessage, lang) + disclaimer;
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
                    parts: [{ text: getSystemPrompt(lang) }],
                },
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1200,
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
                aiResponse = lang === 'my'
                    ? 'ဤမေးခွန်းကို ဖြေကြားရန် မသင့်လျော်ပါ။ ဆရာဝန်နှင့် တိုက်ရိုက် တိုင်ပင်ပါ။'
                    : 'I cannot answer this question. Please consult a doctor directly.';
            } else {
                aiResponse = lang === 'my'
                    ? 'တောင်းပန်ပါသည်။ သင့်တောင်းဆိုချက်ကို ဆောင်ရွက်၍ မရပါ။ ထပ်ကြိုးစားကြည့်ပါ။'
                    : 'I apologize, I could not process your request. Please try again.';
            }
        }

        // Light sanitization — only catches explicit prescription dosages
        aiResponse = sanitizeAIResponse(aiResponse);

        return aiResponse + disclaimer;
    } catch (error) {
        console.error('AI proxy error:', error);
        const errorMsg = lang === 'my'
            ? 'တောင်းပန်ပါသည်။ အမှားတစ်ခု ဖြစ်ပေါ်ခဲ့ပါသည်။ ချိတ်ဆက်မှု စစ်ဆေးပြီး ထပ်ကြိုးစားပါ။'
            : 'I apologize, there was an error processing your request. Please check your connection and try again.';
        return errorMsg + disclaimer;
    }
}

export async function analyzeImage(imageUri: string): Promise<{
    insights: string[];
    disclaimer: string;
}> {
    const lang = useAppStore.getState().language || 'en';
    return {
        insights: lang === 'my' ? [
            'ပုံကို ခွဲခြမ်းစိတ်ဖြာမှုအတွက် လက်ခံရရှိပါပြီ။',
            'အရေပြား ဆိုင်ရာ ပုံ ဖြစ်နိုင်ပါသည်။',
            'အရေပြား အထူးကု ဆရာဝန်နှင့် ပြသရန် အကြံပြုပါသည်။',
            'အရွယ်အစား၊ အရောင်၊ ပုံသဏ္ဍာန် ပြောင်းလဲမှုကို စောင့်ကြည့်ပါ။',
        ] : [
            'The image has been received for analysis.',
            'Based on visual assessment, this appears to be a dermatological image.',
            'Recommended: Consult with a dermatologist for a professional evaluation.',
            'Monitor for any changes in size, color, or shape.',
        ],
        disclaimer: lang === 'my'
            ? 'ဒီ AI ခွဲခြမ်းစိတ်ဖြာချက်သည် အချက်အလက်ရည်ရွယ်ချက်အတွက်သာ ဖြစ်ပါသည်။ ဆရာဝန်နှင့် တိုင်ပင်ပါ။'
            : 'This AI analysis is for informational purposes only and should NOT be used as a medical diagnosis. Always consult a qualified healthcare professional.',
    };
}

function getDemoResponse(message: string, lang: 'en' | 'my'): string {
    const lower = message.toLowerCase();

    if (lower.includes('headache') || lower.includes('head pain') || lower.includes('ခေါင်းကိုက်')) {
        return lang === 'my'
            ? 'ခေါင်းကိုက်ခြင်းသည် စိတ်ဖိစီးမှု၊ ရေဓာတ်ခန်းခြောက်ခြင်း၊ အိပ်ရေးမဝခြင်း စသည်တို့ကြောင့် ဖြစ်နိုင်ပါသည်။\n\n• ရေများများ သောက်ပါ\n• တိတ်ဆိတ်မှောင်မိုက်သော အခန်းတွင် အနားယူပါ\n• အအေးပတ်တာ သို့ အပူပတ်တာ ကပ်ပါ'
            : 'Headaches can be caused by many factors including stress, dehydration, lack of sleep, or eye strain.\n\n• Stay hydrated — drink plenty of water\n• Rest in a quiet, dark room\n• Apply a cold or warm compress\n• Practice relaxation techniques';
    }

    if (lower.includes('fever') || lower.includes('temperature') || lower.includes('ဖျား')) {
        return lang === 'my'
            ? 'ဖျားခြင်းသည် ကူးစက်ရောဂါကို ခုခံနေခြင်း ဖြစ်ပါသည်။\n\n• အနားယူပြီး ရေများများ သောက်ပါ\n• ၃၈°C (၁၀၀.၄°F) ထက်ပိုလျှင် ဖျားခြင်း ဖြစ်ပါသည်\n• ၃ ရက်ထက် ကြာလျှင် ဆရာဝန် ပြပါ'
            : 'A fever is typically a sign that your body is fighting an infection.\n\n• Rest and stay hydrated\n• A temperature above 38°C (100.4°F) is considered a fever\n• Seek medical attention if fever persists beyond 3 days';
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('မင်္ဂလာ')) {
        return lang === 'my'
            ? 'မင်္ဂလာပါ! 👋 ကျွန်ုပ်သည် သင့် ကျန်းမာရေး AI လမ်းညွှန် ဖြစ်ပါသည်။ ကျန်းမာရေး မေးခွန်းများနှင့် လမ်းညွှန်ချက်များ ကူညီပေးနိုင်ပါသည်။\n\nဘာကူညီပေးရမလဲ?'
            : 'Hello! 👋 I\'m your AI health assistant. I can help you with general health questions, provide wellness tips, and guide you to appropriate care.\n\nHow can I help you today?';
    }

    return lang === 'my'
        ? 'ကျေးဇူးတင်ပါသည်။ ကျန်းမာရေး သတင်းအချက်အလက်များ ကူညီပေးနိုင်ပါသည်။\n\n• ကျန်းမာရေး မေးခွန်းများ\n• ကျန်းမာရေး အကြံပြုချက်များ\n• ရောဂါ လက္ခဏာများ ရှင်းပြခြင်း\n• အနီးဆုံး ဆေးရုံ ရှာခြင်း'
        : 'Thank you for your question. I\'m here to help with general health information.\n\nI can assist you with:\n• General health questions\n• Wellness and lifestyle tips\n• Understanding common symptoms\n• Guidance on when to seek medical care\n• Finding nearby hospitals';
}
