import { getDhakaDateString } from './timezone.js';
import { getStorageData, setStorageData } from './storage.js';

export const PRAYER_LIST = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

/**
 * Gets recorded prayer data for a date. Empty records if none exist.
 */
export async function getPrayerRecordForDate(dateStr = getDhakaDateString()) {
  const key = `prayer_log_${dateStr}`;
  const data = await getStorageData(key);
  return data[key] || {
    date: dateStr,
    fajr: 'none',
    dhuhr: 'none',
    asr: 'none',
    maghrib: 'none',
    isha: 'none',
    updatedAt: null
  };
}

/**
 * Sets a prayer status: 'prayed' | 'missed' | 'none'
 */
export async function recordPrayerStatus(dateStr, prayerKey, status) {
  if (!PRAYER_LIST.includes(prayerKey)) {
    throw new Error(`Invalid prayer key: ${prayerKey}`);
  }
  const key = `prayer_log_${dateStr}`;
  const current = await getPrayerRecordForDate(dateStr);
  const updated = {
    ...current,
    [prayerKey]: status,
    updatedAt: Date.now()
  };

  await setStorageData({ [key]: updated });
  return updated;
}

/**
 * Computes today's prayer statistics strictly from actual user activity
 */
export async function getTodayStats(dateStr = getDhakaDateString()) {
  const record = await getPrayerRecordForDate(dateStr);
  let prayedCount = 0;
  let missedCount = 0;
  let recordedCount = 0;

  PRAYER_LIST.forEach((p) => {
    if (record[p] === 'prayed') {
      prayedCount++;
      recordedCount++;
    } else if (record[p] === 'missed') {
      missedCount++;
      recordedCount++;
    }
  });

  return {
    date: dateStr,
    prayedCount,
    missedCount,
    recordedCount,
    hasActivity: recordedCount > 0,
    percentage: Math.round((prayedCount / 5) * 100),
    record
  };
}

/**
 * Computes monthly statistics strictly from actual records
 */
export async function getMonthlyStats(year, month) {
  // Format year and month as YYYY-MM
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const daysInMonth = new Date(year, month, 0).getDate();
  
  const keysToFetch = [];
  for (let d = 1; d <= daysInMonth; d++) {
    keysToFetch.push(`prayer_log_${monthPrefix}-${String(d).padStart(2, '0')}`);
  }

  const stored = await getStorageData(keysToFetch);
  const dailyRecords = {};
  let totalPrayed = 0;
  let totalMissed = 0;
  let totalRecordedDays = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = `${monthPrefix}-${String(d).padStart(2, '0')}`;
    const rec = stored[`prayer_log_${dayStr}`] || {
      date: dayStr,
      fajr: 'none',
      dhuhr: 'none',
      asr: 'none',
      maghrib: 'none',
      isha: 'none'
    };
    dailyRecords[dayStr] = rec;

    let dayRecorded = false;
    PRAYER_LIST.forEach((p) => {
      if (rec[p] === 'prayed') {
        totalPrayed++;
        dayRecorded = true;
      } else if (rec[p] === 'missed') {
        totalMissed++;
        dayRecorded = true;
      }
    });
    if (dayRecorded) totalRecordedDays++;
  }

  return {
    year,
    month,
    monthPrefix,
    totalPrayed,
    totalMissed,
    totalRecordedDays,
    dailyRecords
  };
}
