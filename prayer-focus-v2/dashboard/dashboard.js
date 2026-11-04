import { getDhakaDateString, formatBengaliDate, formatBengaliTime, toBengaliNumerals, getDhakaNow } from '../modules/timezone.js';
import { getSettings, saveSettings } from '../modules/storage.js';
import { fetchPrayerTimings, calculateNextPrayer, getPrayerWindows, formatDisplayTime, applyTimeOffset, PRAYER_NAMES } from '../modules/prayer-api.js';
import { getDailyQuote } from '../modules/quotes.js';
import { getPrayerRecordForDate, recordPrayerStatus, getTodayStats, PRAYER_LIST } from '../modules/prayer-tracker.js';
import {
  saveQuranSession,
  getQuranReadingStats,
  getActiveTimerState,
  saveActiveTimerState,
  clearActiveTimerState
} from '../modules/quran-timer.js';
import { renderMonthlyCalendar, renderDateDetails } from '../modules/calendar.js';
import { searchGlobalCities } from '../modules/cities.js';

let countdownTimer = null;
let liveClockInterval = null;
let quranInterval = null;
let quranStartTime = null;
let quranAccumulatedSeconds = 0;
let quranIsRunning = false;

// Calendar State
let currentCalYear = 2026;
let currentCalMonth = 11; // 1-12
let dashboardLang = 'en'; // Defaults to English
let cachedSchedule = null;
let currentSettings = null;

