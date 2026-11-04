export type Language = 'en' | 'bn';

export const TRANSLATIONS = {
  en: {
    // Top Nav
    appName: "Prayer Focus",
    tagline: "Pray • Focus • Grow",
    tabDashboard: "Live Dashboard",
    tabDocs: "A-Z Documentation",
    tabGitGuide: "GitHub Push & YAML",
    tabPopupPreview: "Popup Preview",
    btnTestOverlay: "Test Prayer Popup",
    btnDownloadZip: "Download Extension (ZIP)",
    
    // Live Bar
    locationPrefix: "Location",
    settingsTitle: "Settings",
    
    // Hero Quote
    dailyGuidance: "Daily Islamic Wisdom & Guidance",
    
    // Next Prayer Banner
    nextPrayer: "Next Prayer",
    startsAt: "Starts at",
    countdownTitle: "Time Remaining Until Adhan",
    
    // 5 Prayers Section
    fiveDailyPrayers: "5 Daily Prayers Schedule",
    syncStatusLive: "Synced with AlAdhan API",
    syncStatusOffline: "Offline Standard Schedule (Chattogram)",
    currentPrayerBadge: "Current Window",
    prayedBtn: "Prayed",
    missedBtn: "Missed",
    
    // Progress Card
    todayProgress: "Today's Prayer Progress",
    emptyStateMsg: "No activities recorded for today yet.",
    emptyStateSub: "Click 'Prayed' on any prayer card above once completed.",
    statPrayed: "Prayed",
    statMissed: "Missed",
    statCompletion: "Completed",
    dailyTargetGoal: "Daily Salah Target",
    disclaimerHonesty: "Notice: Automatic reminders do NOT auto-mark prayers. Honest manual confirmation is required.",
    
    // Quran Timer
    quranTimer: "Quran Reading Timer",
    quranGoal: "Goal",
    mins: "mins",
    readingRunning: "Session in progress...",
    readingPaused: "Paused",
    btnStart: "Start",
    btnPause: "Pause",
    btnStopSave: "Save & Stop",
    btnReset: "Reset",
    todayReading: "Today's Reading",
    totalReading: "Total Reading",
    quranTimerNote: "Self-reported timer to build a daily consistent Quran habit.",
    
    // Calendar
    monthlyCalendar: "Monthly Prayer Calendar & History",
    monthlyCalendarSub: "Actual recorded prayer history in Asia/Dhaka time",
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    selectedDateRecords: "Prayer Breakdown for Date",
    noRecordsForDate: "No activity recorded for this date.",
    prayedLabel: "Prayed ✓",
    missedLabel: "Missed ✕",
    unrecordedLabel: "Not recorded",
    
    // Modal Overlay
    prayerTimeNow: "It's time for",
    prayerTimeNowSub: "Pause worldly distractions for a few moments and answer Allah's call.",
    btnPrayAction: "✓ I am going to pray",
    btnSnoozeAction: "Remind me in 5 minutes",
    focusActiveTitle: "Prayer Focus Mode Active",
    focusActiveSub: "Websites are held in focus mode so you can pray with peace of mind.",
    btnExitPreview: "Exit Preview",
    
    // Prayer Windows & Limits
    timeWindow: "Time Window",
    timeLimit: "Time Limit",
    limitUntil: "Until",
    sunriseLabel: "Sunrise",
    prayerNames: {
      fajr: "Fajr",
      dhuhr: "Dhuhr",
      asr: "Asr",
      maghrib: "Maghrib",
      isha: "Isha"
    },

    // Footer
    footerText: "Prayer Focus v2.0.0 • Preserves Chrome New Tab • Asia/Dhaka Timezone Calibrated"
  },
  bn: {
    // Top Nav
    appName: "Prayer Focus",
    tagline: "Pray • Focus • Grow",
    tabDashboard: "লাইভ ড্যাশবোর্ড",
    tabDocs: "A-Z পরিচিতি ও বিবরণ",
    tabGitGuide: "গিটহাব পুশ ও YAML নির্দেশিকা",
    tabPopupPreview: "টুলবার পপআপ",
    btnTestOverlay: "টেস্ট ওয়াক্ত পপআপ",
    btnDownloadZip: "এক্সটেনশন ডাউনলোড (ZIP)",
    
    // Live Bar
    locationPrefix: "অবস্থান",
    settingsTitle: "সেটিংস",
    
    // Hero Quote
    dailyGuidance: "আজকের ইসলামিক উপদেশ ও দিকনির্দেশনা",
    
    // Next Prayer Banner
    nextPrayer: "পরবর্তী ওয়াক্ত",
    startsAt: "ওয়াক্ত শুরু",
    countdownTitle: "ওয়াক্ত শুরু হতে সময় বাকি",
    
    // 5 Prayers Section
    fiveDailyPrayers: "দৈনিক ৫ ওয়াক্ত সালাত ও সময়সীমা",
    syncStatusLive: "সিঙ্ক সম্পন্ন (AlAdhan API)",
    syncStatusOffline: "অফলাইন স্ট্যান্ডার্ড সময়সূচি (চট্টগ্রাম)",
    currentPrayerBadge: "বর্তমান ওয়াক্ত",
    prayedBtn: "পড়েছি",
    missedBtn: "ছুটেছে",

    // Prayer Windows & Limits
    timeWindow: "সময়সীমা",
    timeLimit: "সর্বোচ্চ সময়সীমা",
    limitUntil: "পর্যন্ত",
    sunriseLabel: "সূর্যোদয়",
    prayerNames: {
      fajr: "ফজর",
      dhuhr: "যোহর",
      asr: "আসর",
      maghrib: "মাগরিব",
      isha: "এশা"
    },
    
    // Progress Card
    todayProgress: "দৈনিক সালাত অগ্রগতি",
    emptyStateMsg: "আজকের কোনো কার্যক্রম এখনো রেকর্ড করা হয়নি।",
    emptyStateSub: "ওয়াক্ত আদায় করার পর ওপরের কার্ডে 'পড়েছি' বাটনে চাপুন।",
    statPrayed: "ওয়াক্ত আদায়",
    statMissed: "ছুটে গেছে",
    statCompletion: "দৈনিক সম্পন্ন",
    dailyTargetGoal: "আজকের মোট সালাত লক্ষ্য",
    disclaimerHonesty: "সতর্কতা: রিমাইন্ডার আসার কারণে কোনো সালাত স্বয়ংক্রিয়ভাবে সম্পন্ন হিসেবে গণ্য হয় না।",
    
    // Quran Timer
    quranTimer: "কোরআন তিলাওয়াত টাইমার",
    quranGoal: "লক্ষ্য",
    mins: "মিনিট",
    readingRunning: "পাঠ সেশন চলছে...",
    readingPaused: "বিরতিতে রয়েছে",
    btnStart: "শুরু করুন",
    btnPause: "বিরতি দিন",
    btnStopSave: "সংরক্ষণ ও শেষ",
    btnReset: "রিসেট",
    todayReading: "আজকের মোট তিলাওয়াত",
    totalReading: "সর্বমোট তিলাওয়াত",
    quranTimerNote: "এই টাইমার আপনার স্ব-প্রতিবেদিত অধ্যয়নের সময় রেকর্ড করে।",
    
    // Calendar
    monthlyCalendar: "মাসিক সালাত ক্যালেন্ডার ও রেকর্ড",
    monthlyCalendarSub: "বাস্তব সংরক্ষিত সালাতের পরিসংখ্যান (Asia/Dhaka)",
    weekdays: ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"],
    selectedDateRecords: "ওয়াক্তভিত্তিক রেকর্ড",
    noRecordsForDate: "এই তারিখে কোনো কার্যক্রম এখনো রেকর্ড করা হয়নি।",
    prayedLabel: "আদায় ✓",
    missedLabel: "ছুটেছে ✕",
    unrecordedLabel: "রেকর্ড নেই",
    
    // Modal Overlay
    prayerTimeNow: "এখন নামাজের সময়",
    prayerTimeNowSub: "দুনিয়ার কাজ কিছুক্ষণের জন্য থামিয়ে আল্লাহর ডাকে সাড়া দাও।",
    btnPrayAction: "✓ আমি নামাজে যাচ্ছি",
    btnSnoozeAction: "৫ মিনিট পরে মনে করিয়ে দিন",
    focusActiveTitle: "নামাজের ফোকাস সেশন চলছে",
    focusActiveSub: "দুনিয়ার বিভ্রান্তি থেকে মুক্ত থাকুন এবং শান্তচিত্তে সালাত আদায় করুন।",
    btnExitPreview: "সেশন প্রিভিউ বন্ধ করুন",
    
    // Footer
    footerText: "Prayer Focus v2.0.0 • গুগল ক্রোমের অরিজিনাল New Tab সংরক্ষিত • Asia/Dhaka সময় অনুযায়ী গণনাকৃত"
  }
};
