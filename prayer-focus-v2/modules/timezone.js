/**
 * Timezone helpers for Asia/Dhaka (UTC+6, no DST)
 */
export const DHAKA_TIMEZONE = 'Asia/Dhaka';

/**
 * Returns current Date adjusted to Asia/Dhaka timezone representation
 */
export function getDhakaNow() {
  const now = new Date();
  const dhakaString = now.toLocaleString('en-US', { timeZone: DHAKA_TIMEZONE });
  return new Date(dhakaString);
}

/**
 * Returns today's date formatted as YYYY-MM-DD in Asia/Dhaka
 */
export function getDhakaDateString(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: DHAKA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(date);
}

/**
 * Format date in Bengali readable form
 */
export function formatBengaliDate(date = new Date()) {
  const options = {
    timeZone: DHAKA_TIMEZONE,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return new Intl.DateTimeFormat('bn-BD', options).format(date);
}

/**
 * Format time in 12-hour or 24-hour Bengali format
 */
export function formatBengaliTime(date = new Date()) {
  const options = {
    timeZone: DHAKA_TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  return new Intl.DateTimeFormat('bn-BD', options).format(date);
}

/**
 * Convert English digits to Bengali digits
 */
export function toBengaliNumerals(num) {
  if (num === undefined || num === null) return '';
  const str = String(num);
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[0-9]/g, (w) => bengaliDigits[+w]);
}

/**
 * Converts a HH:mm prayer time string on a given date to an exact epoch timestamp in Dhaka time
 */
export function getPrayerEpoch(dateStr, timeStr) {
  // dateStr is YYYY-MM-DD, timeStr is HH:mm (or HH:mm (BST))
  const cleanTime = timeStr.split(' ')[0].trim();
  const [hours, minutes] = cleanTime.split(':').map(Number);
  
  // Format as ISO string in Asia/Dhaka +06:00
  const isoStr = `${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+06:00`;
  return new Date(isoStr).getTime();
}
