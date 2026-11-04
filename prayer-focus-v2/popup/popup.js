import { fetchPrayerTimings, calculateNextPrayer } from '../modules/prayer-api.js';
import { getSettings } from '../modules/storage.js';
import { toBengaliNumerals } from '../modules/timezone.js';

let countdownTimer = null;

async function initPopup() {
  const settings = await getSettings();
  
  // Set location label
  const locEl = document.getElementById('location-label');
  if (locEl) locEl.textContent = `${settings.cityName} (${settings.timezone})`;

  // Notifications status
  const statusEl = document.getElementById('status-label');
  if (statusEl) {
    statusEl.textContent = settings.notificationsEnabled ? 'রিমাইন্ডার সক্রিয়' : 'বন্ধ রয়েছে';
  }

  // Load schedule
  const schedule = await fetchPrayerTimings();
  if (schedule && schedule.timings) {
    // Populate grid
    for (const [key, time] of Object.entries(schedule.timings)) {
      const el = document.getElementById(`time-${key}`);
      if (el) el.textContent = toBengaliNumerals(time);
    }

    startLiveCountdown(schedule);
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

function startLiveCountdown(schedule) {
  if (countdownTimer) clearInterval(countdownTimer);

  const update = () => {
    const nextInfo = calculateNextPrayer(schedule);
    if (!nextInfo || !nextInfo.next) return;

    const next = nextInfo.next;
    const nameEl = document.getElementById('next-prayer-name');
    const timeEl = document.getElementById('next-prayer-time');
    const countEl = document.getElementById('countdown-text');

    if (nameEl) nameEl.textContent = next.name;
    if (timeEl) timeEl.textContent = toBengaliNumerals(next.time);

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