const I18N = {
  en: {
    heroBadge: "Daily Islamic Wisdom & Guidance",
    nextPrayerBanner: "Next Prayer",
    startsAt: "Starts at",
    timeLimitPrefix: "Time Limit",
    countdownTitle: "Time Remaining Until Adhan",
    fivePrayers: "5 Daily Prayers Schedule & Limits",
    syncLive: "Synced with AlAdhan API",
    syncOffline: "Offline Standard Schedule (Chattogram)",
    syncCache: "Stored Offline Schedule (Cached)",
    currentBadge: "Current Window",
    presentWindow: "Current Window (Present Salah)",
    presentSalahStatus: "Ongoing Now",
    prayed: "Prayed",
    missed: "Missed",
    prayerProgress: "Today's Prayer Progress",
    emptyProgress: "No activities recorded for today yet.",
    statPrayed: "Prayed",
    statMissed: "Missed",
    statCompleted: "Completed",
    quranTimer: "Quran Reading Timer",
    btnStart: "Start",
    btnPause: "Pause",
    btnStop: "Save & Stop",
    btnReset: "Reset",
    quranToday: "Today's Reading",
    quranTotal: "Total Reading",
    quranGoal: "Daily Goal",
    mins: "mins",
    quranNote: "Self-reported timer to build a daily consistent Quran habit.",
    calTitle: "Monthly Prayer Calendar & History",
    calSub: "Actual recorded prayer history in Asia/Dhaka time",
    calPrev: "◀ Prev Month",
    calNext: "Next Month ▶",
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    monthNames: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    modalTitle: "Settings & Configuration",
    locGroup: "Location & Timezone",
    labelCity: "City Name",
    labelLat: "Latitude",
    labelLng: "Longitude",
    labelTz: "Timezone",
    formatGroup: "Time Format & Adjustments",
    labelFormat: "Time Display Format",
    labelOffsets: "Permanent Prayer Adjustments (Minutes - all days)",
    calcGroup: "Calculation Method",
    labelMethod: "Calculation Method",
    labelAsr: "Asr Juristic Method",
    remindGroup: "Reminders & Focus Mode",
    labelNotifCheckbox: "Enable automatic reminder popup when prayer starts",
    labelFocusDuration: "Focus Duration (Minutes)",
    labelSnoozeDuration: "Snooze Duration (Minutes)",
    quranGroup: "Quran Goal & Preferences",
    labelQuranGoalSetting: "Daily Quran Goal (Minutes)",
    labelDisplayName: "Your Name / Title",
    btnCancelSettings: "Cancel",
    btnSaveSettings: "Save Settings",
    footerText: "Prayer Focus v2.1.0 • Preserves Chrome New Tab • Asia/Dhaka Timezone Calibrated"
  },
  bn: {
    heroBadge: "আজকের ইসলামিক উপদেশ ও দিকনির্দেশনা",
    nextPrayerBanner: "পরবর্তী ওয়াক্ত",
    startsAt: "ওয়াক্ত শুরু",
    timeLimitPrefix: "সময়সীমা",
    countdownTitle: "ওয়াক্ত শুরু হতে সময় বাকি",
    fivePrayers: "দৈনিক ৫ ওয়াক্ত সালাত ও সময়সীমা",
    syncLive: "সিঙ্ক সম্পন্ন (AlAdhan API)",
    syncOffline: "অফলাইন স্ট্যান্ডার্ড সময়সূচি (চট্টগ্রাম)",
    syncCache: "সংরক্ষিত অফলাইন সময়সূচি (ক্যাশ)",
    currentBadge: "বর্তমান ওয়াক্ত",
    presentWindow: "বর্তমান ওয়াক্ত (চলমান সালাত)",
    presentSalahStatus: "চলমান",
    prayed: "পড়েছি",
    missed: "ছুটেছে",
    prayerProgress: "দৈনিক সালাত অগ্রগতি",
    emptyProgress: "আজকের কোনো কার্যক্রম এখনো রেকর্ড করা হয়নি।",
    statPrayed: "ওয়াক্ত আদায়",
    statMissed: "ছুটে গেছে",
    statCompleted: "দৈনিক সম্পন্ন",
    quranTimer: "কোরআন তিলাওয়াত টাইমার",
    btnStart: "শুরু করুন",
    btnPause: "বিরতি দিন",
    btnStop: "সংরক্ষণ ও শেষ",
    btnReset: "রিসেট",
    quranToday: "আজকের মোট তিলাওয়াত",
    quranTotal: "সর্বমোট তিলাওয়াত",
    quranGoal: "দৈনিক লক্ষ্য",
    mins: "মিনিট",
    quranNote: "এই টাইমার আপনার স্ব-প্রতিবেদিত অধ্যয়নের সময় রেকর্ড করে।",
    calTitle: "মাসিক সালাত ক্যালেন্ডার ও রেকর্ড",
    calSub: "আপনার বাস্তব সংরক্ষিত সালাতের পরিসংখ্যান (Asia/Dhaka)",
    calPrev: "◀ পূর্ববর্তী মাস",
    calNext: "পরবর্তী মাস ▶",
    weekdays: ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"],
    monthNames: [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ],
    modalTitle: "সেটিংস ও কনফিগারেশন",
    locGroup: "অবস্থান ও টাইমজোন",
    labelCity: "শহরের নাম",
    labelLat: "অক্ষাংশ (Latitude)",
    labelLng: "দ্রাঘিমাংশ (Longitude)",
    labelTz: "টাইমজোন",
    formatGroup: "ঘড়ির ফরম্যাট ও সময় সমন্বয়",
    labelFormat: "সময় প্রদর্শনের ফরম্যাট",
    labelOffsets: "স্থায়ী ওয়াক্ত সময় পরিবর্তন (মিনিট - সব দিনের জন্য প্রযোজ্য)",
    calcGroup: "সালাতের হিসাব পদ্ধতি",
    labelMethod: "পদ্ধতি (Calculation Method)",
    labelAsr: "আসর মাযহাব (Juristic Method)",
    remindGroup: "রিমাইন্ডার ও ফোকাস মোড",
    labelNotifCheckbox: "ওয়াক্ত শুরু হলে স্বয়ংক্রিয় রিমাইন্ডার পপআপ ও অ্যালার্ম চালু রাখুন",
    labelFocusDuration: "ফোকাস সময় (মিনিট)",
    labelSnoozeDuration: "স্নুজ সময় (মিনিট)",
    quranGroup: "কোরআন লক্ষ্য ও পছন্দ",
    labelQuranGoalSetting: "দৈনিক তিলাওয়াতের লক্ষ্য (মিনিট)",
    labelDisplayName: "আপনার নাম / উপাধি",
    btnCancelSettings: "বাতিল",
    btnSaveSettings: "সংরক্ষণ করুন",
    footerText: "Prayer Focus v2.1.0 • গুগল ক্রোমের অরিজিনাল New Tab সংরক্ষিত • Asia/Dhaka সময় অনুযায়ী গণনাকৃত"
  }
};

