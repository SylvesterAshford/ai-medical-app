// Triage Rule Engine — Structured keyword + pattern detection
// Not LLM-dependent. Provides deterministic emergency detection.

import { SymptomCategory, TriageQuestion, TriageResponse, TriageResult } from '../types';

// ─── Emergency Keywords (Burmese + English) ────────────────────────────

const EMERGENCY_KEYWORDS: { keywords: string[]; category: SymptomCategory }[] = [
    {
        category: 'chest_pain',
        keywords: [
            'chest pain', 'heart attack', 'ရင်ဘတ်နာ', 'နှလုံးအောင့်',
            'ရင်ဘတ်ထဲတွင်နာ', 'နှလုံးထိခိုက်',
        ],
    },
    {
        category: 'breathing',
        keywords: [
            'can\'t breathe', 'difficulty breathing', 'shortness of breath',
            'not breathing', 'choking', 'asthma attack',
            'အသက်ရှူမရ', 'အသက်ရှူကြပ်', 'အသက်ရှူခက်ခဲ',
        ],
    },
    {
        category: 'stroke',
        keywords: [
            'stroke', 'face drooping', 'arm weakness', 'speech difficulty',
            'slurred speech', 'paralysis', 'one side numb',
            'လေဖြတ်', 'မျက်နှာတစ်ဖက်ကျ', 'စကားမပြော',
        ],
    },
    {
        category: 'bleeding',
        keywords: [
            'severe bleeding', 'bleeding heavily', 'won\'t stop bleeding',
            'hemorrhage', 'blood loss',
            'သွေးထွက်များ', 'သွေးအများကြီးထွက်', 'သွေးမတိတ်',
        ],
    },
    {
        category: 'fever_child',
        keywords: [
            'high fever child', 'baby fever', 'infant fever', 'child high temperature',
            'child convulsion', 'febrile seizure',
            'ကလေးဖျားခြင်း', 'ကလေးအဖျား', 'ကလေးတက်ခြင်း',
        ],
    },
    {
        category: 'consciousness',
        keywords: [
            'unconscious', 'loss of consciousness', 'fainted', 'passed out',
            'not responding', 'unresponsive', 'collapsed', 'seizure', 'convulsion',
            'သတိလစ်', 'မသိမသာ', 'မေ့သွား', 'အသိပျက်',
        ],
    },
];

// ─── Symptom Detection Keywords (non-emergency triggers triage questions) ──

const SYMPTOM_KEYWORDS: { keywords: string[]; category: SymptomCategory }[] = [
    ...EMERGENCY_KEYWORDS,
    {
        category: 'headache',
        keywords: [
            'headache', 'head pain', 'migraine', 'head hurts',
            'ခေါင်းကိုက်', 'ခေါင်းနာ', 'ခေါင်းတစ်ခြမ်းကိုက်',
        ],
    },
    {
        category: 'abdominal',
        keywords: [
            'stomach pain', 'abdominal pain', 'belly pain', 'stomach ache',
            'ache in abdomen', 'cramps', 'ဗိုက်နာ', 'ဝမ်းနာ', 'အစာအိမ်နာ',
        ],
    },
    {
        category: 'injury',
        keywords: [
            'broken bone', 'fracture', 'twisted ankle', 'sprain', 'wound',
            'cut', 'burn', 'fall', 'accident', 'injured',
            'အရိုးကျိုး', 'ဒဏ်ရာ', 'ပြုတ်ကျ', 'မီးလောင်',
        ],
    },
    {
        category: 'fever',
        keywords: [
            'fever', 'high temperature', 'feeling hot', 'chills',
            'ဖျား', 'ကိုယ်ပူ', 'ချမ်းတုန်',
        ],
    },
];

// ─── Hospital Search Detection ─────────────────────────────────────────

const HOSPITAL_SEARCH_KEYWORDS = [
    'အနားက ဆေးရုံ', 'အနီးဆုံး ဆေးရုံ', 'အနီးဆုံးဆေးရုံ',
    'hospital near me', 'nearest hospital', 'closest hospital',
    'find hospital near me', 'hospitals around me', 'nearest to me', 'closest to me'
];

// ─── Blocked Content Patterns ──────────────────────────────────────────

