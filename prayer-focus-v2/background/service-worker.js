import { setupAlarms, PRAYER_CHECK_ALARM, checkPrayerSchedule, notifyOpenTabsToShowOverlay } from './scheduler.js';
import { getActiveSession, startFocusSession, snoozeSession, shouldShowReminderOverlay } from './session-manager.js';
import { fetchPrayerTimings } from '../modules/prayer-api.js';
import { getDailyQuote } from '../modules/quotes.js';
import { getDhakaDateString } from '../modules/timezone.js';
import { getSettings } from '../modules/storage.js';

// Synchronous event listener registrations
if (typeof chrome !== 'undefined') {
  // Install & Startup Lifecycle
  chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('[Prayer Focus] Extension Installed / Updated:', details.reason);
    setupAlarms();
    await fetchPrayerTimings(true);
    await checkPrayerSchedule(false);
  });

  chrome.runtime.onStartup.addListener(async () => {
    console.log('[Prayer Focus] Browser started up.');
    setupAlarms();
    await checkPrayerSchedule(false);
  });

  // Alarms trigger
  if (chrome.alarms) {
    chrome.alarms.onAlarm.addListener(async (alarm) => {
      if (alarm.name === PRAYER_CHECK_ALARM) {
        await checkPrayerSchedule(true);
      }
    });
  }

  // Communication with content scripts, popup, and dashboard
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const handleAsync = async () => {
      if (request.action === 'GET_OVERLAY_STATE') {
        const session = await getActiveSession();
        const check = shouldShowReminderOverlay(session);
        const todayStr = getDhakaDateString();
        const settings = await getSettings();
        const userLang = settings.language || 'en';
        const quote = getDailyQuote(todayStr, userLang);

        sendResponse({
          ...check,
          session,
          quote,
          settings
        });
      } else if (request.action === 'ACTION_PRAY') {
        // User clicked "আমি নামাজে যাচ্ছি"
        const settings = await getSettings();
        const duration = settings.focusDurationMinutes || 8;
        const session = await startFocusSession(duration);
        notifyOpenTabsToShowOverlay();
        sendResponse({ success: true, session });
      } else if (request.action === 'ACTION_SNOOZE') {
        // User clicked "৫ মিনিট পরে মনে করিয়ে দিন"
        const settings = await getSettings();
        const snoozeMin = settings.snoozeMinutes || 5;
        const session = await snoozeSession(snoozeMin);
        notifyOpenTabsToShowOverlay();
        sendResponse({ success: true, session });
      } else if (request.action === 'TRIGGER_TEST_REMINDER') {
        // For testing purposes
        const session = {
          id: `test_${Date.now()}`,
          date: getDhakaDateString(),
          prayerKey: request.prayerKey || 'dhuhr',
          prayerEpoch: Date.now(),
          state: 'notified',
          notifiedAt: Date.now(),
          snoozeUntil: null,
          focusStart: null,
          focusEnd: null
        };
        const { setActiveSession } = await import('./session-manager.js');
        await setActiveSession(session);
        notifyOpenTabsToShowOverlay();
        sendResponse({ success: true, session });
      }
    };

    handleAsync();
    return true; // Keep message channel open for async response
  });
}