async function initDashboard() {
  const dhakaNow = getDhakaNow();
  currentCalYear = dhakaNow.getFullYear();
  currentCalMonth = dhakaNow.getMonth() + 1;

  currentSettings = await getSettings();
  dashboardLang = currentSettings.language || 'en';

  setupLanguageToggle();
  setupLiveClock();
  await loadHeaderAndSettings();
  await applyStaticI18n();
  await loadDailyQuote();
  await loadPrayerTimingsAndCountdown();
  await loadTodayProgress();
  await initQuranTimer();
  await initCalendar();
  setupSettingsModal();

  if (window.location.hash === '#settings') {
    openSettingsModal();
  }
}

function setupLanguageToggle() {
  const btnEn = document.getElementById('lang-btn-en');
  const btnBn = document.getElementById('lang-btn-bn');

  const updateButtonsStyle = () => {
    if (btnEn && btnBn) {
      if (dashboardLang === 'en') {
        btnEn.style.background = '#10b981';
        btnEn.style.color = '#022c22';
        btnBn.style.background = 'transparent';
        btnBn.style.color = '#a7f3d0';
      } else {
        btnBn.style.background = '#10b981';
        btnBn.style.color = '#022c22';
        btnEn.style.background = 'transparent';
        btnEn.style.color = '#a7f3d0';
      }
    }
  };

  updateButtonsStyle();

  if (btnEn && btnBn) {
    btnEn.onclick = async () => {
      if (dashboardLang === 'en') return;
      dashboardLang = 'en';
      await saveSettings({ language: 'en' });
      updateButtonsStyle();
      await switchLanguage();
    };

    btnBn.onclick = async () => {
      if (dashboardLang === 'bn') return;
      dashboardLang = 'bn';
      await saveSettings({ language: 'bn' });
      updateButtonsStyle();
      await switchLanguage();
    };
  }
}

async function switchLanguage() {
  currentSettings = await getSettings();
  await applyStaticI18n();
  await loadDailyQuote();
  if (cachedSchedule) {
    await renderPrayerCards(cachedSchedule);
    startBannerCountdown(cachedSchedule);
  }
  await loadTodayProgress();
  await updateQuranStatsDisplay();
  await initCalendar();
}

