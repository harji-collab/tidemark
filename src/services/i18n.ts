export type Language = 'en' | 'ta' | 'hi';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Branding & Header
    'app.name': 'AquaGov',
    'app.subtitle': 'National Blue Economy Observatory',
    'app.tagline': 'Marine resources, fisheries, coastal industries & blue economy intelligence',
    'nav.gateway': 'Gateway',
    'nav.community': 'Community Portal',
    'nav.officials': 'Officials Portal',
    'nav.analyst': 'Analyst Console',
    'nav.signOut': 'Sign out',
    'footer.synthetic': 'Synthetic demo data — Tamil Nadu Maritime Jurisdiction (Demonstration Only)',

    // Depth Strata
    'gateway.shallows.title': 'Shallows',
    'gateway.shallows.subtitle': 'I fish, farm or run a coastal business',
    'gateway.shallows.desc': 'Real-time sea conditions, potential fishing zones, quick catch log, market prices and licences.',
    'gateway.shelf.title': 'Shelf',
    'gateway.shelf.subtitle': 'I work for a government agency',
    'gateway.shelf.desc': 'Command view, live vessel traces, SLA-driven approvals queue, enforcement cases and quota management.',
    'gateway.abyss.title': 'Abyss',
    'gateway.abyss.subtitle': 'I manage the data and models',
    'gateway.abyss.desc': 'Pipeline health, anomaly triage, methodology studio, model registry and audit log.',

    // Community Portal Nav
    'comm.today': 'Today at sea',
    'comm.chart': 'The Chart',
    'comm.catchLog': 'Catch log',
    'comm.licences': 'Licences',
    'comm.prices': 'Market prices',
    'comm.incident': 'Report incident',
    'comm.advisories': 'Advisories',

    // Sea Verdicts
    'verdict.go': 'Go',
    'verdict.caution': 'Caution',
    'verdict.stay_ashore': 'Stay ashore',

    // Common labels
    'label.waveHeight': 'Wave height',
    'label.wind': 'Wind speed',
    'label.sst': 'Sea temp',
    'label.pfz': 'Today’s fishing zone',
    'label.activeAlerts': 'Active alerts',
    'label.harbour': 'Harbour',
    'label.district': 'District',
    'label.species': 'Species',
    'label.weight': 'Catch weight (kg)',
    'label.landingSite': 'Landing site',
    'label.submitCatch': 'Log catch entry',
    'label.offlineNotice': 'offline entries queued',
    'label.syncNow': 'Sync now',
    'label.provenance': 'Data provenance',
  },
  ta: {
    // Tamil
    'app.name': 'டைட்மார்க்',
    'app.subtitle': 'தேசிய நீலப் பொருளாதார கண்காணிப்பகம்',
    'app.tagline': 'கடல் வளங்கள், மீன்வளம், கடலோரத் தொழில்கள் மற்றும் நீலப் பொருளாதார கண்காணிப்பு',
    'nav.gateway': 'முகப்பு',
    'nav.community': 'மீனவர் & சமூக தளம்',
    'nav.officials': 'அதிகாரிகள் தளம்',
    'nav.analyst': 'ஆய்வாளர் முனையம்',
    'nav.signOut': 'வெளியேறு',
    'footer.synthetic': 'செயற்கை மாதிரி தரவு — தமிழ்நாடு கடல் எல்லை (மாதிரி பார்வைக்கு மட்டும்)',

    // Depth Strata
    'gateway.shallows.title': 'மேலோட்டம் (Shallows)',
    'gateway.shallows.subtitle': 'நான் மீன்பிடிக்கிறேன், பண்ணை அல்லது கடலோர தொழில் செய்கிறேன்',
    'gateway.shallows.desc': 'நேரடி கடல் நிலை, உத்தேச மீன்பிடி மண்டலங்கள், 30 வினாடி பிடிப்பு பதிவு மற்றும் சந்தை விலைகள்.',
    'gateway.shelf.title': 'கண்டத்திட்டு (Shelf)',
    'gateway.shelf.subtitle': 'நான் அரசு மீன்வளத் துறையில் பணியாற்றுகிறேன்',
    'gateway.shelf.desc': 'கட்டளை பார்வை, படகுகள் கண்காணிப்பு, அனுமதிகள் பரிசீலனை, வழக்குகள் மற்றும் பங்கு ஒதுக்கீடு.',
    'gateway.abyss.title': 'ஆழ்கடல் (Abyss)',
    'gateway.abyss.subtitle': 'நான் தரவு மற்றும் கணிப்பீட்டு மாதிரிகளை நிர்வகிக்கிறேன்',
    'gateway.abyss.desc': 'தரவு இணைப்பு நிலை, முரண்பாடுகள் களையெடுப்பு, நிலைத்தன்மைக் குறியீட்டு முறையியல் மற்றும் தணிக்கை.',

    // Community Portal Nav
    'comm.today': 'இன்று கடலில்',
    'comm.chart': 'கடல் வரைபடம்',
    'comm.catchLog': 'மீன் பதிவு',
    'comm.licences': 'உரிமங்கள்',
    'comm.prices': 'சந்தை விலை',
    'comm.incident': 'புகார் பதிவு',
    'comm.advisories': 'எச்சரிக்கைகள்',

    // Sea Verdicts
    'verdict.go': 'கடலுக்குச் செல்லலாம்',
    'verdict.caution': 'எச்சரிக்கையுடன் செல்லவும்',
    'verdict.stay_ashore': 'கரையில் இருக்கவும்',

    // Common labels
    'label.waveHeight': 'அலை உயரம்',
    'label.wind': 'காற்று வேகம்',
    'label.sst': 'கடல் வெப்பநிலை',
    'label.pfz': 'இன்றைய மீன்பிடி மண்டலம்',
    'label.activeAlerts': 'செயலில் உள்ள எச்சரிக்கைகள்',
    'label.harbour': 'துறைமுகம்',
    'label.district': 'மாவட்டம்',
    'label.species': 'மீன் வகை',
    'label.weight': 'எடை (கிலோ)',
    'label.landingSite': 'இறங்கு தளம்',
    'label.submitCatch': 'பதிவு செய்',
    'label.offlineNotice': 'ஆஃப்லைன் பதிவுகள் சேமிக்கப்பட்டுள்ளன',
    'label.syncNow': 'இணைப்பு செய்',
    'label.provenance': 'தரவு மூலம்',
  },
  hi: {
    // Hindi
    'app.name': 'टाइडमार्क',
    'app.subtitle': 'राष्ट्रीय नीली अर्थव्यवस्था वेधशाला',
    'app.tagline': 'समुद्री संसाधन, मत्स्य पालन, तटीय उद्योग एवं नीली अर्थव्यवस्था निगरानी',
    'nav.gateway': 'प्रवेश द्वार',
    'nav.community': 'समुदाय पोर्टल',
    'nav.officials': 'अधिकारी पोर्टल',
    'nav.analyst': 'विश्लेषक कंसोल',
    'nav.signOut': 'साइन आउट',
    'footer.synthetic': 'सिंथेटिक डेमो डेटा — तमिलनाडु समुद्री क्षेत्र (केवल प्रदर्शन हेतु)',

    // Depth Strata
    'gateway.shallows.title': 'उथला क्षेत्र (Shallows)',
    'gateway.shallows.subtitle': 'मैं मछली पकड़ता हूँ, जलीय कृषि या तटीय व्यवसाय करता हूँ',
    'gateway.shallows.desc': 'वास्तविक समय समुद्री स्थिति, संभावित मत्स्य क्षेत्र, त्वरित कैच लॉग, बाजार भाव और लाइसेंस।',
    'gateway.shelf.title': 'महाद्वीपीय मग्नतट (Shelf)',
    'gateway.shelf.subtitle': 'मैं सरकारी एजेंसी में कार्यरत हूँ',
    'gateway.shelf.desc': 'कमांड दृश्य, लाइव पोत ट्रैकिंग, समयबद्ध अनुमोदन कतार, प्रवर्तन और कोटा प्रबंधन।',
    'gateway.abyss.title': 'अगाध समुद्र (Abyss)',
    'gateway.abyss.subtitle': 'मैं डेटा और मॉडल का प्रबंधन करता हूँ',
    'gateway.abyss.desc': 'पाइपलाइन स्वास्थ्य, डेटा विसंगति निवारण, कार्यप्रणाली स्टूडियो और ऑडिट लॉग।',

    // Community Portal Nav
    'comm.today': 'आज समुद्र में',
    'comm.chart': 'समुद्री चार्ट',
    'comm.catchLog': 'कैच लॉग',
    'comm.licences': 'लाइसेंस व सब्सिडी',
    'comm.prices': 'बाजार भाव',
    'comm.incident': 'घटना रिपोर्ट',
    'comm.advisories': 'सलाह व चेतावनी',

    // Sea Verdicts
    'verdict.go': 'जा सकते हैं',
    'verdict.caution': 'सावधानी बरतें',
    'verdict.stay_ashore': 'तट पर रहें',

    // Common labels
    'label.waveHeight': 'लहर ऊंचाई',
    'label.wind': 'हवा की गति',
    'label.sst': 'समुद्री तापमान',
    'label.pfz': 'आज का मत्स्य क्षेत्र',
    'label.activeAlerts': 'सक्रिय चेतावनियां',
    'label.harbour': 'बंदरगाह',
    'label.district': 'जिला',
    'label.species': 'प्रजाति',
    'label.weight': 'वजन (किलो)',
    'label.landingSite': 'उतरने का स्थान',
    'label.submitCatch': 'कैच दर्ज करें',
    'label.offlineNotice': 'ऑफलाइन प्रविष्टियां कतार में हैं',
    'label.syncNow': 'सिंक करें',
    'label.provenance': 'डेटा स्रोत',
  },
};

export function t(key: string, lang: Language = 'en'): string {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key;
}