const BLOCKED_PATTERNS = [
    // Prescription patterns
    /prescri(?:be|ption)\s+(?:you|the patient)/i,
    /take\s+\d+\s*(?:mg|ml|tablet|pill|capsule)/i,
    /dosage\s*(?:is|:|\s)\s*\d+/i,
    /\d+\s*(?:mg|ml)\s+(?:once|twice|three times|daily)/i,
    // Diagnosis patterns
    /you\s+(?:have|are\s+(?:suffering|diagnosed))\s+(?:with\s+)?[A-Z]/i,
    /(?:my|your)\s+diagnosis\s+is/i,
    /i\s+diagnose\s+(?:you|this)/i,
];

// ─── Triage Question Sets ──────────────────────────────────────────────

export const TRIAGE_QUESTION_SETS: Record<string, TriageQuestion[]> = {
    chest_pain: [
        {
            id: 'cp_1', symptomCategory: 'chest_pain',
            questionTextMy: 'ပြင်းထန်သော နာကျင်မှု ရှိပါသလား?',
            questionTextEn: 'Is the pain severe?',
            key: 'severe_pain', isEmergencyIndicator: true,
        },
        {
            id: 'cp_2', symptomCategory: 'chest_pain',
            questionTextMy: 'ခွေးပြစ် ထွက်နေပါသလား?',
            questionTextEn: 'Are you sweating?',
            key: 'sweating', isEmergencyIndicator: true,
        },
        {
            id: 'cp_3', symptomCategory: 'chest_pain',
            questionTextMy: 'နာကျင်မှု လက်သို့ ပျံ့နှံ့နေပါသလား?',
            questionTextEn: 'Is the pain spreading to your arm?',
            key: 'arm_spread', isEmergencyIndicator: true,
        },
        {
            id: 'cp_4', symptomCategory: 'chest_pain',
            questionTextMy: 'အသက်ရှူ ခက်ခဲနေပါသလား?',
            questionTextEn: 'Are you having difficulty breathing?',
            key: 'breathing_difficulty', isEmergencyIndicator: true,
        },
    ],
    breathing: [
        {
            id: 'br_1', symptomCategory: 'breathing',
            questionTextMy: 'ရုတ်တရက် စတင်ခဲ့ပါသလား?',
            questionTextEn: 'Did it start suddenly?',
            key: 'sudden_onset', isEmergencyIndicator: true,
        },
        {
            id: 'br_2', symptomCategory: 'breathing',
            questionTextMy: 'နှုတ်ခမ်း သို့ လက်သည်းပြာ နေပါသလား?',
            questionTextEn: 'Are your lips or fingernails turning blue?',
            key: 'cyanosis', isEmergencyIndicator: true,
        },
        {
            id: 'br_3', symptomCategory: 'breathing',
            questionTextMy: 'ရင်ဘတ်တွင် နာကျင်မှု ရှိပါသလား?',
            questionTextEn: 'Do you have chest pain?',
            key: 'chest_pain_with_breathing', isEmergencyIndicator: true,
        },
    ],
    fever: [
        {
            id: 'fv_1', symptomCategory: 'fever',
            questionTextMy: 'အပူချိန် ၃၉°C (၁၀၂°F) ထက် များပါသလား?',
            questionTextEn: 'Is your temperature above 39°C (102°F)?',
            key: 'high_temp', isEmergencyIndicator: false,
        },
        {
            id: 'fv_2', symptomCategory: 'fever',
            questionTextMy: '၃ ရက်ထက် ပိုကြာ ဖျားနေပါသလား?',
            questionTextEn: 'Have you had a fever for more than 3 days?',
            key: 'prolonged_fever', isEmergencyIndicator: false,
        },
        {
            id: 'fv_3', symptomCategory: 'fever',
            questionTextMy: 'အော့အန် သို့ ဝမ်းလျှော ရှိပါသလား?',
            questionTextEn: 'Do you have vomiting or diarrhea?',
            key: 'gi_symptoms', isEmergencyIndicator: false,
        },
        {
            id: 'fv_4', symptomCategory: 'fever',
            questionTextMy: 'အသက်ရှူ ခက်ခဲနေပါသလား?',
            questionTextEn: 'Are you having difficulty breathing?',
            key: 'fever_breathing', isEmergencyIndicator: true,
        },
    ],
    headache: [
        {
            id: 'hd_1', symptomCategory: 'headache',
            questionTextMy: 'ရုတ်တရက် ပြင်းထန်စွာ ခေါင်းကိုက်လာပါသလား?',
            questionTextEn: 'Did the headache come on suddenly and severely?',
            key: 'sudden_severe', isEmergencyIndicator: true,
        },
        {
            id: 'hd_2', symptomCategory: 'headache',
            questionTextMy: 'လည်ပင်း ခိုင်မာနေပါသလား?',
            questionTextEn: 'Do you have a stiff neck?',
            key: 'stiff_neck', isEmergencyIndicator: true,
        },
        {
            id: 'hd_3', symptomCategory: 'headache',
            questionTextMy: 'အမြင်အာရုံ ပြောင်းလဲမှု ရှိပါသလား?',
            questionTextEn: 'Are you experiencing vision changes?',
            key: 'vision_changes', isEmergencyIndicator: true,
        },
        {
            id: 'hd_4', symptomCategory: 'headache',
            questionTextMy: 'အော့အန် ရှိပါသလား?',
            questionTextEn: 'Are you vomiting?',
            key: 'headache_vomiting', isEmergencyIndicator: false,
        },
    ],
    abdominal: [
        {
            id: 'ab_1', symptomCategory: 'abdominal',
            questionTextMy: 'ပြင်းထန်သော နာကျင်မှု ရှိပါသလား?',
            questionTextEn: 'Is the pain severe?',
            key: 'severe_abdominal', isEmergencyIndicator: true,
        },
        {
            id: 'ab_2', symptomCategory: 'abdominal',
            questionTextMy: 'သွေးအန် သို့ သွေးဝမ်းသွား ရှိပါသလား?',
            questionTextEn: 'Are you vomiting blood or passing blood in stool?',
            key: 'blood_gi', isEmergencyIndicator: true,
        },
        {
            id: 'ab_3', symptomCategory: 'abdominal',
            questionTextMy: 'ဖျား နေပါသလား?',
            questionTextEn: 'Do you have a fever?',
            key: 'abdominal_fever', isEmergencyIndicator: false,
        },
        {
            id: 'ab_4', symptomCategory: 'abdominal',
            questionTextMy: '၂၄ နာရီ ထက်ပို ကြာပါပြီလား?',
            questionTextEn: 'Has it lasted more than 24 hours?',
            key: 'duration_24h', isEmergencyIndicator: false,
        },
    ],
    injury: [
        {
            id: 'in_1', symptomCategory: 'injury',
            questionTextMy: 'အရိုးကျိုး ဟု ထင်ပါသလား?',
            questionTextEn: 'Do you think a bone might be broken?',
            key: 'possible_fracture', isEmergencyIndicator: true,
        },
        {
            id: 'in_2', symptomCategory: 'injury',
            questionTextMy: 'သွေးထွက်များ နေပါသလား?',
            questionTextEn: 'Is there heavy bleeding?',
            key: 'injury_bleeding', isEmergencyIndicator: true,
        },
        {
            id: 'in_3', symptomCategory: 'injury',
            questionTextMy: 'ခေါင်းထိခိုက်ခဲ့ပါသလား?',
            questionTextEn: 'Was your head injured?',
            key: 'head_injury', isEmergencyIndicator: true,
        },
        {
            id: 'in_4', symptomCategory: 'injury',
            questionTextMy: 'ရွေ့လျားရန် ခက်ခဲနေပါသလား?',
            questionTextEn: 'Is it difficult to move?',
            key: 'mobility_issue', isEmergencyIndicator: false,
        },
    ],
    fever_child: [
        {
            id: 'fc_1', symptomCategory: 'fever_child',
            questionTextMy: 'ကလေး အသက် ၃ လ အောက် ဖြစ်ပါသလား?',
            questionTextEn: 'Is the child under 3 months old?',
            key: 'infant_age', isEmergencyIndicator: true,
        },
        {
            id: 'fc_2', symptomCategory: 'fever_child',
            questionTextMy: 'ကလေး တက်ခြင်း ရှိပါသလား?',
            questionTextEn: 'Is the child having convulsions/seizures?',
            key: 'child_seizure', isEmergencyIndicator: true,
        },
        {
            id: 'fc_3', symptomCategory: 'fever_child',
            questionTextMy: 'ကလေး ငိုခြင်း ရပ်တန့်သွားပါသလား?',
            questionTextEn: 'Has the child become unusually quiet/stopped crying?',
            key: 'child_lethargic', isEmergencyIndicator: true,
        },
        {
            id: 'fc_4', symptomCategory: 'fever_child',
            questionTextMy: 'အဖျား ၃၈.၅°C ထက် များပါသလား?',
            questionTextEn: 'Is the temperature above 38.5°C?',
            key: 'child_high_temp', isEmergencyIndicator: false,
        },
    ],
};

