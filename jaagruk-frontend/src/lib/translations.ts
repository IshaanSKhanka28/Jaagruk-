export type SupportedLanguage = "en" | "hi" | "mr" | "ta" | "te" | "kn";

export interface Translations {
  "Report an Issue": string;
  "View Live Map": string;
  "Dashboard": string;
  "Leaderboard": string;
  "Submit Report": string;
  "See it. Report it. Fix it.": string;
  "Open": string;
  "In Progress": string;
  "Resolved": string;
}

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: {
    "Report an Issue": "Report an Issue",
    "View Live Map": "View Live Map",
    "Dashboard": "Dashboard",
    "Leaderboard": "Leaderboard",
    "Submit Report": "Submit Report",
    "See it. Report it. Fix it.": "See it. Report it. Fix it.",
    "Open": "Open",
    "In Progress": "In Progress",
    "Resolved": "Resolved",
  },
  hi: {
    "Report an Issue": "समस्या दर्ज करें",
    "View Live Map": "लाइव मानचित्र देखें",
    "Dashboard": "डैशबोर्ड",
    "Leaderboard": "लीडरबोर्ड",
    "Submit Report": "रिपोर्ट जमा करें",
    "See it. Report it. Fix it.": "देखें। रिपोर्ट करें। ठीक करें।",
    "Open": "खुला",
    "In Progress": "प्रगति पर",
    "Resolved": "समाधान किया गया",
  },
  mr: {
    "Report an Issue": "समस्या नोंदवा",
    "View Live Map": "थेट नकाशा पहा",
    "Dashboard": "डॅशबोर्ड",
    "Leaderboard": "लीडरबोर्ड",
    "Submit Report": "अहवाल सादर करा",
    "See it. Report it. Fix it.": "पहा. नोंदवा. दुरुस्त करा.",
    "Open": "खुला",
    "In Progress": "काम सुरू आहे",
    "Resolved": "निकाली काढले",
  },
  ta: {
    "Report an Issue": "பிரச்சினையைப் புகாரளி",
    "View Live Map": "நேரடி வரைபடத்தைப் பார்",
    "Dashboard": "டாஷ்போர்டு",
    "Leaderboard": "தலைமைப்பலகை",
    "Submit Report": "புகாரைச் சமர்ப்பி",
    "See it. Report it. Fix it.": "பார். புகாரளி. சரிசெய்.",
    "Open": "திறந்த",
    "In Progress": "நடவடிக்கையில்",
    "Resolved": "தீர்வு காணப்பட்டது",
  },
  te: {
    "Report an Issue": "సమస్యను నివేదించు",
    "View Live Map": "లైవ్ మ్యాప్ చూడు",
    "Dashboard": "డ్యాష్‌బోర్డ్",
    "Leaderboard": "లీడర్‌బోర్డ్",
    "Submit Report": "நிవేదికను సమర్పించు",
    "See it. Report it. Fix it.": "చూడు. నివేదించు. పరిష్కరించు.",
    "Open": "ప్రారంభం",
    "In Progress": "ప్రక్రియలో ఉంది",
    "Resolved": "పరిష్కరించబడింది",
  },
  kn: {
    "Report an Issue": "ಸಮಸ್ಯೆಯನ್ನು ವರದಿ ಮಾಡಿ",
    "View Live Map": "ಲೈವ್ ನಕ್ಷೆ ನೋಡಿ",
    "Dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "Leaderboard": "ಲೀಡರ್‌ಬೋರ್ಡ್",
    "Submit Report": "ವರದಿ ಸಲ್ಲಿಸಿ",
    "See it. Report it. Fix it.": "ನೋಡಿ. ವರದಿ ಮಾಡಿ. ಸರಿಪಡಿಸಿ.",
    "Open": "ತೆರೆದಿದೆ",
    "In Progress": "ಪ್ರಗತಿಯಲ್ಲಿದೆ",
    "Resolved": "ಪರಿಹರಿಸಲಾಗಿದೆ",
  },
};