function applyStaticI18n() {
  const dict = I18N[dashboardLang];

  const map = {
    'label-hero-badge': dict.heroBadge,
    'label-next-prayer-banner': dict.nextPrayerBanner,
    'label-countdown-title': dict.countdownTitle,
    'label-five-prayers': dict.fivePrayers,
    'label-prayer-progress': dict.prayerProgress,
    'label-quran-timer': dict.quranTimer,
    'btn-timer-start': dict.btnStart,
    'btn-timer-pause': dict.btnPause,
    'btn-timer-stop': dict.btnStop,
    'btn-timer-reset': dict.btnReset,
    'label-quran-today': dict.quranToday,
    'label-quran-total': dict.quranTotal,
    'label-quran-goal': dict.quranGoal,
    'label-quran-note': dict.quranNote,
    'label-cal-title': dict.calTitle,
    'label-cal-sub': dict.calSub,
    'cal-prev': dict.calPrev,
    'cal-next': dict.calNext,
    'label-modal-title': dict.modalTitle,
    'label-loc-group': dict.locGroup,
    'label-city': dict.labelCity,
    'label-lat': dict.labelLat,
    'label-lng': dict.labelLng,
    'label-tz': dict.labelTz,
    'label-format-group': dict.formatGroup,
    'label-format': dict.labelFormat,
    'label-offsets': dict.labelOffsets,
    'label-calc-group': dict.calcGroup,
    'label-method': dict.labelMethod,
    'label-asr': dict.labelAsr,
    'label-remind-group': dict.remindGroup,
    'label-notif-checkbox': dict.labelNotifCheckbox,
    'label-focus-duration': dict.labelFocusDuration,
    'label-snooze-duration': dict.labelSnoozeDuration,
    'label-quran-group': dict.quranGroup,
    'label-quran-goal-setting': dict.labelQuranGoalSetting,
    'label-display-name': dict.labelDisplayName,
    'btn-cancel-settings': dict.btnCancelSettings,
    'btn-save-settings': dict.btnSaveSettings,
    'footer-text': dict.footerText
  };

  for (const [id, text] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // Update offset prayer names
  const pKeys = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  pKeys.forEach((key) => {
    const el = document.getElementById(`offset-name-${key}`);
    if (el) {
      el.textContent = dashboardLang === 'en' ? PRAYER_NAMES[key].en : PRAYER_NAMES[key].bn;
    }
  });

  // Update calendar weekdays row
  const headerRow = document.getElementById('calendar-grid-header-row');
  if (headerRow) {
    headerRow.innerHTML = dict.weekdays.map((w) => `<span>${w}</span>`).join('');
  }
}

// 1. Live Clock & Date in Asia/Dhaka
function setupLiveClock() {
  const clockEl = document.getElementById('live-clock');
  const dateEl = document.getElementById('live-date');

  const update = () => {
    const now = new Date();
    if (clockEl) {
      clockEl.textContent = dashboardLang === 'en'
        ? now.toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka' })
        : formatBengaliTime(now);
    }
    if (dateEl) {
      dateEl.textContent = dashboardLang === 'en'
        ? now.toLocaleDateString('en-US', { timeZone: 'Asia/Dhaka', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : formatBengaliDate(now);
    }
  };

  update();
  if (liveClockInterval) clearInterval(liveClockInterval);
  liveClockInterval = setInterval(update, 1000);
}

// 2. Settings & Location Display
async function loadHeaderAndSettings() {
  const settings = currentSettings || await getSettings();
  const locDisplay = document.getElementById('loc-display');
  if (locDisplay) {
    locDisplay.textContent = `${settings.cityName} (${settings.timezone})`;
  }
}

// 3. Daily Islamic Reminder
async function loadDailyQuote() {
  const todayStr = getDhakaDateString();
  const quote = getDailyQuote(todayStr, dashboardLang);

  const textEl = document.getElementById('daily-quote-text');
  const refEl = document.getElementById('daily-quote-ref');

  if (textEl) textEl.textContent = `"${quote.text}"`;
  if (refEl) refEl.textContent = `— ${quote.reference}`;
}

// 4. Five Daily Prayers & Next Prayer Countdown
async function loadPrayerTimingsAndCountdown() {
  cachedSchedule = await fetchPrayerTimings();
  const dict = I18N[dashboardLang];
  const syncInfoEl = document.getElementById('sync-info');

  if (cachedSchedule) {
    if (syncInfoEl) {
      if (cachedSchedule.isHardFallback) {
        syncInfoEl.textContent = dict.syncOffline;
      } else if (cachedSchedule.isCachedFallback) {
        syncInfoEl.textContent = dict.syncCache;
      } else {
        syncInfoEl.textContent = `${dict.syncLive} (${cachedSchedule.methodName})`;
      }
    }

    await renderPrayerCards(cachedSchedule);
    startBannerCountdown(cachedSchedule);
  }
}

async function renderPrayerCards(schedule) {
  const container = document.getElementById('prayer-cards-container');
  if (!container || !schedule || !schedule.timings) return;
  container.innerHTML = '';

  const todayStr = getDhakaDateString();
  const record = await getPrayerRecordForDate(todayStr);
  const settings = currentSettings || await getSettings();
  const offsets = settings.timingOffsets || {};
  const fmt = settings.timeFormat || '12h';
  const windows = getPrayerWindows(schedule, offsets, fmt);
  const nextInfo = calculateNextPrayer(schedule, offsets);
  const dict = I18N[dashboardLang];

  PRAYER_LIST.forEach((key) => {
    const rawTime = schedule.timings[key] || '--:--';
    const offset = offsets[key] || 0;
    const adjustedTime = rawTime !== '--:--' ? applyTimeOffset(rawTime, offset) : '--:--';
    const displayFormatted = adjustedTime !== '--:--' ? formatDisplayTime(adjustedTime, fmt) : '--:--';
    const info = PRAYER_NAMES[key];
    const status = record[key] || 'none';
    const isCurrent = nextInfo && nextInfo.current && nextInfo.current.key === key;
    const win = windows[key] || {};

    const card = document.createElement('div');
    card.className = `prayer-card ${isCurrent ? 'current-active' : ''}`;

    const pName = dashboardLang === 'en' ? info.en : info.bn;
    const timeDisplay = dashboardLang === 'bn' ? toBengaliNumerals(displayFormatted) : displayFormatted;
    const winStr = dashboardLang === 'bn' ? toBengaliNumerals(win.windowBn || '') : (win.windowEn || '');
    const limitLabel = dashboardLang === 'bn' ? (win.limitBn || '') : (win.limitEn || '');

    card.innerHTML = `
      ${isCurrent ? `<div style="width: 100%; display: flex; justify-content: center;"><span class="current-window-badge">⚡ ${dict.currentBadge}</span></div>` : ''}
      <div>
        <div class="pc-name-bn">${pName}</div>
        <div class="pc-name-ar">${info.ar}</div>
      </div>
      <div class="pc-time">${timeDisplay}</div>
      <div class="pc-window">${dict.timeLimitPrefix}: ${winStr}</div>
      <div class="pc-limit">${limitLabel}</div>
      <div class="pc-actions">
        <button class="action-status-btn ${status === 'prayed' ? 'selected-prayed' : ''}" data-status="prayed">
          ${dict.prayed}
        </button>
        <button class="action-status-btn ${status === 'missed' ? 'selected-missed' : ''}" data-status="missed">
          ${dict.missed}
        </button>
      </div>
    `;

    const btnPrayed = card.querySelector('[data-status="prayed"]');
    const btnMissed = card.querySelector('[data-status="missed"]');

    btnPrayed.onclick = async () => {
      const newStatus = status === 'prayed' ? 'none' : 'prayed';
      await recordPrayerStatus(todayStr, key, newStatus);
      await refreshAllPrayerViews();
    };

    btnMissed.onclick = async () => {
      const newStatus = status === 'missed' ? 'none' : 'missed';
      await recordPrayerStatus(todayStr, key, newStatus);
      await refreshAllPrayerViews();
    };

    container.appendChild(card);
  });
}

function startBannerCountdown(schedule) {
  if (countdownTimer) clearInterval(countdownTimer);

  const nameEl = document.getElementById('banner-prayer-name');
  const timeEl = document.getElementById('banner-prayer-time');
  const windowEl = document.getElementById('banner-prayer-window');
  const countEl = document.getElementById('banner-countdown');

  const dict = I18N[dashboardLang];
  const settings = currentSettings || {};
  const offsets = settings.timingOffsets || {};
  const fmt = settings.timeFormat || '12h';

  const update = () => {
    const nextInfo = calculateNextPrayer(schedule, offsets);
    if (!nextInfo || !nextInfo.next) return;

    const next = nextInfo.next;
    const nextName = dashboardLang === 'en' ? next.nameEn : next.name;
    const formattedStartTime = formatDisplayTime(next.time, fmt);
    const winStr = dashboardLang === 'bn' ? next.windowBn : next.windowEn;
    const limitLabel = dashboardLang === 'bn' ? next.limitBn : next.limitEn;

    if (nameEl) nameEl.textContent = `${nextName} (${next.arabicName})`;
    if (timeEl) {
      const startText = dashboardLang === 'bn' ? toBengaliNumerals(formattedStartTime) : formattedStartTime;
      timeEl.textContent = `${dict.startsAt}: ${startText}`;
    }
    if (windowEl) {
      const displayWin = dashboardLang === 'bn' ? toBengaliNumerals(winStr) : winStr;
      windowEl.textContent = `${dict.timeLimitPrefix}: ${displayWin} (${limitLabel})`;
    }

    const presentEl = document.getElementById('banner-present-window');
    if (presentEl) {
      if (nextInfo.current) {
        const cur = nextInfo.current;
        const curName = dashboardLang === 'en' ? cur.nameEn : cur.name;
        const curWin = dashboardLang === 'bn' ? toBengaliNumerals(cur.windowBn || '') : (cur.windowEn || '');
        const curLimit = dashboardLang === 'bn' ? cur.limitBn : cur.limitEn;
        presentEl.style.display = 'inline-flex';
        presentEl.innerHTML = `<span class="dot"></span> <strong>${dict.presentWindow}: ${curName} (${cur.arabicName})</strong> &nbsp;•&nbsp; <span>${curWin} (${curLimit})</span>`;
      } else {
        presentEl.style.display = 'none';
      }
    }

    const remaining = Math.max(0, next.epoch - Date.now());
    const totalSec = Math.floor(remaining / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    const formatted = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    if (countEl) countEl.textContent = dashboardLang === 'bn' ? toBengaliNumerals(formatted) : formatted;
  };

  update();
  countdownTimer = setInterval(update, 1000);
}

// 5. Daily Progress (STRICTLY NO DEMO DATA)
async function loadTodayProgress() {
  const contentEl = document.getElementById('progress-content');
  if (!contentEl) return;

  const todayStr = getDhakaDateString();
  const stats = await getTodayStats(todayStr);
  const dict = I18N[dashboardLang];

  if (!stats.hasActivity) {
    contentEl.innerHTML = `
      <div class="empty-data-msg">
        ${dict.emptyProgress}
      </div>
    `;
    return;
  }

  const prayedCountStr = dashboardLang === 'bn' ? `${toBengaliNumerals(stats.prayedCount)}/৫` : `${stats.prayedCount}/5`;
  const missedCountStr = dashboardLang === 'bn' ? toBengaliNumerals(stats.missedCount) : stats.missedCount;
  const pctStr = dashboardLang === 'bn' ? `${toBengaliNumerals(stats.percentage)}%` : `${stats.percentage}%`;

  contentEl.innerHTML = `
    <div class="stats-grid-row">
      <div class="stat-pill">
        <div class="stat-num">${prayedCountStr}</div>
        <div class="stat-title">${dict.statPrayed}</div>
      </div>
      <div class="stat-pill">
        <div class="stat-num">${missedCountStr}</div>
        <div class="stat-title">${dict.statMissed}</div>
      </div>
      <div class="stat-pill">
        <div class="stat-num">${pctStr}</div>
        <div class="stat-title">${dict.statCompleted}</div>
      </div>
    </div>
    <div class="progress-bar-wrap">
      <div class="progress-bar-fill" style="width: ${stats.percentage}%;"></div>
    </div>
  `;
}

// 6. Quran Reading Timer
async function initQuranTimer() {
  const startBtn = document.getElementById('btn-timer-start');
  const pauseBtn = document.getElementById('btn-timer-pause');
  const stopBtn = document.getElementById('btn-timer-stop');
  const resetBtn = document.getElementById('btn-timer-reset');

  const settings = currentSettings || await getSettings();
  const dict = I18N[dashboardLang];
  const goalEl = document.getElementById('quran-goal-display');
  if (goalEl) {
    const goalVal = dashboardLang === 'bn' ? toBengaliNumerals(settings.dailyQuranGoalMinutes) : settings.dailyQuranGoalMinutes;
    goalEl.textContent = `${goalVal} ${dict.mins}`;
  }

  await updateQuranStatsDisplay();

  const savedState = await getActiveTimerState();
  if (savedState) {
    quranAccumulatedSeconds = savedState.accumulatedSeconds || 0;
    if (savedState.isRunning && savedState.startTime) {
      const elapsedSince = Math.floor((Date.now() - savedState.startTime) / 1000);
      quranAccumulatedSeconds += elapsedSince;
      quranStartTime = Date.now();
      quranIsRunning = true;
      runQuranTick();
      startBtn.disabled = true;
      pauseBtn.disabled = false;
      stopBtn.disabled = false;
    } else {
      updateQuranDigits(quranAccumulatedSeconds);
      if (quranAccumulatedSeconds > 0) {
        stopBtn.disabled = false;
      }
    }
  }

  startBtn.onclick = () => {
    quranIsRunning = true;
    quranStartTime = Date.now();
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    stopBtn.disabled = false;
    runQuranTick();
    saveActiveTimerState({ isRunning: true, startTime: quranStartTime, accumulatedSeconds: quranAccumulatedSeconds });
  };

  pauseBtn.onclick = () => {
    if (quranIsRunning) {
      quranIsRunning = false;
      if (quranInterval) clearInterval(quranInterval);
      const elapsed = Math.floor((Date.now() - quranStartTime) / 1000);
      quranAccumulatedSeconds += elapsed;
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      saveActiveTimerState({ isRunning: false, startTime: null, accumulatedSeconds: quranAccumulatedSeconds });
    }
  };

  stopBtn.onclick = async () => {
    if (quranIsRunning) {
      const elapsed = Math.floor((Date.now() - quranStartTime) / 1000);
      quranAccumulatedSeconds += elapsed;
      quranIsRunning = false;
      if (quranInterval) clearInterval(quranInterval);
    }
    const session = await saveQuranSession(quranAccumulatedSeconds);
    quranAccumulatedSeconds = 0;
    updateQuranDigits(0);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    await updateQuranStatsDisplay();
  };

  resetBtn.onclick = async () => {
    quranIsRunning = false;
    if (quranInterval) clearInterval(quranInterval);
    quranAccumulatedSeconds = 0;
    updateQuranDigits(0);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    await clearActiveTimerState();
  };
}

function runQuranTick() {
  if (quranInterval) clearInterval(quranInterval);

  quranInterval = setInterval(() => {
    if (!quranIsRunning) return;
    const currentElapsed = Math.floor((Date.now() - quranStartTime) / 1000);
    const total = quranAccumulatedSeconds + currentElapsed;
    updateQuranDigits(total);
  }, 1000);
}

function updateQuranDigits(totalSec) {
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const str = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const el = document.getElementById('quran-timer-digits');
  if (el) el.textContent = dashboardLang === 'bn' ? toBengaliNumerals(str) : str;
}

async function updateQuranStatsDisplay() {
  const stats = await getQuranReadingStats();
  const dict = I18N[dashboardLang];
  const todayEl = document.getElementById('quran-today-mins');
  const totalEl = document.getElementById('quran-total-mins');

  const todayVal = dashboardLang === 'bn' ? toBengaliNumerals(stats.todayMinutes) : stats.todayMinutes;
  const totalVal = dashboardLang === 'bn' ? toBengaliNumerals(stats.totalMinutes) : stats.totalMinutes;

  if (todayEl) todayEl.textContent = `${todayVal} ${dict.mins}`;
  if (totalEl) totalEl.textContent = `${totalVal} ${dict.mins}`;
}

// 7. Interactive Monthly Calendar
async function initCalendar() {
  const calLabel = document.getElementById('cal-current-label');
  const container = document.getElementById('calendar-days-container');
  const detailContainer = document.getElementById('calendar-day-detail');
  const dict = I18N[dashboardLang];

  const refreshCalendar = async () => {
    if (calLabel) {
      const monthName = dict.monthNames[currentCalMonth - 1];
      const yearStr = dashboardLang === 'bn' ? toBengaliNumerals(currentCalYear) : currentCalYear;
      calLabel.textContent = `${monthName} ${yearStr}`;
    }
    await renderMonthlyCalendar(container, currentCalYear, currentCalMonth, (dateStr, rec) => {
      renderDateDetails(detailContainer, dateStr, rec);
    }, dashboardLang);
  };

  document.getElementById('cal-prev')?.addEventListener('click', async () => {
    currentCalMonth--;
    if (currentCalMonth < 1) {
      currentCalMonth = 12;
      currentCalYear--;
    }
    await refreshCalendar();
  });

  document.getElementById('cal-next')?.addEventListener('click', async () => {
    currentCalMonth++;
    if (currentCalMonth > 12) {
      currentCalMonth = 1;
      currentCalYear++;
    }
    await refreshCalendar();
  });

  await refreshCalendar();
}

// 8. Settings Modal
function setupSettingsModal() {
  const modal = document.getElementById('settings-modal');
  const openBtn = document.getElementById('btn-show-settings');
  const closeBtn = document.getElementById('btn-close-settings');
  const cancelBtn = document.getElementById('btn-cancel-settings');
  const saveBtn = document.getElementById('btn-save-settings');
  const cityInput = document.getElementById('setting-city');
  const dropdown = document.getElementById('city-suggestions-dropdown');
  const spinner = document.getElementById('city-search-spinner');

  let searchTimeout = null;
  cityInput?.addEventListener('input', (e) => {
    const q = e.target.value.trim();
    if (searchTimeout) clearTimeout(searchTimeout);
    if (q.length < 1) {
      if (dropdown) dropdown.style.display = 'none';
      return;
    }

    if (spinner) spinner.style.display = 'inline';
    searchTimeout = setTimeout(async () => {
      const results = await searchGlobalCities(q);
      if (spinner) spinner.style.display = 'none';
      if (!dropdown) return;

      if (!results || results.length === 0) {
        dropdown.innerHTML = `<div class="city-dropdown-item" style="color: #a7f3d0; font-size: 12px; padding: 10px;">${dashboardLang === 'bn' ? 'কোনো শহর পাওয়া যায়নি' : 'No matching city found'}</div>`;
        dropdown.style.display = 'block';
        return;
      }

      dropdown.innerHTML = results.map((c, idx) => `
        <div class="city-dropdown-item" data-idx="${idx}">
          <div>
            <span class="city-name-text">${c.name}</span>
            <span class="city-country-text">, ${c.country}</span>
          </div>
          <div class="city-coords-text">${c.latitude.toFixed(2)}°, ${c.longitude.toFixed(2)}° • ${c.timezone}</div>
        </div>
      `).join('');

      dropdown.querySelectorAll('.city-dropdown-item').forEach((item) => {
        item.addEventListener('click', () => {
          const idx = parseInt(item.getAttribute('data-idx'), 10);
          const selected = results[idx];
          if (selected) {
            cityInput.value = `${selected.name}, ${selected.country}`;
            document.getElementById('setting-lat').value = selected.latitude;
            document.getElementById('setting-lng').value = selected.longitude;
            if (document.getElementById('setting-tz')) {
              document.getElementById('setting-tz').value = selected.timezone;
            }
          }
          dropdown.style.display = 'none';
        });
      });

      dropdown.style.display = 'block';
    }, 250);
  });

  document.addEventListener('click', (e) => {
    if (!cityInput?.contains(e.target) && !dropdown?.contains(e.target)) {
      if (dropdown) dropdown.style.display = 'none';
    }
  });

  openBtn?.addEventListener('click', openSettingsModal);
  closeBtn?.addEventListener('click', () => {
    modal.style.display = 'none';
    if (dropdown) dropdown.style.display = 'none';
  });
  cancelBtn?.addEventListener('click', () => {
    modal.style.display = 'none';
    if (dropdown) dropdown.style.display = 'none';
  });

  saveBtn?.addEventListener('click', async () => {
    const city = document.getElementById('setting-city').value;
    const lat = parseFloat(document.getElementById('setting-lat').value);
    const lng = parseFloat(document.getElementById('setting-lng').value);
    const method = parseInt(document.getElementById('setting-method').value, 10);
    const asr = parseInt(document.getElementById('setting-asr').value, 10);
    const notifs = document.getElementById('setting-notifications').checked;
    const focusDuration = parseInt(document.getElementById('setting-focus-duration').value, 10) || 8;
    const snoozeDuration = parseInt(document.getElementById('setting-snooze-duration').value, 10) || 5;
    const quranGoal = parseInt(document.getElementById('setting-quran-goal').value, 10) || 15;
    const displayName = document.getElementById('setting-display-name').value;

    const timeFormat = document.getElementById('setting-time-format')?.value || '12h';
    const offsets = {
      fajr: parseInt(document.getElementById('offset-fajr')?.value, 10) || 0,
      dhuhr: parseInt(document.getElementById('offset-dhuhr')?.value, 10) || 0,
      asr: parseInt(document.getElementById('offset-asr')?.value, 10) || 0,
      maghrib: parseInt(document.getElementById('offset-maghrib')?.value, 10) || 0,
      isha: parseInt(document.getElementById('offset-isha')?.value, 10) || 0
    };

    await saveSettings({
      cityName: city,
      latitude: lat,
      longitude: lng,
      calculationMethod: method,
      asrMethod: asr,
      notificationsEnabled: notifs,
      focusDurationMinutes: focusDuration,
      snoozeMinutes: snoozeDuration,
      dailyQuranGoalMinutes: quranGoal,
      displayName,
      timeFormat,
      timingOffsets: offsets,
      language: dashboardLang
    });

    modal.style.display = 'none';
    currentSettings = await getSettings();
    cachedSchedule = await fetchPrayerTimings(true);
    await initDashboard();
  });
}

async function openSettingsModal() {
  const modal = document.getElementById('settings-modal');
  if (!modal) return;
  const settings = await getSettings();

  document.getElementById('setting-city').value = settings.cityName;
  document.getElementById('setting-lat').value = settings.latitude;
  document.getElementById('setting-lng').value = settings.longitude;
  document.getElementById('setting-method').value = String(settings.calculationMethod);
  document.getElementById('setting-asr').value = String(settings.asrMethod);
  document.getElementById('setting-notifications').checked = settings.notificationsEnabled;
  document.getElementById('setting-focus-duration').value = settings.focusDurationMinutes;
  document.getElementById('setting-snooze-duration').value = settings.snoozeMinutes;
  document.getElementById('setting-quran-goal').value = settings.dailyQuranGoalMinutes;
  document.getElementById('setting-display-name').value = settings.displayName;

  if (document.getElementById('setting-time-format')) {
    document.getElementById('setting-time-format').value = settings.timeFormat || '12h';
  }
  const offsets = settings.timingOffsets || {};
  ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach((p) => {
    const el = document.getElementById(`offset-${p}`);
    if (el) el.value = offsets[p] || 0;
  });

  modal.style.display = 'flex';
}

async function refreshAllPrayerViews() {
  cachedSchedule = await fetchPrayerTimings();
  await renderPrayerCards(cachedSchedule);
  await loadTodayProgress();
  await initCalendar();
}

document.addEventListener('DOMContentLoaded', initDashboard);