// ─── Detection Functions ───────────────────────────────────────────────

export function detectSymptomCategory(text: string): SymptomCategory | null {
    const lower = text.toLowerCase();
    for (const entry of SYMPTOM_KEYWORDS) {
        for (const keyword of entry.keywords) {
            if (lower.includes(keyword.toLowerCase())) {
                return entry.category;
            }
        }
    }
    return null;
}

export function shouldTriggerEmergency(text: string): boolean {
    const lower = text.toLowerCase();
    for (const entry of EMERGENCY_KEYWORDS) {
        for (const keyword of entry.keywords) {
            if (lower.includes(keyword.toLowerCase())) {
                return true;
            }
        }
    }
    return false;
}

export function isHospitalSearchRequest(text: string): boolean {
    const lower = text.toLowerCase();
    return HOSPITAL_SEARCH_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()));
}

export function evaluateTriageResponses(
    responses: TriageResponse[],
    category: SymptomCategory
): TriageResult {
    const categoryResponses = responses.filter(r => r.symptomCategory === category);
    const positiveAnswers = categoryResponses.filter(r => r.answer).length;
    const questions = TRIAGE_QUESTION_SETS[category] || [];

    // Check if any emergency indicator was answered Yes
    const emergencyTriggered = categoryResponses.some(r => {
        const question = questions.find(q => q.id === r.questionId);
        return question?.isEmergencyIndicator && r.answer;
    });

    let severity: TriageResult['severity'] = 'low';
    if (emergencyTriggered) {
        severity = positiveAnswers >= 2 ? 'critical' : 'high';
    } else if (positiveAnswers >= 2) {
        severity = 'medium';
    }

    return {
        isEmergency: emergencyTriggered,
        severity,
        category,
        answeredQuestions: categoryResponses.length,
        positiveAnswers,
    };
}

