import { getDhakaDateString, getPrayerEpoch } from './timezone.js';
import { getStorageData, setStorageData, getSettings } from './storage.js';

export const PRAYER_NAMES = {
  fajr: { bn: 'ফজর', en: 'Fajr', ar: 'الفجر' },
  dhuhr: { bn: 'যোহর', en: 'Dhuhr', ar: 'الظهر' },
  asr: { bn: 'আসর', en: 'Asr', ar: 'العصر' },
  maghrib: { bn: 'মাগরিব', en: 'Maghrib', ar: 'المغرب' },
  isha: { bn: 'এশা', en: 'Isha', ar: 'العشاء' }
};

/**
 * Fetch timings from AlAdhan API with validation and fallback to storage cache
 */
export async function fetchPrayerTimings(forceRefresh = false) {
  const settings = await getSettings();
  const todayStr = getDhakaDateString();
  const cacheKey = `prayer_cache_${todayStr}_${settings.calculationMethod}_${settings.asrMethod}`;

  if (!forceRefresh) {
    const cached = await getStorageData([cacheKey, 'last_prayer_cache']);
    if (cached[cacheKey]) {
      return cached[cacheKey];
    }
  }

  try {
    // AlAdhan API endpoint: /v1/timingsByCity or /v1/timings
    const url = new URL(`https://api.aladhan.com/v1/timings/${todayStr}`);
    url.searchParams.append('latitude', String(settings.latitude));
    url.searchParams.append('longitude', String(settings.longitude));
    url.searchParams.append('method', String(settings.calculationMethod));
    url.searchParams.append('school', String(settings.asrMethod));
    url.searchParams.append('timezonestring', settings.timezone);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);
    const resp = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!resp.ok) {
      throw new Error(`AlAdhan API returned status ${resp.status}`);
    }

    const data = await resp.json();
    if (!data || data.code !== 200 || !data.data || !data.data.timings) {
      throw new Error('Invalid response structure from AlAdhan API');
    }

    const rawTimings = data.data.timings;
    
    // Validate each prayer timing format
    const validated = {
      date: todayStr,
      syncTime: Date.now(),
      methodName: data.data.meta?.method?.name || 'AlAdhan Method',
      timings: {
        fajr: rawTimings.Fajr.split(' ')[0],
        dhuhr: rawTimings.Dhuhr.split(' ')[0],
        asr: rawTimings.Asr.split(' ')[0],
        maghrib: rawTimings.Maghrib.split(' ')[0],
        isha: rawTimings.Isha.split(' ')[0]
      },
      sunrise: rawTimings.Sunrise ? rawTimings.Sunrise.split(' ')[0] : '06:00',
      sunset: rawTimings.Sunset ? rawTimings.Sunset.split(' ')[0] : '17:30'
    };

    // Cache the schedule
    await setStorageData({
      [cacheKey]: validated,
      last_prayer_schedule: validated,
      last_sync_timestamp: Date.now()
    });

    return validated;
  } catch (err) {
    console.warn('[Prayer Focus] Failed to fetch live prayer timings:', err.message);
    // Check fallback to any last stored schedule
    const fallback = await getStorageData(['last_prayer_schedule']);
    if (fallback.last_prayer_schedule) {
      return {
        ...fallback.last_prayer_schedule,
        isCachedFallback: true,
        fallbackError: err.message
      };
    }

    // Default Chattogram standard seasonal timings as ultimate resilience fallback
    return {
      date: todayStr,
      syncTime: null,
      isHardFallback: true,
      methodName: 'Standard Bangladesh Islamic Foundation (Chattogram)',
      timings: {
        fajr: '05:00',
        dhuhr: '11:55',
        asr: '15:15',
        maghrib: '17:35',
        isha: '18:50'
      },
      sunrise: '06:05',
      sunset: '17:35'
    };
  }
}

/**
 * Applies minute offset to a HH:mm string (e.g. +5 min or -3 min)
 */
