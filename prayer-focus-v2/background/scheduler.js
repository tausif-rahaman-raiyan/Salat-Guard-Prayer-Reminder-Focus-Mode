import { getDhakaDateString } from '../modules/timezone.js';
import { fetchPrayerTimings, calculateNextPrayer } from '../modules/prayer-api.js';
import { getSettings } from '../modules/storage.js';
import { createPrayerSession, getActiveSession } from './session-manager.js';
import { showDesktopNotification } from './notification-manager.js';

export const PRAYER_CHECK_ALARM = 'prayer_check_timer';

/**
 * Registers chrome.alarms for background monitoring
 */
export function setupAlarms() {
  if (typeof chrome !== 'undefined' && chrome.alarms) {
    chrome.alarms.create(PRAYER_CHECK_ALARM, {
      periodInMinutes: 1 // Check every 1 minute
    });
  }
}

/**
 * Performs prayer time transition check
 */
export async function checkPrayerSchedule(broadcast = true) {
  const settings = await getSettings();
  if (!settings.notificationsEnabled) return;

  const schedule = await fetchPrayerTimings();
  if (!schedule || !schedule.timings) return;

  const todayStr = getDhakaDateString();
  const nextInfo = calculateNextPrayer(schedule);
  if (!nextInfo) return;

  const currentPrayer = nextInfo.current;
  const now = Date.now();

  // If current prayer started within the last prayerWindowDurationMinutes (e.g. 45 mins)
  if (currentPrayer && !currentPrayer.isYesterday) {
    const windowMs = (settings.prayerWindowDurationMinutes || 45) * 60 * 1000;
    const elapsed = now - currentPrayer.epoch;

    if (elapsed >= 0 && elapsed <= windowMs) {
      const activeSession = await getActiveSession();
      const prayerSessionId = `${todayStr}_${currentPrayer.key}_${currentPrayer.epoch}`;

      // If no session exists yet for this prayer window
      if (!activeSession || activeSession.id !== prayerSessionId) {
        // Create session
        await createPrayerSession(todayStr, currentPrayer.key, currentPrayer.epoch);

        // Show desktop notification as backup
        showDesktopNotification(
          `এখন ${currentPrayer.name} নামাজের ওয়াক্ত`,
          'দুনিয়ার কাজ কিছুক্ষণের জন্য থামিয়ে আল্লাহর ডাকে সাড়া দাও।'
        );

        if (broadcast) {
          notifyOpenTabsToShowOverlay();
        }
      }
    }
  }
}

/**
 * Sends message to open content script tabs to display the overlay
 */
export function notifyOpenTabsToShowOverlay() {
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        if (tab.id && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
          chrome.tabs.sendMessage(tab.id, { action: 'CHECK_OVERLAY' }, () => {
            // Ignore error on unsupported tabs
            if (chrome.runtime.lastError) { /* ignore */ }
          });
        }
      }
    });
  }
}