export function getTriageQuestions(category: SymptomCategory): TriageQuestion[] {
    return TRIAGE_QUESTION_SETS[category] || [];
}

export function containsBlockedContent(text: string): boolean {
    return BLOCKED_PATTERNS.some(pattern => pattern.test(text));
}

export function sanitizeAIResponse(text: string): string {
    // Only block genuinely dangerous content (explicit prescriptions with dosages)
    // Don't block general health information or disease explanations
    const dangerousPatterns = [
        /take\s+\d+\s*(?:mg|ml|tablet|pill|capsule)\s+(?:once|twice|daily|every)/i,
        /dosage\s*(?:is|:)\s*\d+\s*(?:mg|ml)/i,
        /i\s+diagnose\s+you\s+with/i,
    ];

    const hasDangerousContent = dangerousPatterns.some(p => p.test(text));
    if (hasDangerousContent) {
        // Append a note instead of replacing the whole response
        return text + '\n\n⚠️ Note: Please consult a doctor for specific medication dosages and diagnosis.';
    }
    return text;
}

// Language-aware disclaimer
export function getDisclaimer(lang: 'en' | 'my'): string {
    if (lang === 'my') {
        return '\n\n⚕️ ဒီ AI သည် ဆရာဝန်မဟုတ်ပါ။ အရေးပေါ် လက္ခဏာများရှိပါက ဆေးရုံသို့ ချက်ချင်းသွားပါ။';
    }
    return '\n\n⚕️ This AI is not a doctor. If you have emergency symptoms, go to the hospital immediately.';
}

// Myanmar emergency number
export const MYANMAR_EMERGENCY_NUMBER = '192';

