export type PrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerTimeInfo {
  name: string;
  arabicName: string;
  key: PrayerKey;
  time: string; // HH:mm format
  timestamp: number;
}

export interface PrayerRecord {
  date: string; // YYYY-MM-DD in Asia/Dhaka
  prayers: Record<PrayerKey, 'prayed' | 'missed' | 'none'>;
}

export interface QuranSession {
  id: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  timestamp: number;
}

export interface Settings {
  cityName: string;
  latitude: number;
  longitude: number;
  timezone: string;
  calculationMethod: number; // 1 for University of Islamic Sciences, Karachi, etc.
  asrMethod: number; // 0 for Shafi, 1 for Hanafi
  notificationsEnabled: boolean;
  snoozeMinutes: number;
  focusDurationMinutes: number;
  displayName: string;
  theme: 'emerald' | 'navy';
  dailyQuranGoalMinutes: number;
}

export interface QuoteItem {
  id: number;
  text: string;
  reference: string;
  type: 'quran' | 'hadith' | 'reminder';
}