export function applyTimeOffset(timeStr, offsetMinutes = 0) {
  if (!offsetMinutes || isNaN(offsetMinutes)) return timeStr;
  const [h, m] = timeStr.split(':').map(Number);
  const totalMin = (h * 60 + m + Number(offsetMinutes) + 1440) % 1440;
  const newH = Math.floor(totalMin / 60);
  const newM = totalMin % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

/**
 * Format time string in 12h (e.g. 5:15 AM) or 24h (17:15)
 */
export function formatDisplayTime(timeStr, format = '12h') {
  if (!timeStr || !timeStr.includes(':')) return timeStr;
  if (format === '24h') return timeStr;
  
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

/**
 * Calculates accurate prayer start and end windows (time limits) based on Islamic jurisprudence
 */
export function getPrayerWindows(schedule, offsets = {}, format = '12h') {
  if (!schedule || !schedule.timings) return {};
  const fajrRaw = applyTimeOffset(schedule.timings.fajr, offsets.fajr || 0);
  const sunriseRaw = schedule.sunrise ? schedule.sunrise.split(' ')[0] : '06:05';
  const dhuhrRaw = applyTimeOffset(schedule.timings.dhuhr, offsets.dhuhr || 0);
  const asrRaw = applyTimeOffset(schedule.timings.asr, offsets.asr || 0);
  const maghribRaw = applyTimeOffset(schedule.timings.maghrib, offsets.maghrib || 0);
  const ishaRaw = applyTimeOffset(schedule.timings.isha, offsets.isha || 0);

  const fmt = (t) => formatDisplayTime(t, format);

  return {
    fajr: {
      start: fmt(fajrRaw),
      end: fmt(sunriseRaw),
      limitEn: `Until Sunrise (${fmt(sunriseRaw)})`,
      limitBn: `সূর্যোদয় (${fmt(sunriseRaw)}) পর্যন্ত`,
      windowEn: `${fmt(fajrRaw)} – ${fmt(sunriseRaw)}`,
      windowBn: `${fmt(fajrRaw)} – ${fmt(sunriseRaw)}`
    },
    dhuhr: {
      start: fmt(dhuhrRaw),
      end: fmt(asrRaw),
      limitEn: `Until Asr (${fmt(asrRaw)})`,
      limitBn: `আসর (${fmt(asrRaw)}) পর্যন্ত`,
      windowEn: `${fmt(dhuhrRaw)} – ${fmt(asrRaw)}`,
      windowBn: `${fmt(dhuhrRaw)} – ${fmt(asrRaw)}`
    },
    asr: {
      start: fmt(asrRaw),
      end: fmt(maghribRaw),
      limitEn: `Until Maghrib (${fmt(maghribRaw)})`,
      limitBn: `মাগরিব (${fmt(maghribRaw)}) পর্যন্ত`,
      windowEn: `${fmt(asrRaw)} – ${fmt(maghribRaw)}`,
      windowBn: `${fmt(asrRaw)} – ${fmt(maghribRaw)}`
    },
    maghrib: {
      start: fmt(maghribRaw),
      end: fmt(ishaRaw),
      limitEn: `Until Isha (${fmt(ishaRaw)})`,
      limitBn: `এশা (${fmt(ishaRaw)}) পর্যন্ত`,
      windowEn: `${fmt(maghribRaw)} – ${fmt(ishaRaw)}`,
      windowBn: `${fmt(maghribRaw)} – ${fmt(ishaRaw)}`
    },
    isha: {
      start: fmt(ishaRaw),
      end: fmt(fajrRaw),
      limitEn: `Until Fajr (${fmt(fajrRaw)})`,
      limitBn: `ফজর (${fmt(fajrRaw)}) পর্যন্ত`,
      windowEn: `${fmt(ishaRaw)} – ${fmt(fajrRaw)}`,
      windowBn: `${fmt(ishaRaw)} – ${fmt(fajrRaw)}`
    }
  };
}

/**
 * Calculates current active prayer and next upcoming prayer, applying configured permanent offsets
 */
export function calculateNextPrayer(schedule, offsets = {}) {
  if (!schedule || !schedule.timings) return null;

  const now = Date.now();
  const dateStr = schedule.date;
  const windows = getPrayerWindows(schedule, offsets);

  const prayerKeys = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const list = prayerKeys.map((key) => {
    const rawTime = schedule.timings[key];
    const offsetMin = offsets[key] || 0;
    const timeStr = applyTimeOffset(rawTime, offsetMin);
    const epoch = getPrayerEpoch(dateStr, timeStr);
    const win = windows[key] || {};
    return {
      key,
      name: PRAYER_NAMES[key].bn,
      nameEn: PRAYER_NAMES[key].en,
      arabicName: PRAYER_NAMES[key].ar,
      time: timeStr,
      rawTime,
      offsetMin,
      epoch,
      limitEn: win.limitEn || '',
      limitBn: win.limitBn || '',
      windowEn: win.windowEn || '',
      windowBn: win.windowBn || ''
    };
  });

  // Find next prayer today
  let currentPrayer = null;
  let nextPrayer = null;

  for (let i = 0; i < list.length; i++) {
    if (now >= list[i].epoch) {
      currentPrayer = list[i];
    } else {
      nextPrayer = list[i];
      break;
    }
  }

  // If now is past Isha, the next prayer is Fajr tomorrow
  if (!nextPrayer) {
    // Tomorrow's Fajr
    const tomorrowEpoch = list[0].epoch + 24 * 60 * 60 * 1000;
    nextPrayer = {
      ...list[0],
      epoch: tomorrowEpoch,
      isTomorrow: true
    };
  }

  // If before Fajr today, current prayer was Isha of yesterday
  if (!currentPrayer) {
    currentPrayer = {
      ...list[4],
      epoch: list[4].epoch - 24 * 60 * 60 * 1000,
      isYesterday: true
    };
  }

  return {
    current: currentPrayer,
    next: nextPrayer,
    all: list,
    windows,
    timeRemainingMs: Math.max(0, nextPrayer.epoch - now)
  };
}
