import { getStorageData, setStorageData } from '../modules/storage.js';

const SESSION_KEY = 'active_prayer_session';

/**
 * Session States:
 * 'scheduled' | 'notified' | 'snoozed' | 'focus_active' | 'completed' | 'expired'
 */

export async function getActiveSession() {
  const data = await getStorageData([SESSION_KEY]);
  return data[SESSION_KEY] || null;
}

export async function setActiveSession(session) {
  await setStorageData({ [SESSION_KEY]: session });
}

export async function clearSession() {
  await setStorageData({ [SESSION_KEY]: null });
}

/**
 * Creates or retrieves session idempotently
 */
export async function createPrayerSession(dateStr, prayerKey, prayerEpoch) {
  const sessionId = `${dateStr}_${prayerKey}_${prayerEpoch}`;
  const current = await getActiveSession();

  if (current && current.id === sessionId) {
    return current;
  }

  const newSession = {
    id: sessionId,
    date: dateStr,
    prayerKey,
    prayerEpoch,
    state: 'notified',
    notifiedAt: Date.now(),
    snoozeUntil: null,
    focusStart: null,
    focusEnd: null
  };

  await setActiveSession(newSession);
  return newSession;
}

/**
 * BUTTON 1 handler: User clicked "✓ আমি নামাজে যাচ্ছি"
 * Starts 8-minute focus session
 */
export async function startFocusSession(durationMinutes = 8) {
  const current = await getActiveSession();
  const now = Date.now();
  const endMs = now + durationMinutes * 60 * 1000;

  const updated = {
    ...(current || {}),
    state: 'focus_active',
    focusStart: now,
    focusEnd: endMs,
    snoozeUntil: null
  };

  await setActiveSession(updated);
  return updated;
}

/**
 * BUTTON 2 handler: User clicked "৫ মিনিট পরে মনে করিয়ে দিন"
 * Snoozes reminder for 5 minutes
 */
export async function snoozeSession(snoozeMinutes = 5) {
  const current = await getActiveSession();
  const now = Date.now();
  const snoozeUntil = now + snoozeMinutes * 60 * 1000;

  const updated = {
    ...(current || {}),
    state: 'snoozed',
    snoozeUntil,
    focusStart: null,
    focusEnd: null
  };

  await setActiveSession(updated);
  return updated;
}

/**
 * Checks if the focus session is currently active and valid
 */
export function isFocusSessionActive(session) {
  if (!session) return false;
  if (session.state !== 'focus_active') return false;
  if (!session.focusEnd) return false;
  return Date.now() < session.focusEnd;
}

/**
 * Checks if reminder popup should be displayed right now
 */
export function shouldShowReminderOverlay(session) {
  if (!session) return false;
  const now = Date.now();

  // If focus session is active, show focus blocking screen
  if (session.state === 'focus_active' && now < session.focusEnd) {
    return { show: true, type: 'focus', remainingMs: session.focusEnd - now };
  }

  // If snoozed and snooze period has passed, show reminder again
  if (session.state === 'snoozed') {
    if (session.snoozeUntil && now >= session.snoozeUntil) {
      return { show: true, type: 'reminder' };
    }
    return { show: false, reason: 'snoozed' };
  }

  // If notified and not answered
  if (session.state === 'notified') {
    return { show: true, type: 'reminder' };
  }

  return { show: false };
}
