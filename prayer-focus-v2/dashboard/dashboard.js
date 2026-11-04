import { getDhakaDateString, formatBengaliDate, formatBengaliTime, toBengaliNumerals, getDhakaNow } from '../modules/timezone.js';
import { getSettings, saveSettings } from '../modules/storage.js';
import { fetchPrayerTimings, calculateNextPrayer, PRAYER_NAMES } from '../modules/prayer-api.js';
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

let countdownTimer = null;
let liveClockInterval = null;
let quranInterval = null;
let quranStartTime = null;
let quranAccumulatedSeconds = 0;
let quranIsRunning = false;

// Calendar State
let currentCalYear = 2026;
let currentCalMonth = 11; // 1-12
let dashboardLang = 'en'; // English is default

async function initDashboard() {
  const dhakaNow = getDhakaNow();
  currentCalYear = dhakaNow.getFullYear();
  currentCalMonth = dhakaNow.getMonth() + 1;

  setupLanguageToggle();
  setupLiveClock();
  await loadHeaderAndSettings();
  await loadDailyQuote();
  await loadPrayerTimingsAndCountdown();
  await loadTodayProgress();
  await initQuranTimer();
  await initCalendar();
  setupSettingsModal();

  // If hash is #settings, open settings directly
  if (window.location.hash === '#settings') {
    openSettingsModal();
  }
}

