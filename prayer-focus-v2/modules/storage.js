/**
 * Chrome Storage Wrapper for local settings, prayer logs, and state
 */
export const DEFAULT_SETTINGS = {
  cityName: 'Chattogram, Bangladesh',
  latitude: 22.3569,
  longitude: 91.7832,
  timezone: 'Asia/Dhaka',
  calculationMethod: 1, // University of Islamic Sciences, Karachi
  asrMethod: 1, // 1 = Hanafi, 0 = Shafi/Standard
  notificationsEnabled: true,
  snoozeMinutes: 5,
  focusDurationMinutes: 8,
  prayerWindowDurationMinutes: 45,
  displayName: 'মুসাফির',
  theme: 'emerald',
  dailyQuranGoalMinutes: 15,
  timeFormat: '12h', // '12h' or '24h'
  timingOffsets: {
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0
  }
};

export async function getStorageData(keys) {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (res) => resolve(res || {}));
    });
  }
  // Fallback for testing environment / browser demo
  const result = {};
  const keyList = Array.isArray(keys) ? keys : [keys];
  for (const k of keyList) {
    const raw = localStorage.getItem(`pf_${k}`);
    if (raw) {
      try {
        result[k] = JSON.parse(raw);
      } catch {
        result[k] = raw;
      }
    }
  }
  return result;
}

export async function setStorageData(items) {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return new Promise((resolve) => {
      chrome.storage.local.set(items, () => resolve());
    });
  }
  for (const [k, v] of Object.entries(items)) {
    localStorage.setItem(`pf_${k}`, JSON.stringify(v));
  }
}

export async function getSettings() {
  const data = await getStorageData('settings');
  return { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
}

export async function saveSettings(newSettings) {
  const current = await getSettings();
  const updated = { ...current, ...newSettings };
  await setStorageData({ settings: updated });
  return updated;
}
