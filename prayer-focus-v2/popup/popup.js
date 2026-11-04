import { fetchPrayerTimings, calculateNextPrayer, getPrayerWindows, formatDisplayTime, applyTimeOffset, PRAYER_NAMES } from '../modules/prayer-api.js';
import { getSettings, saveSettings } from '../modules/storage.js';
import { toBengaliNumerals } from '../modules/timezone.js';

let countdownTimer = null;
let currentLang = 'en';

const POPUP_I18N = {
  en: {
    nextPrayer: "Next Prayer",
    timeLeft: "Time Left:",
    openDashboard: "Open Dashboard",
    settings: "Settings",
    active: "Active",
    disabled: "Disabled",
    limitPrefix: "Until"
  },
  bn: {
    nextPrayer: "পরবর্তী ওয়াক্ত",
    timeLeft: "সময় বাকি:",
    openDashboard: "ড্যাশবোর্ড খুলুন",
    settings: "সেটিংস",
    active: "রিমাইন্ডার সক্রিয়",
    disabled: "বন্ধ রয়েছে",
    limitPrefix: "পর্যন্ত"
  }
};

async function initPopup() {
  const settings = await getSettings();
  currentLang = settings.language || 'en';

  setupPopupLanguageToggle();
  await refreshPopupUI();

  // Hook button handlers
  document.getElementById('btn-open-dashboard')?.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
    } else {
      window.open('../dashboard/dashboard.html', '_blank');
    }
  });

  document.getElementById('btn-open-settings')?.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html#settings') });
    } else {
      window.open('../dashboard/dashboard.html#settings', '_blank');
    }
  });
}

function setupPopupLanguageToggle() {
  const btnEn = document.getElementById('btn-popup-en');
  const btnBn = document.getElementById('btn-popup-bn');

  const updateToggleStyle = () => {
    if (btnEn && btnBn) {
      if (currentLang === 'en') {
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

  updateToggleStyle();

  btnEn?.addEventListener('click', async () => {
    if (currentLang === 'en') return;
    currentLang = 'en';
    await saveSettings({ language: 'en' });
    updateToggleStyle();
    await refreshPopupUI();
  });

  btnBn?.addEventListener('click', async () => {
    if (currentLang === 'bn') return;
    currentLang = 'bn';
    await saveSettings({ language: 'bn' });
    updateToggleStyle();
    await refreshPopupUI();
  });
}

async function refreshPopupUI() {
  const settings = await getSettings();
  const dict = POPUP_I18N[currentLang];

  // Set location label
  const locEl = document.getElementById('location-label');
  if (locEl) locEl.textContent = `${settings.cityName} (${settings.timezone})`;

  // Notifications status
  const statusEl = document.getElementById('status-label');
  if (statusEl) {
    statusEl.textContent = settings.notificationsEnabled ? dict.active : dict.disabled;
  }

  // Label updates
  const labelNext = document.getElementById('label-next-prayer');
  if (labelNext) labelNext.textContent = dict.nextPrayer;

  const labelTimeLeft = document.getElementById('label-time-left');
  if (labelTimeLeft) labelTimeLeft.textContent = dict.timeLeft;

  const labelOpenDash = document.getElementById('label-open-dashboard');
  if (labelOpenDash) labelOpenDash.textContent = dict.openDashboard;

  const labelOpenSet = document.getElementById('label-open-settings');
  if (labelOpenSet) labelOpenSet.textContent = dict.settings;

  // Load schedule
  const schedule = await fetchPrayerTimings();
  if (schedule && schedule.timings) {
    const offsets = settings.timingOffsets || {};
    const fmt = settings.timeFormat || '12h';
    const windows = getPrayerWindows(schedule, offsets, fmt);

    for (const [key, rawTime] of Object.entries(schedule.timings)) {
      const timeEl = document.getElementById(`time-${key}`);
      const nameEl = document.getElementById(`name-${key}`);
      const limitEl = document.getElementById(`limit-${key}`);

      if (nameEl && PRAYER_NAMES[key]) {
        nameEl.textContent = currentLang === 'en' ? PRAYER_NAMES[key].en : PRAYER_NAMES[key].bn;
      }

      if (timeEl) {
        const offset = offsets[key] || 0;
        const adjusted = applyTimeOffset(rawTime, offset);
        const formatted = formatDisplayTime(adjusted, fmt);
        timeEl.textContent = currentLang === 'bn' ? toBengaliNumerals(formatted) : formatted;
      }

      if (limitEl && windows[key]) {
        const win = windows[key];
        const endFmt = win.end;
        limitEl.textContent = currentLang === 'bn' 
          ? `সীমা: ${toBengaliNumerals(endFmt)}`
          : `Limit: ${endFmt}`;
      }
    }

    startLiveCountdown(schedule, settings);
  }
}

function startLiveCountdown(schedule, settings = {}) {
  if (countdownTimer) clearInterval(countdownTimer);
  const offsets = settings.timingOffsets || {};
  const fmt = settings.timeFormat || '12h';

  const update = () => {
    const nextInfo = calculateNextPrayer(schedule, offsets);
    if (!nextInfo || !nextInfo.next) return;

    const next = nextInfo.next;
    const nameEl = document.getElementById('next-prayer-name');
    const timeEl = document.getElementById('next-prayer-time');
    const limitEl = document.getElementById('next-prayer-limit');
    const countEl = document.getElementById('countdown-text');

    if (nameEl) {
      nameEl.textContent = currentLang === 'bn' ? `${next.name} (${next.arabicName})` : `${next.nameEn} (${next.arabicName})`;
    }
    if (timeEl) {
      const formatted = formatDisplayTime(next.time, fmt);
      timeEl.textContent = currentLang === 'bn' ? toBengaliNumerals(formatted) : formatted;
    }
    if (limitEl) {
      const winStr = currentLang === 'bn' ? next.windowBn : next.windowEn;
      const limitLabel = currentLang === 'bn' ? next.limitBn : next.limitEn;
      limitEl.textContent = currentLang === 'bn'
        ? `সময়সীমা: ${toBengaliNumerals(winStr)} (${limitLabel})`
        : `Time Window: ${winStr} (${limitLabel})`;
    }

    // Present Salah / Current Window banner
    const presentBanner = document.getElementById('present-prayer-banner');
    const presentTitle = document.getElementById('present-prayer-title');
    const presentRange = document.getElementById('present-prayer-time-range');
    if (presentBanner && presentTitle && presentRange) {
      if (nextInfo.current) {
        const cur = nextInfo.current;
        const curName = currentLang === 'bn' ? cur.name : cur.nameEn;
        const curWin = currentLang === 'bn' ? toBengaliNumerals(cur.windowBn || '') : (cur.windowEn || '');
        presentBanner.style.display = 'flex';
        presentTitle.textContent = `${currentLang === 'bn' ? 'বর্তমান ওয়াক্ত:' : 'Present Window:'} ${curName}`;
        presentRange.textContent = curWin;
      } else {
        presentBanner.style.display = 'none';
      }
    }

    // Highlight current active prayer in grid
    document.querySelectorAll('.grid-item').forEach((item) => {
      if (nextInfo.current && item.getAttribute('data-key') === nextInfo.current.key) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    const diff = Math.max(0, next.epoch - Date.now());
    const totalSec = Math.floor(diff / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    const formatted = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    if (countEl) countEl.textContent = currentLang === 'bn' ? toBengaliNumerals(formatted) : formatted;
  };

  update();
  countdownTimer = setInterval(update, 1000);
}

document.addEventListener('DOMContentLoaded', initPopup);