function setupLanguageToggle() {
  const btnEn = document.getElementById('lang-btn-en');
  const btnBn = document.getElementById('lang-btn-bn');

  if (btnEn && btnBn) {
    btnEn.onclick = async () => {
      dashboardLang = 'en';
      btnEn.style.background = '#10b981';
      btnEn.style.color = '#022c22';
      btnBn.style.background = 'transparent';
      btnBn.style.color = '#a7f3d0';
      await loadDailyQuote();
    };

    btnBn.onclick = async () => {
      dashboardLang = 'bn';
      btnBn.style.background = '#10b981';
      btnBn.style.color = '#022c22';
      btnEn.style.background = 'transparent';
      btnEn.style.color = '#a7f3d0';
      await loadDailyQuote();
    };
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
  const settings = await getSettings();
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
  const schedule = await fetchPrayerTimings();
  const syncInfoEl = document.getElementById('sync-info');

  if (schedule) {
    if (syncInfoEl) {
      if (schedule.isHardFallback) {
        syncInfoEl.textContent = 'অফলাইন স্ট্যান্ডার্ড সময়সূচি (Chattogram)';
      } else if (schedule.isCachedFallback) {
        syncInfoEl.textContent = 'সংরক্ষিত অফলাইন সময়সূচি (ক্যাশ)';
      } else {
        syncInfoEl.textContent = `সিঙ্ক সম্পন্ন (${schedule.methodName})`;
      }
    }

    renderPrayerCards(schedule);
    startBannerCountdown(schedule);
  }
}

async function renderPrayerCards(schedule) {
  const container = document.getElementById('prayer-cards-container');
  if (!container || !schedule || !schedule.timings) return;
  container.innerHTML = '';

  const todayStr = getDhakaDateString();
  const record = await getPrayerRecordForDate(todayStr);
  const nextInfo = calculateNextPrayer(schedule);

  PRAYER_LIST.forEach((key) => {
    const time = schedule.timings[key] || '--:--';
    const info = PRAYER_NAMES[key];
    const status = record[key] || 'none';
    const isCurrent = nextInfo && nextInfo.current && nextInfo.current.key === key;

    const card = document.createElement('div');
    card.className = `prayer-card ${isCurrent ? 'current-active' : ''}`;

    card.innerHTML = `
      <div>
        <div class="pc-name-bn">${info.bn}</div>
        <div class="pc-name-ar">${info.ar}</div>
      </div>
      <div class="pc-time">${toBengaliNumerals(time)}</div>
      <div class="pc-actions">
        <button class="action-status-btn ${status === 'prayed' ? 'selected-prayed' : ''}" data-status="prayed">
          পড়েছি
        </button>
        <button class="action-status-btn ${status === 'missed' ? 'selected-missed' : ''}" data-status="missed">
          ছুটেছে
        </button>
      </div>
    `;

    // Action handlers for real recording
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
  const countEl = document.getElementById('banner-countdown');

  const update = () => {
    const nextInfo = calculateNextPrayer(schedule);
    if (!nextInfo || !nextInfo.next) return;

    const next = nextInfo.next;
    if (nameEl) nameEl.textContent = `${next.name} (${next.arabicName})`;
    if (timeEl) timeEl.textContent = `ওয়াক্ত শুরু: ${toBengaliNumerals(next.time)}`;

    const remaining = Math.max(0, next.epoch - Date.now());
    const totalSec = Math.floor(remaining / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    const formatted = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    if (countEl) countEl.textContent = toBengaliNumerals(formatted);
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

  if (!stats.hasActivity) {
    contentEl.innerHTML = `
      <div class="empty-data-msg">
        আজকের কোনো কার্যক্রম এখনো রেকর্ড করা হয়নি।
      </div>
    `;
    return;
  }

  contentEl.innerHTML = `
    <div class="stats-grid-row">
      <div class="stat-pill">
        <div class="stat-num">${toBengaliNumerals(stats.prayedCount)}/৫</div>
        <div class="stat-title">ওয়াক্ত আদায়</div>
      </div>
      <div class="stat-pill">
        <div class="stat-num">${toBengaliNumerals(stats.missedCount)}</div>
        <div class="stat-title">ছুটে গেছে</div>
      </div>
      <div class="stat-pill">
        <div class="stat-num">${toBengaliNumerals(stats.percentage)}%</div>
        <div class="stat-title">দৈনিক সম্পন্ন</div>
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

  const settings = await getSettings();
  const goalEl = document.getElementById('quran-goal-display');
  if (goalEl) goalEl.textContent = `${toBengaliNumerals(settings.dailyQuranGoalMinutes)} মিনিট`;

  await updateQuranStatsDisplay();

  // Restore active timer state across reload
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
    if (session) {
      alert(`মাশাআল্লাহ! ${toBengaliNumerals(session.durationMinutes)} মিনিটের তিলাওয়াত রেকর্ড করা হয়েছে।`);
    }
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
  if (el) el.textContent = toBengaliNumerals(str);
}

async function updateQuranStatsDisplay() {
  const stats = await getQuranReadingStats();
  const todayEl = document.getElementById('quran-today-mins');
  const totalEl = document.getElementById('quran-total-mins');

  if (todayEl) todayEl.textContent = `${toBengaliNumerals(stats.todayMinutes)} মিনিট`;
  if (totalEl) totalEl.textContent = `${toBengaliNumerals(stats.totalMinutes)} মিনিট`;
}

// 7. Interactive Monthly Calendar
async function initCalendar() {
  const calLabel = document.getElementById('cal-current-label');
  const container = document.getElementById('calendar-days-container');
  const detailContainer = document.getElementById('calendar-day-detail');

  const monthNamesBn = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  const refreshCalendar = async () => {
    if (calLabel) {
      calLabel.textContent = `${monthNamesBn[currentCalMonth - 1]} ${toBengaliNumerals(currentCalYear)}`;
    }
    await renderMonthlyCalendar(container, currentCalYear, currentCalMonth, (dateStr, rec) => {
      renderDateDetails(detailContainer, dateStr, rec);
    });
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

  openBtn?.addEventListener('click', openSettingsModal);
  closeBtn?.addEventListener('click', () => modal.style.display = 'none');
  cancelBtn?.addEventListener('click', () => modal.style.display = 'none');

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
      timingOffsets: offsets
    });

    modal.style.display = 'none';
    await fetchPrayerTimings(true);
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
  const schedule = await fetchPrayerTimings();
  await renderPrayerCards(schedule);
  await loadTodayProgress();
  await initCalendar();
}

document.addEventListener('DOMContentLoaded', initDashboard);
