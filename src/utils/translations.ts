// Centralized translations for English and Burmese

export type Language = 'en' | 'my';

const translations = {
    // Tab Bar
    'tab.home': { en: 'Home', my: 'ပင်မ' },
    'tab.tools': { en: 'Tools', my: 'ကိရိယာ' },
    'tab.chat': { en: 'Chat', my: 'ချတ်' },
    'tab.scan': { en: 'Scan', my: 'စကန်' },
    'tab.profile': { en: 'Profile', my: 'ကိုယ်ရေး' },

    // Home Screen
    'home.greeting': { en: 'Hello', my: 'မင်္ဂလာပါ' },
    'home.subtitle': { en: 'How are you feeling today?', my: 'ဒီနေ့ ကျန်းမာရေး ဘယ်လိုရှိပါသလဲ?' },
    'home.quickActions': { en: 'Quick Actions', my: 'အမြန်လုပ်ဆောင်ချက်' },
    'home.chatAI': { en: 'Chat with AI', my: 'AI နှင့် စကားပြော' },
    'home.findHospital': { en: 'Find Hospital', my: 'ဆေးရုံရှာ' },
    'home.healthTools': { en: 'Health Tools', my: 'ကျန်းမာရေးကိရိယာ' },
    'home.emergency': { en: 'Emergency', my: 'အရေးပေါ်' },
    'home.recentChats': { en: 'Recent Conversations', my: 'မကြာသေးမီ စကားပြောမှုများ' },
    'home.noChats': { en: 'No conversations yet', my: 'စကားပြောမှု မရှိသေးပါ' },
    'home.startChat': { en: 'Start a conversation', my: 'စကားပြောရန်' },

    // Chat Screen
    'chat.title': { en: 'AI Health Navigator', my: 'AI ကျန်းမာရေး လမ်းညွှန်' },
    'chat.online': { en: 'Online', my: 'အွန်လိုင်း' },
    'chat.offline': { en: 'Offline', my: 'အော့ဖ်လိုင်း' },
    'chat.typing': { en: 'Typing...', my: 'ရိုက်နေသည်...' },
    'chat.placeholder': { en: 'Message', my: 'မက်ဆေ့ချ်' },
    'chat.offlinePlaceholder': { en: 'Offline — AI chat unavailable', my: 'အော့ဖ်လိုင်း — AI ချတ် မရနိုင်ပါ' },
    'chat.emptyTitle': { en: 'What can I help with?', my: 'ဘာကူညီပေးရမလဲ?' },

    // Profile Screen
    'profile.title': { en: 'My Profile', my: 'ကိုယ်ရေးအချက်အလက်' },
    'profile.editProfile': { en: 'Edit Profile', my: 'ပြင်ဆင်ရန်' },
    'profile.details': { en: 'Profile details', my: 'ကိုယ်ရေးအသေးစိတ်' },
    'profile.passwords': { en: 'Passwords', my: 'စကားဝှက်' },
    'profile.language': { en: 'Language', my: 'ဘာသာစကား' },
    'profile.subscription': { en: 'Subscription', my: 'အခြေအနေ' },
    'profile.about': { en: 'About', my: 'အကြောင်း' },
    'profile.help': { en: 'Help / FAQ', my: 'အကူအညီ' },
    'profile.logout': { en: 'Log out', my: 'ထွက်ရန်' },

    // Health Tools Screen
    'tools.title': { en: 'Health Tools', my: 'ကျန်းမာရေး ကိရိယာများ' },
    'tools.bmi': { en: 'BMI Calculator', my: 'BMI တွက်စက်' },
    'tools.bmiDesc': { en: 'Check your Body Mass Index', my: 'ခန္ဓာကိုယ်ထုထည်ညွှန်းကိန်း စစ်ဆေးပါ' },
    'tools.symptom': { en: 'Symptom Checker', my: 'ရောဂါလက္ခဏာ စစ်ဆေးရန်' },
    'tools.symptomDesc': { en: 'Check your symptoms', my: 'ရောဂါလက္ခဏာများ စစ်ဆေးပါ' },
    'tools.medication': { en: 'Medication Reminder', my: 'ဆေးသောက်ချိန် သတိပေးချက်' },
    'tools.medicationDesc': { en: 'Set medication reminders', my: 'ဆေးသောက်ချိန် သတ်မှတ်ပါ' },
    'tools.firstAid': { en: 'First Aid Guide', my: 'ရှေးဦးသူနာပြု လမ်းညွှန်' },
    'tools.firstAidDesc': { en: 'Emergency first aid tips', my: 'အရေးပေါ် ရှေးဦးသူနာပြု အကြံပြုချက်' },
    'tools.waterTracker': { en: 'Water Tracker', my: 'ရေသောက်မှတ်တမ်း' },
    'tools.waterDesc': { en: 'Track daily water intake', my: 'နေ့စဉ် ရေသောက်ပမာဏ မှတ်တမ်း' },
    'tools.period': { en: 'Period Tracker', my: 'ရာသီလာမှတ်တမ်း' },
    'tools.periodDesc': { en: 'Track your menstrual cycle', my: 'ရာသီလာခြင်း မှတ်တမ်း' },

    // Emergency Screen
    'emergency.title': { en: 'EMERGENCY', my: 'အရေးပေါ်' },
    'emergency.callNow': { en: 'Call 192 Now', my: '192 သို့ ခေါ်ဆိုပါ' },
    'emergency.calling': { en: 'Calling emergency services...', my: 'အရေးပေါ်ဝန်ဆောင်မှု ခေါ်ဆိုနေသည်...' },
    'emergency.desc': { en: 'If you are in a life-threatening situation, call emergency services immediately.', my: 'အသက်အန္တရာယ်ရှိသော အခြေအနေတွင် အရေးပေါ်ဝန်ဆောင်မှုကို ချက်ချင်းခေါ်ဆိုပါ။' },
    'emergency.nearbyHospital': { en: 'Find Nearby Hospital', my: 'အနီးဆုံးဆေးရုံ ရှာပါ' },
    'emergency.goBack': { en: 'Go Back', my: 'နောက်သို့' },

    // Hospital Finder
    'hospital.title': { en: 'Hospital Finder', my: 'ဆေးရုံရှာဖွေရန်' },
    'hospital.search': { en: 'Search hospitals...', my: 'ဆေးရုံ ရှာပါ...' },
    'hospital.nearby': { en: 'Nearby Hospitals', my: 'အနီးနားဆေးရုံများ' },
    'hospital.call': { en: 'Call', my: 'ဖုန်းခေါ်' },
    'hospital.directions': { en: 'Directions', my: 'လမ်းညွှန်' },
    'hospital.open': { en: 'Open', my: 'ဖွင့်ထား' },
    'hospital.closed': { en: 'Closed', my: 'ပိတ်ထား' },

    // Image Analysis
    'scan.title': { en: 'Image Analysis', my: 'ပုံခွဲခြမ်းစိတ်ဖြာ' },
    'scan.takePhoto': { en: 'Take a Photo', my: 'ဓာတ်ပုံ ရိုက်ပါ' },
    'scan.choosePhoto': { en: 'Choose from Gallery', my: 'ဓာတ်ပုံ ရွေးပါ' },
    'scan.analyze': { en: 'Analyze Image', my: 'ပုံ ခွဲခြမ်းစိတ်ဖြာပါ' },
    'scan.desc': { en: 'Take or upload a photo for AI analysis', my: 'AI ခွဲခြမ်းစိတ်ဖြာရန် ဓာတ်ပုံ ရိုက်ပါ သို့ တင်ပါ' },

    // Subscription
    'sub.title': { en: 'Premium', my: 'ပရီမီယမ်' },
    'sub.free': { en: 'Free', my: 'အခမဲ့' },
    'sub.premium': { en: 'Premium', my: 'ပရီမီယမ်' },
    'sub.monthly': { en: '/month', my: '/လ' },
    'sub.subscribe': { en: 'Subscribe Now', my: 'စာရင်းသွင်းပါ' },
    'sub.current': { en: 'Current Plan', my: 'လက်ရှိအစီအစဉ်' },

    // Disclaimer Modal
    'disclaimer.title': { en: 'Medical Disclaimer', my: 'ဆေးဘက်ဆိုင်ရာ ရှင်းလင်းချက်' },
    'disclaimer.body': {
        en: 'This app provides general health information only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider.',
        my: 'ဒီအက်ပ်သည် ယေဘုယျ ကျန်းမာရေး အချက်အလက်များသာ ပေးပါသည်။ ဆရာဝန်၏ အကြံဉာဏ်ကို အစားထိုးရန် မဟုတ်ပါ။ ကျန်းမာရေး ပြဿနာများအတွက် ဆရာဝန်နှင့် တိုင်ပင်ပါ။',
    },
    'disclaimer.accept': { en: 'I Understand & Accept', my: 'နားလည်ပြီး လက်ခံပါသည်' },

    // Offline Banner
    'offline.message': { en: 'No internet connection', my: 'အင်တာနက် ချိတ်ဆက်မှု မရှိပါ' },

    // Login
    'login.title': { en: 'Welcome', my: 'ကြိုဆိုပါသည်' },
    'login.subtitle': { en: 'Sign in to continue', my: 'ဆက်လက်ရန် ဝင်ပါ' },
    'login.name': { en: 'Full Name', my: 'အမည်' },
    'login.email': { en: 'Email', my: 'အီးမေးလ်' },
    'login.signIn': { en: 'Sign In', my: 'ဝင်ပါ' },

    // Common
    'common.cancel': { en: 'Cancel', my: 'ပယ်ဖျက်' },
    'common.ok': { en: 'OK', my: 'အိုကေ' },
    'common.save': { en: 'Save', my: 'သိမ်းပါ' },
    'common.yes': { en: 'Yes', my: 'ဟုတ်ကဲ့' },
    'common.no': { en: 'No', my: 'မဟုတ်ပါ' },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Language): string {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry.en;
}

export default translations;
