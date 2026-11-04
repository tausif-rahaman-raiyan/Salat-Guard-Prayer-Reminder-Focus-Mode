import { getDhakaDateString } from './timezone.js';
import { getStorageData, setStorageData } from './storage.js';

const QURAN_STORAGE_KEY = 'quran_timer_sessions';
const ACTIVE_TIMER_KEY = 'quran_timer_active_state';

/**
 * Returns all recorded Quran reading sessions
 */
export async function getAllQuranSessions() {
  const data = await getStorageData([QURAN_STORAGE_KEY]);
  return data[QURAN_STORAGE_KEY] || [];
}

/**
 * Saves a completed reading session
 */
export async function saveQuranSession(durationSeconds, dateStr = getDhakaDateString()) {
  if (durationSeconds < 5) {
    // Ignore accidental clicks under 5 seconds
    return null;
  }

  const durationMinutes = Math.round((durationSeconds / 60) * 10) / 10;
  const sessions = await getAllQuranSessions();

  const newSession = {
    id: `quran_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    date: dateStr,
    durationSeconds,
    durationMinutes,
    timestamp: Date.now()
  };

  const updated = [newSession, ...sessions];
  await setStorageData({ [QURAN_STORAGE_KEY]: updated });
  await clearActiveTimerState();
  return newSession;
}

/**
 * Get total minutes read today and all-time
 */
export async function getQuranReadingStats(dateStr = getDhakaDateString()) {
  const sessions = await getAllQuranSessions();
  
  let todaySeconds = 0;
  let totalSeconds = 0;
  let todaySessionsCount = 0;

  sessions.forEach((s) => {
    totalSeconds += s.durationSeconds;
    if (s.date === dateStr) {
      todaySeconds += s.durationSeconds;
      todaySessionsCount++;
    }
  });

  return {
    todayMinutes: Math.round((todaySeconds / 60) * 10) / 10,
    totalMinutes: Math.round((totalSeconds / 60) * 10) / 10,
    todaySessionsCount,
    hasActivity: todaySessionsCount > 0,
    recentSessions: sessions.slice(0, 10)
  };
}

/**
 * Persistent Active Timer State across page reloads/browser restarts
 */
export async function getActiveTimerState() {
  const data = await getStorageData([ACTIVE_TIMER_KEY]);
  return data[ACTIVE_TIMER_KEY] || null;
}

export async function saveActiveTimerState(state) {
  await setStorageData({ [ACTIVE_TIMER_KEY]: state });
}

export async function clearActiveTimerState() {
  await setStorageData({ [ACTIVE_TIMER_KEY]: null });
}
