import { fetchPrayerTimings, calculateNextPrayer, formatDisplayTime, applyTimeOffset } from '../modules/prayer-api.js';
import { getSettings } from '../modules/storage.js';
import { toBengaliNumerals } from '../modules/timezone.js';

let countdownTimer = null;

async function initPopup() {
  const settings = await getSettings();
  const lang = settings.language || 'en';
  
  // Set location label
  const locEl = document.getElementById('location-label');
  if (locEl) locEl.textContent = `${settings.cityName} (${settings.timezone})`;

  // Notifications status
  const statusEl = document.getElementById('status-label');
  if (statusEl) {
    if (lang === 'bn') {
      statusEl.textContent = settings.notificationsEnabled ? 'রিমাইন্ডার সক্রিয়' : 'বন্ধ রয়েছে';
    } else {
      statusEl.textContent = settings.notificationsEnabled ? 'Active' : 'Disabled';
    }
  }

  // Load schedule
  const schedule = await fetchPrayerTimings();
  if (schedule && schedule.timings) {
    // Populate grid
    const offsets = settings.timingOffsets || {};
    const fmt = settings.timeFormat || '12h';

    for (const [key, rawTime] of Object.entries(schedule.timings)) {
      const el = document.getElementById(`time-${key}`);
      if (el) {
        const offset = offsets[key] || 0;
        const adjusted = applyTimeOffset(rawTime, offset);
        const formatted = formatDisplayTime(adjusted, fmt);
        el.textContent = lang === 'bn' ? toBengaliNumerals(formatted) : formatted;
      }
    }

    startLiveCountdown(schedule, settings);
  }

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

function startLiveCountdown(schedule, settings = {}) {
  if (countdownTimer) clearInterval(countdownTimer);
  const lang = settings.language || 'en';
  const offsets = settings.timingOffsets || {};
  const fmt = settings.timeFormat || '12h';

  const update = () => {
    const nextInfo = calculateNextPrayer(schedule, offsets);
    if (!nextInfo || !nextInfo.next) return;

    const next = nextInfo.next;
    const nameEl = document.getElementById('next-prayer-name');
    const timeEl = document.getElementById('next-prayer-time');
    const countEl = document.getElementById('countdown-text');

    if (nameEl) {
      nameEl.textContent = lang === 'bn' ? next.name : next.nameEn;
    }
    if (timeEl) {
      const formatted = formatDisplayTime(next.time, fmt);
      timeEl.textContent = lang === 'bn' ? toBengaliNumerals(formatted) : formatted;
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

    const str = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    if (countEl) countEl.textContent = toBengaliNumerals(str);
  };

  update();
  countdownTimer = setInterval(update, 1000);
}

document.addEventListener('DOMContentLoaded', initPopup);
