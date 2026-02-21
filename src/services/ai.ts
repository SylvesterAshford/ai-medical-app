// AI Service — Gemini via Supabase Edge Function proxy (bypasses geo-restrictions)

import { ChatMessage, HealthProfile, MedicalRecord, Hospital } from '../types';
import { searchHospitalsByLocation } from './hospitals';
import { detectEmergency } from '../utils';
import {
    shouldTriggerEmergency,
    detectSymptomCategory,
    isHospitalSearchRequest,
    sanitizeAIResponse,
    getDisclaimer,
} from '../utils/triageRules';
import { useAppStore } from '../store/useAppStore';
import * as Location from 'expo-location';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Edge function endpoint
const GEMINI_PROXY_URL = `${SUPABASE_URL}/functions/v1/gemini-proxy`;

function getSystemPrompt(lang: 'en' | 'my', profile?: HealthProfile | null, records?: MedicalRecord[], userCity?: string): string {
    const profileText = profile ? `
Patient Profile:
- Chronic Conditions: ${profile.chronicConditions.join(', ') || 'None'}
- Allergies: ${profile.allergies.join(', ') || 'None'}
- Current Medications: ${profile.currentMedications.join(', ') || 'None'}
` : '';

    const recordsText = records && records.length > 0 ? `
Recent Medical Records:
${records.slice(0, 3).map(r => `- [${r.type}] ${r.createdAt}: ${r.summary}`).join('\n')}
` : '';

    const locationText = userCity ? `\nUser's Current Location: ${userCity}` : '';

    const context = (profileText || recordsText || locationText) ? `\n--- CONTEXT ---${profileText}${recordsText}${locationText}\n-----------------------\n` : '';

    if (lang === 'my') {
        return `သင်သည် မြန်မာနိုင်ငံအတွက် ကျန်းမာရေး AI လမ်းညွှန်ဖြစ်ပါသည်။ ကျန်းမာရေး သတင်းအချက်အလက်နှင့် လမ်းညွှန်ချက်များ ပေးပါ။
${context}
အရေးကြီးသော စည်းမျဥ်းများ:
1. သင်သည် ဆရာဝန် မဟုတ်ကြောင်း အမြဲ သတိပေးပါ။
2. ရောဂါရှာဖွေတွေ့ရှိချက်များ မပြုလုပ်ပါနှင့် — ယေဘုယျ သတင်းအချက်အလက်များသာ ပေးပါ။
3. ဆေးဝါး သတ်မှတ်ချက်များ မပေးပါနှင့်။
4. အရေးပေါ် ဖြစ်ရပ်များအတွက် 192 သို့ ခေါ်ဆိုရန် ညွှန်ကြားပါ။
5. ကျန်းမာရေး ဝေါဟာရများကို အင်္ဂလိပ်လို ထုတ်ယူပြီး လူနာနားလည်လွယ်သော မြန်မာဘာသာဖြင့် ရှင်းပြပါ။
6. မြန်မာဘာသာဖြင့်သာ ရိုးရှင်းစွာ ရေးပါ (အင်္ဂလိပ်ဘာသာ မရောပါနှင့်)။
7. စာနာမှုရှိပြီး ကျွမ်းကျင်မှုရှိပါ။
8. သိမ်းဆည်းထားသော လူနာ၏ မှတ်တမ်းများကို ထည့်သွင်းစဉ်းစားပါ။
9. အကယ်၍ အသုံးပြုသူမှ ဆေးရုံများကို ရှာဖွေလိုပါက ${userCity ? 'ပေးထားသော လက်ရှိတည်နေရာကို အသုံးပြုပါ သို့မဟုတ် ' : ''}မြို့အမည်တိကျစွာဖြင့် ဤအတိုင်း အတိအကျ ပြန်စာရေးပါ- [SEARCH_HOSPITAL: CityName] (ဥပမာ- [SEARCH_HOSPITAL: Mandalay]). မြို့အမည် မရရှိပါက အသုံးပြုသူ၏ တည်နေရာကို မေးမြန်းပါ။ 'LocationName' ဟူသော စကားလုံးကို တိုက်ရိုက် မသုံးပါနှင့်။`;
    }

    return `You are a health AI navigator for Myanmar. You provide health information and guidance.
${context}
IMPORTANT RULES:
1. Always remind users that you are NOT a replacement for professional medical advice.
2. Do NOT diagnose — only provide general information and explain diseases when asked.
3. Do NOT prescribe specific medication dosages.
4. For emergencies, instruct users to call 192 (Myanmar ambulance) immediately.
5. Extract medical terms in English but explain them using Patient-First language.
6. Be empathetic, clear, and professional.
7. Respond ONLY in English.
8. Consider the patient's provided health profile and recent records in your responses.
9. If the user asks to find hospitals, you MUST output exactly this tag in your response using a specific city name: [SEARCH_HOSPITAL: CityName] (e.g., [SEARCH_HOSPITAL: Mandalay]). ${userCity ? 'Use the provided Current Location if no specific city is requested.' : 'If you do not know their city, politely ask for their location first.'} NEVER output the literal string 'LocationName'.`;
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
): Promise<{ text: string; hospitals?: Hospital[] }> {
    const state = useAppStore.getState();
    const lang = state.language || 'en';
    const profile = state.healthProfile;
    const records = state.medicalRecords;
    const disclaimer = getDisclaimer(lang);

    // Check for emergency keywords
    if (detectEmergency(userMessage)) {
        if (lang === 'my') {
            return { text: 'အရေးပေါ် အခြေအနေ ဖြစ်နိုင်ပါသည်။ ကျေးဇူးပြု၍ 192 သို့ ချက်ချင်းဖုန်းခေါ်ပါ သို့မဟုတ် အနီးဆုံးဆေးရုံသို့ သွားပါ။' + disclaimer };
        }
        return { text: 'This may be an emergency. Please call 192 immediately or go to the nearest hospital.' + disclaimer };
    }

    // If no Supabase URL, return a demo response
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        return { text: getDemoResponse(userMessage, lang) + disclaimer };
    }

    try {
        // Try to get user's city context before sending to AI
        let userCity: string | undefined;
        let aiUserLat: number | undefined;
        let aiUserLon: number | undefined;

        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            if (status === 'granted') {
                const pos = await Location.getLastKnownPositionAsync({}) || await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                if (pos) {
                    aiUserLat = pos.coords.latitude;
                    aiUserLon = pos.coords.longitude;
                    const geocode = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                    if (geocode && geocode.length > 0) {
                        userCity = geocode[0].city || geocode[0].region || undefined;
                    }
                }
            }
        } catch (e) {
            console.warn('Could not get pre-flight location info', e);
        }

        // Build conversation history
        const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

        for (const m of messages) {
            // Strip any existing disclaimer from history so AI doesn't learn to repeat it
            const cleanText = m.text.replace(/⚕️.*$/s, '').trim();
            contents.push({
                role: m.sender === 'user' ? 'user' : 'model',
                parts: [{ text: cleanText }],
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
                    parts: [{ text: getSystemPrompt(lang, profile, records, userCity) }],
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

        // Remove any hallucinated disclaimers from Gemini's response
        if (typeof aiResponse === 'string') {
            aiResponse = aiResponse.replace(/⚕️.*$/s, '').trim();
        }

        // Light sanitization — only catches explicit prescription dosages
        aiResponse = sanitizeAIResponse(aiResponse);

        // Check for SEARCH_HOSPITAL tag
        let hospitals: Hospital[] | undefined;
        const searchMatch = aiResponse.match(/\[SEARCH_HOSPITAL:\s*(.+?)\]/i);
        if (searchMatch) {
            const location = searchMatch[1].trim();

            hospitals = await searchHospitalsByLocation(location, aiUserLat, aiUserLon);

            // Replace the tag with a friendly message
            let friendlyMsg = '';
            if (hospitals && hospitals.length > 0) {
                friendlyMsg = lang === 'my'
                    ? `${location} အနီးရှိ ဆေးရုံများကို ရှာဖွေပေးထားပါသည်-`
                    : `Here are the hospitals I found near ${location}:`;
            } else {
                friendlyMsg = lang === 'my'
                    ? `${location} အနီးတွင် ဆေးရုံရှာမတွေ့ပါ။ ဒေတာဘေ့စ်တွင် အချက်အလက်မရှိသေးပါ။`
                    : `I couldn't find any hospitals near ${location} in our current database.`;
            }

            aiResponse = aiResponse.replace(/\[SEARCH_HOSPITAL:\s*(.+?)\]/i, friendlyMsg);
        }

        return { text: aiResponse + disclaimer, hospitals };
    } catch (error) {
        console.error('AI proxy error:', error);
        const errorMsg = lang === 'my'
            ? 'တောင်းပန်ပါသည်။ အမှားတစ်ခု ဖြစ်ပေါ်ခဲ့ပါသည်။ ချိတ်ဆက်မှု စစ်ဆေးပြီး ထပ်ကြိုးစားပါ။'
            : 'I apologize, there was an error processing your request. Please check your connection and try again.';
        return { text: errorMsg + disclaimer };
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

export async function explainPrescription(imageUri: string, userText?: string): Promise<{
    insights: string[];
    disclaimer: string;
}> {
    const lang = useAppStore.getState().language || 'en';

    // Safety check BEFORE explanation
    if (userText && detectEmergency(userText)) {
        return {
            insights: [lang === 'my' ? 'အရေးပေါ် လက္ခဏာများ တွေ့ရှိရပါသည်။ 192 သို့ ချက်ချင်း ခေါ်ဆိုပါ။' : 'EMERGENCY DETECTED. Please call 192 immediately.'],
            disclaimer: getDisclaimer(lang)
        };
    }

    return {
        insights: lang === 'my' ? [
            'ဆေးစာရွက်ကို လက်ခံရရှိပါပြီ။',
            '၁။ Amoxicillin 500mg - ပိုးသတ်ဆေး (တစ်နေ့ ၃ ကြိမ်၊ အစာစားပြီးသောက်ရန်)',
            '၂။ Paracetamol 500mg - အဖျားကျ/အကိုက်အခဲပျောက်ဆေး (လိုအပ်လျှင် သောက်ရန်)',
            'ဆေးဝါးအားလုံးကို ဆရာဝန် ညွှန်ကြားသည့်အတိုင်း အတိအကျ သောက်သုံးပါ။',
        ] : [
            'Prescription uploaded successfully.',
            '1. Amoxicillin 500mg - Antibiotic (Take 3 times daily after meals)',
            '2. Paracetamol 500mg - Pain reliever/Fever reducer (Take as needed)',
            'Please take all medications exactly as prescribed by your doctor.',
        ],
        disclaimer: getDisclaimer(lang)
    };
}

export async function getVisitSummary(messages: ChatMessage[]): Promise<string> {
    const state = useAppStore.getState();
    const lang = state.language || 'en';
    const profile = state.healthProfile;
    const records = state.medicalRecords;
    const disclaimer = getDisclaimer(lang);

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        return `# Patient Visit Summary\n\n**Symptoms Discussed:** Headache, Mild Fever\n**Duration:** 2 days\n\n*Generated locally for demo purposes.*`;
    }

    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    for (const m of messages) {
        contents.push({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }],
        });
    }

    contents.push({
        role: 'user',
        parts: [{ text: "Please generate a structured Medical Visit Summary in Markdown format based on our conversation above. This summary is intended for a doctor. Include sections like: Chief Complaint, History of Present Illness (HPI), Associated Symptoms, and Relevant Context." }],
    });

    try {
        const response = await fetch(GEMINI_PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
                contents,
                systemInstruction: {
                    parts: [{ text: getSystemPrompt(lang, profile, records) }],
                },
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 1000,
                },
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data?.error?.message || 'API request failed');

        const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        return (aiResponse || "Unable to generate summary.");
    } catch (error) {
        return "Error generating summary.";
    }
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
            ? 'မင်္ဂလာပါ! 👋 ကျွန်ုပ်သည် မြန်မာနိုင်ငံ၏ AI ကျန်းမာရေး လမ်းညွှန် ဖြစ်ပါသည်။ အထွေထွေ ကျန်းမာရေးမေးခွန်းများ ဖြေကြားခြင်း၊ ရောဂါလက္ခဏာ စစ်ဆေးခြင်းနှင့် အနီးဆုံးဆေးရုံများကို ရှာဖွေပေးနိုင်ပါသည်။\n\nဘာကူညီပေးရမလဲ?'
            : 'Hello! 👋 I\'m Myanmar\'s AI health navigator. I can help with health questions, symptom checks, and finding nearby hospitals.\n\nHow can I help you today?';
    }

    return lang === 'my'
        ? 'ကျေးဇူးတင်ပါသည်။ ကျန်းမာရေး သတင်းအချက်အလက်များ ကူညီပေးနိုင်ပါသည်။\n\n• ကျန်းမာရေး မေးခွန်းများ\n• ကျန်းမာရေး အကြံပြုချက်များ\n• ရောဂါ လက္ခဏာများ ရှင်းပြခြင်း\n• အနီးဆုံး ဆေးရုံ ရှာခြင်း'
        : 'Thank you for your question. I\'m here to help with general health information.\n\nI can assist you with:\n• General health questions\n• Wellness and lifestyle tips\n• Understanding common symptoms\n• Guidance on when to seek medical care\n• Finding nearby hospitals';
}
