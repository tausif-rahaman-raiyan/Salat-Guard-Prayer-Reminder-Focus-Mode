import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  Calendar,
  BookOpen,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Download,
  Settings,
  Bell,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  FileText,
  FolderGit2,
  Search
} from 'lucide-react';
import { searchGlobalCities, CityLocation } from './cities';
import { BENGALI_QUOTES, getDailyQuote } from '../prayer-focus-v2/modules/quotes.js';
import {
  getDhakaDateString,
  formatBengaliDate,
  formatBengaliTime,
  toBengaliNumerals,
  getDhakaNow,
  getPrayerEpoch
} from '../prayer-focus-v2/modules/timezone.js';
import {
  fetchPrayerTimings,
  calculateNextPrayer,
  getPrayerWindows,
  applyTimeOffset,
  formatDisplayTime,
  PRAYER_NAMES
} from '../prayer-focus-v2/modules/prayer-api.js';
import {
  getPrayerRecordForDate,
  recordPrayerStatus,
  getTodayStats,
  getMonthlyStats,
  PRAYER_LIST
} from '../prayer-focus-v2/modules/prayer-tracker.js';
import {
  saveQuranSession,
  getQuranReadingStats,
  getActiveTimerState,
  saveActiveTimerState,
  clearActiveTimerState
} from '../prayer-focus-v2/modules/quran-timer.js';
import { getSettings, saveSettings } from '../prayer-focus-v2/modules/storage.js';
import { Language, TRANSLATIONS } from './translations';
import { DocsPage } from './DocsPage';
import { GitGuidePage } from './GitGuidePage';

export default function App() {
  const [lang, setLang] = useState<Language>('en'); // Default language is English
  const t = TRANSLATIONS[lang];
  const isEn = lang === 'en';

  const [currentTime, setCurrentTime] = useState(new Date());
  const [settings, setSettings] = useState<any>({
    cityName: 'Chattogram, Bangladesh',
    latitude: 22.3569,
    longitude: 91.7832,
    timezone: 'Asia/Dhaka',
    calculationMethod: 1,
    asrMethod: 1,
    notificationsEnabled: true,
    snoozeMinutes: 5,
    focusDurationMinutes: 8,
    dailyQuranGoalMinutes: 15,
    displayName: 'Musafir'
  });

  const [schedule, setSchedule] = useState<any>(null);
  const [nextPrayerInfo, setNextPrayerInfo] = useState<any>(null);
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [todayStats, setTodayStats] = useState<any>(null);
  const [dailyQuote, setDailyQuote] = useState<any>(null);

  // Quran Timer State
  const [quranRunning, setQuranRunning] = useState(false);
  const [quranSeconds, setQuranSeconds] = useState(0);
  const [quranStats, setQuranStats] = useState<any>({ todayMinutes: 0, totalMinutes: 0, hasActivity: false });

  // Calendar State
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(11);
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [selectedDayStr, setSelectedDayStr] = useState<string>('');

  // Modals & Simulators
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSimulatedOverlay, setShowSimulatedOverlay] = useState(false);
  const [simulatedFocusSession, setSimulatedFocusSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'docs' | 'git-guide' | 'popup-preview'>('dashboard');

  // City Search & Autocomplete
  const [cityQuery, setCityQuery] = useState('');
  const [citySuggestions, setCitySuggestions] = useState<CityLocation[]>([]);
  const [isSearchingCity, setIsSearchingCity] = useState(false);

  // In-app Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const todayStr = getDhakaDateString();

  // Initialize data
  useEffect(() => {
    async function loadAll() {
      const savedSettings = await getSettings();
      setSettings(savedSettings);

      const q = getDailyQuote(todayStr, lang);
      setDailyQuote(q);

      const sched = await fetchPrayerTimings();
      setSchedule(sched);
      if (sched) {
        setNextPrayerInfo(calculateNextPrayer(sched, savedSettings.timingOffsets || {}));
      }

      const rec = await getPrayerRecordForDate(todayStr);
      setTodayRecord(rec);

      const stats = await getTodayStats(todayStr);
      setTodayStats(stats);

      const qStats = await getQuranReadingStats(todayStr);
      setQuranStats(qStats);

      const nowDhaka = getDhakaNow();
      setCalYear(nowDhaka.getFullYear());
      setCalMonth(nowDhaka.getMonth() + 1);
      setSelectedDayStr(todayStr);
    }

    loadAll();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [todayStr]);

  // Recalculate next prayer countdown every second
  useEffect(() => {
    if (!schedule) return;
    const interval = setInterval(() => {
      setNextPrayerInfo(calculateNextPrayer(schedule, settings.timingOffsets || {}));
    }, 1000);
    return () => clearInterval(interval);
  }, [schedule, settings.timingOffsets]);

  // Quran timer ticker
  useEffect(() => {
    let interval: any = null;
    if (quranRunning) {
      interval = setInterval(() => {
        setQuranSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [quranRunning]);

  // Load monthly calendar whenever year/month changes
  useEffect(() => {
    async function loadMonth() {
      const mStats = await getMonthlyStats(calYear, calMonth);
      setMonthlyData(mStats);
    }
    loadMonth();
  }, [calYear, calMonth]);

  // Handlers for prayer recording
  const handleTogglePrayer = async (key: string, targetStatus: 'prayed' | 'missed') => {
    const currentStatus = todayRecord ? todayRecord[key] : 'none';
    const newStatus = currentStatus === targetStatus ? 'none' : targetStatus;
    const updated = await recordPrayerStatus(todayStr, key, newStatus);
    setTodayRecord(updated);

    const stats = await getTodayStats(todayStr);
    setTodayStats(stats);

    const mStats = await getMonthlyStats(calYear, calMonth);
    setMonthlyData(mStats);
  };

  // Quran actions
  const handleStartQuran = () => {
    setQuranRunning(true);
  };

  const handlePauseQuran = () => {
    setQuranRunning(false);
  };

  const handleStopQuran = async () => {
    setQuranRunning(false);
    if (quranSeconds >= 5) {
      await saveQuranSession(quranSeconds);
      const qStats = await getQuranReadingStats(todayStr);
      setQuranStats(qStats);
    }
    setQuranSeconds(0);
  };

  const handleResetQuran = () => {
    setQuranRunning(false);
    setQuranSeconds(0);
  };

  const formatTimerDigits = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatMs = (ms: number) => {
    const totalSec = Math.floor(Math.max(0, ms) / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatNum = (val: any) => {
    return isEn ? String(val) : toBengaliNumerals(val);
  };

  const monthNames = isEn
    ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    : ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

  return (
    <div className="min-h-screen bg-[#021812] text-[#f0fdf4] font-sans antialiased selection:bg-emerald-500 selection:text-white pb-16">
      
      {/* Top Banner Navigation */}
      <nav className="border-b border-emerald-500/20 bg-emerald-950/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <img src="/assets/aistudio/praying_99ed162a.png" alt="Prayer Focus" className="w-9 h-9 object-contain drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-emerald-400 tracking-tight">{t.appName}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">v2.0.0</span>
              </div>
              <p className="text-xs text-emerald-300/80">{t.tagline}</p>
            </div>
          </div>

          {/* Navigation View Switcher (Clean, no GitHub Push & YAML) */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-emerald-500/20 text-xs sm:text-sm">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-300 hover:text-white'
              }`}
            >
              {t.tabDashboard}
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeTab === 'docs' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-300 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              {t.tabDocs}
            </button>
            <button
              onClick={() => setActiveTab('popup-preview')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'popup-preview' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-300 hover:text-white'
              }`}
            >
              {t.tabPopupPreview}
            </button>
            <button
              onClick={() => setActiveTab('git-guide')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeTab === 'git-guide' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-300 hover:text-white'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              {isEn ? 'GitHub & Fixes' : 'গিটহাব গাইড'}
            </button>
          </div>

          {/* Right Controls: Language Switcher, Test overlay, and Download */}
          <div className="flex items-center gap-2.5">
            {/* Bilingual Switcher */}
            <div className="flex items-center bg-black/40 p-1 rounded-xl border border-emerald-500/20 text-xs">
              <button
                onClick={() => {
                  setLang('en');
                  const q = getDailyQuote(todayStr, 'en');
                  setDailyQuote(q);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  isEn ? 'bg-emerald-500 text-emerald-950 shadow-sm' : 'text-emerald-300 hover:text-white'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => {
                  setLang('bn');
                  const q = getDailyQuote(todayStr, 'bn');
                  setDailyQuote(q);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  !isEn ? 'bg-emerald-500 text-emerald-950 shadow-sm' : 'text-emerald-300 hover:text-white'
                }`}
                title="বাংলায় পরিবর্তন করুন"
              >
                বাংলা
              </button>
            </div>

            <button
              onClick={() => setShowSimulatedOverlay(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/30 transition shadow-sm"
              title="Test prayer overlay appearance"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{t.btnTestOverlay}</span>
            </button>

            <a
              href="/prayer-focus-v2.0.0.zip"
              download="prayer-focus-v2.0.0.zip"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-emerald-950 transition shadow-md shadow-emerald-500/20"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">{t.btnDownloadZip}</span>
              <span className="md:hidden">ZIP</span>
            </a>
          </div>

        </div>
      </nav>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* TAB 1: MAIN DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Top Bar: Clock, Date, Location, Settings */}
            <header className="bg-emerald-900/25 border border-emerald-500/20 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-emerald-400 font-mono tracking-wider">
                    {isEn ? currentTime.toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka' }) : formatBengaliTime(currentTime)}
                  </div>
                  <div className="text-sm text-emerald-200/90 font-medium">
                    {isEn ? currentTime.toLocaleDateString('en-US', { timeZone: 'Asia/Dhaka', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : formatBengaliDate(currentTime)}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/20 px-3.5 py-2 rounded-xl text-xs text-emerald-300">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>{settings.cityName}</span>
                  <span className="text-emerald-500 font-mono">({settings.timezone})</span>
                </div>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-200 transition"
                >
                  <Settings className="w-4 h-4 text-emerald-400" />
                  {t.settingsTitle}
                </button>
              </div>
            </header>

            {/* Daily Wisdom Card */}
            {dailyQuote && (
              <section className="bg-gradient-to-r from-emerald-900/40 via-emerald-900/20 to-emerald-950/40 border-l-4 border-emerald-500 border-y border-r border-emerald-500/20 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {t.dailyGuidance}
                  </span>
                  <BookOpen className="w-5 h-5 text-emerald-400/80" />
                </div>
                <p className="text-xl md:text-2xl font-semibold text-white leading-relaxed mb-2">
                  "{dailyQuote.text}"
                </p>
                <p className="text-sm text-emerald-300 italic">
                  — {dailyQuote.reference}
                </p>
              </section>
            )}

            {/* Next Prayer Banner */}
            {nextPrayerInfo && (
              <section className="bg-gradient-to-br from-emerald-800/80 via-emerald-800/60 to-emerald-900/90 border border-emerald-400/30 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-bold tracking-widest uppercase text-emerald-200">
                    {t.nextPrayer}
                  </span>
                  <h2 className="text-4xl font-extrabold text-white mt-1">
                    {isEn ? nextPrayerInfo.next?.nameEn : nextPrayerInfo.next?.name}{' '}
                    <span className="text-2xl font-arabic text-emerald-300">
                      ({nextPrayerInfo.next?.arabicName})
                    </span>
                  </h2>
                  <p className="text-sm text-emerald-200 mt-1 font-medium">
                    {t.startsAt}: {formatDisplayTime(nextPrayerInfo.next?.time, settings.timeFormat || '12h')}
                  </p>
                  <div className="mt-2 text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-400/20 rounded-lg px-2.5 py-1 inline-flex items-center gap-1.5">
                    <span>⏱ {t.timeLimit}:</span>
                    <span className="text-white font-mono">
                      {isEn ? nextPrayerInfo.next?.windowEn : toBengaliNumerals(nextPrayerInfo.next?.windowBn)}
                    </span>
                    <span className="text-emerald-400 text-[11px]">
                      ({isEn ? nextPrayerInfo.next?.limitEn : nextPrayerInfo.next?.limitBn})
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-950/70 border border-emerald-400/20 px-6 py-4 rounded-2xl text-center md:text-right min-w-[240px]">
                  <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
                    {t.countdownTitle}
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-emerald-300 font-mono tracking-widest">
                    {formatNum(formatMs(nextPrayerInfo.timeRemainingMs))}
                  </div>
                </div>
              </section>
            )}

            {/* Five Daily Prayers Schedule */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-emerald-300">
                  {t.fiveDailyPrayers}
                </h3>
                <span className="text-xs text-emerald-400/80 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/20">
                  {schedule?.isHardFallback ? t.syncStatusOffline : t.syncStatusLive}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {PRAYER_LIST.map((key) => {
                  const pInfo = (PRAYER_NAMES as any)[key];
                  const rawTime = schedule?.timings ? schedule.timings[key] : '--:--';
                  const offset = settings.timingOffsets?.[key] || 0;
                  const adjustedTime = rawTime !== '--:--' ? applyTimeOffset(rawTime, offset) : '--:--';
                  const displayFormatted = adjustedTime !== '--:--' ? formatDisplayTime(adjustedTime, settings.timeFormat || '12h') : '--:--';
                  const status = todayRecord ? todayRecord[key] : 'none';
                  const isCurrent = nextPrayerInfo?.current?.key === key;
                  const windows = getPrayerWindows(schedule, settings.timingOffsets || {}, settings.timeFormat || '12h');
                  const win = (windows as any)[key] || {};

                  return (
                    <div
                      key={key}
                      className={`bg-emerald-900/20 border rounded-2xl p-4 flex flex-col justify-between transition relative ${
                        isCurrent
                          ? 'border-emerald-400 shadow-lg shadow-emerald-500/20 bg-emerald-800/30'
                          : 'border-emerald-500/20 hover:border-emerald-500/40'
                      }`}
                    >
                      {isCurrent && (
                        <span className="absolute -top-2.5 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950">
                          {t.currentPrayerBadge}
                        </span>
                      )}

                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{isEn ? pInfo.en : pInfo.bn}</div>
                        <div className="text-xs text-emerald-400/80 font-arabic">{pInfo.ar}</div>
                        <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono my-2 tracking-tight">
                          {displayFormatted}
                        </div>

                        {/* Prayer Time Window & End Limit */}
                        <div className="bg-emerald-950/70 border border-emerald-500/20 rounded-lg px-2 py-1.5 my-1.5 text-center">
                          <div className="text-[11px] font-bold text-emerald-300 font-mono">
                            {t.timeWindow}: {isEn ? win.windowEn : toBengaliNumerals(win.windowBn)}
                          </div>
                          <div className="text-[10px] text-emerald-400/90 font-medium mt-0.5">
                            {isEn ? win.limitEn : win.limitBn}
                          </div>
                        </div>

                        {offset !== 0 && (
                          <div className="text-[10px] font-semibold text-emerald-400/80">
                            {offset > 0 ? `+${offset}` : offset} min adj.
                          </div>
                        )}
                      </div>

                      {/* Actual User Recording Actions */}
                      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-emerald-500/10">
                        <button
                          onClick={() => handleTogglePrayer(key, 'prayed')}
                          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition ${
                            status === 'prayed'
                              ? 'bg-emerald-500 text-emerald-950 shadow-sm'
                              : 'bg-white/5 hover:bg-emerald-500/20 text-emerald-200 border border-emerald-500/20'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t.prayedBtn}
                        </button>
                        <button
                          onClick={() => handleTogglePrayer(key, 'missed')}
                          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition ${
                            status === 'missed'
                              ? 'bg-rose-500 text-white shadow-sm'
                              : 'bg-white/5 hover:bg-rose-500/20 text-rose-200 border border-rose-500/20'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          {t.missedBtn}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Split Grid: Today's Real Progress & Quran Timer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Daily Completion Summary */}
              <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-md shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-emerald-300">
                      {t.todayProgress}
                    </h3>
                    <span className="text-xs text-emerald-400/80 font-mono">
                      {formatNum(todayStr)}
                    </span>
                  </div>

                  {!todayStats?.hasActivity ? (
                    <div className="p-8 rounded-2xl bg-black/20 border border-dashed border-emerald-500/20 text-center my-4">
                      <p className="text-emerald-300/90 font-medium text-sm">
                        "{t.emptyStateMsg}"
                      </p>
                      <p className="text-xs text-emerald-400/60 mt-1">
                        {t.emptyStateSub}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-black/20 p-3.5 rounded-xl text-center border border-emerald-500/10">
                          <div className="text-2xl font-black text-emerald-400">
                            {formatNum(todayStats.prayedCount)}/5
                          </div>
                          <div className="text-xs text-emerald-300/80 mt-1">{t.statPrayed}</div>
                        </div>
                        <div className="bg-black/20 p-3.5 rounded-xl text-center border border-emerald-500/10">
                          <div className="text-2xl font-black text-rose-400">
                            {formatNum(todayStats.missedCount)}
                          </div>
                          <div className="text-xs text-emerald-300/80 mt-1">{t.statMissed}</div>
                        </div>
                        <div className="bg-black/20 p-3.5 rounded-xl text-center border border-emerald-500/10">
                          <div className="text-2xl font-black text-emerald-300">
                            {formatNum(todayStats.percentage)}%
                          </div>
                          <div className="text-xs text-emerald-300/80 mt-1">{t.statCompletion}</div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-emerald-300 mb-1 font-semibold">
                          <span>{t.dailyTargetGoal}</span>
                          <span>{formatNum(todayStats.percentage)}%</span>
                        </div>
                        <div className="h-3 w-full bg-black/30 rounded-full overflow-hidden border border-emerald-500/20">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                            style={{ width: `${todayStats.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-emerald-500/10 text-xs text-emerald-400/70">
                  {t.disclaimerHonesty}
                </div>
              </div>

              {/* Quran Reading Timer */}
              <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-md shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-emerald-300 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-emerald-400" />
                      <span>{t.quranTimer}</span>
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                      {t.quranGoal}: {formatNum(settings.dailyQuranGoalMinutes)} {t.mins}
                    </span>
                  </div>

                  <div className="text-center py-4">
                    <div className="text-4xl md:text-5xl font-black text-emerald-400 font-mono tracking-widest">
                      {formatNum(formatTimerDigits(quranSeconds))}
                    </div>
                    <p className="text-xs text-emerald-300/70 mt-1">
                      {quranRunning ? t.readingRunning : t.readingPaused}
                    </p>
                  </div>

                  {/* Timer Buttons */}
                  <div className="flex flex-wrap justify-center gap-3">
                    {!quranRunning ? (
                      <button
                        onClick={handleStartQuran}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-emerald-950 transition shadow-md shadow-emerald-500/20"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        {t.btnStart}
                      </button>
                    ) : (
                      <button
                        onClick={handlePauseQuran}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-amber-950 transition shadow-md shadow-amber-500/20"
                      >
                        <Pause className="w-4 h-4 fill-current" />
                        {t.btnPause}
                      </button>
                    )}

                    <button
                      onClick={handleStopQuran}
                      disabled={quranSeconds < 5}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-600/20"
                    >
                      {t.btnStopSave}
                    </button>

                    <button
                      onClick={handleResetQuran}
                      disabled={quranSeconds === 0 && !quranRunning}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 text-emerald-200 border border-emerald-500/20 transition disabled:opacity-40"
                    >
                      <RotateCcw className="w-4 h-4" />
                      {t.btnReset}
                    </button>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-emerald-500/10 text-center">
                    <div className="bg-black/20 p-3 rounded-xl border border-emerald-500/10">
                      <div className="text-xl font-black text-white">
                        {formatNum(quranStats.todayMinutes)} {t.mins}
                      </div>
                      <div className="text-xs text-emerald-300/80 mt-0.5">{t.todayReading}</div>
                    </div>
                    <div className="bg-black/20 p-3 rounded-xl border border-emerald-500/10">
                      <div className="text-xl font-black text-white">
                        {formatNum(quranStats.totalMinutes)} {t.mins}
                      </div>
                      <div className="text-xs text-emerald-300/80 mt-0.5">{t.totalReading}</div>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-400/60 text-center mt-3">
                  {t.quranTimerNote}
                </p>
              </div>

            </div>

            {/* Monthly Calendar */}
            <section className="bg-emerald-900/20 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-md shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-emerald-300 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                    <span>{t.monthlyCalendar}</span>
                  </h3>
                  <p className="text-xs text-emerald-400/80">
                    {t.monthlyCalendarSub}
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-black/30 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                  <button
                    onClick={() => {
                      if (calMonth === 1) {
                        setCalMonth(12);
                        setCalYear((y) => y - 1);
                      } else {
                        setCalMonth((m) => m - 1);
                      }
                    }}
                    className="p-1 rounded-lg hover:bg-emerald-500/20 text-emerald-300 transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-bold text-emerald-300 min-w-[130px] text-center">
                    {monthNames[calMonth - 1]} {formatNum(calYear)}
                  </span>
                  <button
                    onClick={() => {
                      if (calMonth === 12) {
                        setCalMonth(1);
                        setCalYear((y) => y + 1);
                      } else {
                        setCalMonth((m) => m + 1);
                      }
                    }}
                    className="p-1 rounded-lg hover:bg-emerald-500/20 text-emerald-300 transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="space-y-1">
                <div className="grid grid-cols-7 text-center text-xs font-bold text-emerald-400/80 py-1">
                  {t.weekdays.map((wd, i) => (
                    <span key={i}>{wd}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: new Date(calYear, calMonth - 1, 1).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square opacity-10 rounded-xl border border-white/5" />
                  ))}

                  {Array.from({ length: new Date(calYear, calMonth, 0).getDate() }).map((_, i) => {
                    const day = i + 1;
                    const dayStr = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const rec = monthlyData?.dailyRecords ? monthlyData.dailyRecords[dayStr] : null;
                    const isToday = dayStr === todayStr;
                    const isSelected = dayStr === selectedDayStr;

                    return (
                      <button
                        key={dayStr}
                        onClick={() => setSelectedDayStr(dayStr)}
                        className={`aspect-square p-2 rounded-xl flex flex-col justify-between items-center transition border ${
                          isSelected
                            ? 'border-emerald-400 bg-emerald-500/20 ring-2 ring-emerald-400/50'
                            : isToday
                            ? 'border-emerald-500/50 bg-emerald-500/10'
                            : 'border-emerald-500/10 bg-black/20 hover:border-emerald-500/30'
                        }`}
                      >
                        <span className={`text-xs font-bold ${isToday ? 'text-emerald-300' : 'text-white'}`}>
                          {formatNum(day)}
                        </span>
                        
                        <div className="flex gap-0.5">
                          {PRAYER_LIST.map((p) => {
                            const st = rec ? rec[p] : 'none';
                            let dotBg = 'bg-white/10';
                            if (st === 'prayed') dotBg = 'bg-emerald-400';
                            else if (st === 'missed') dotBg = 'bg-rose-500';
                            return <div key={p} className={`w-1.5 h-1.5 rounded-full ${dotBg}`} />;
                          })}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

          </div>
        )}

        {/* TAB 2: A-Z DOCUMENTATION PAGE */}
        {activeTab === 'docs' && <DocsPage lang={lang} />}

        {/* TAB 3: GITHUB PUSH & YAML WORKFLOW GUIDE */}
        {activeTab === 'git-guide' && <GitGuidePage lang={lang} />}

        {/* TAB 4: POPUP PREVIEW */}
        {activeTab === 'popup-preview' && (
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-emerald-300">{isEn ? 'Toolbar Popup Preview' : 'এক্সটেনশন টুলবার পপআপ প্রিভিউ'}</h2>
              <p className="text-xs text-emerald-400/80 mt-1">
                {isEn
                  ? 'Clicking the icon in your Chrome toolbar launches this fast popup (Never overrides Chrome New Tab).'
                  : 'ক্রোম টুলবারে আইকনে ক্লিক করলে এই দ্রুত উইন্ডোটি খোলে (New Tab কোনোভাবেই বিঘ্নিত হয় না)।'}
              </p>
            </div>

            <div className="bg-[#022c22] border-2 border-emerald-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <img src="/assets/aistudio/praying_99ed162a.png" alt="Prayer Focus" className="w-6 h-6 object-contain drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                  <div>
                    <h3 className="font-extrabold text-sm text-emerald-400">{t.appName}</h3>
                    <span className="text-[10px] text-emerald-300">{t.tagline}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 text-[11px] text-emerald-300">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  {isEn ? 'Active' : 'সক্রিয়'}
                </div>
              </div>

              {/* Next Prayer Card */}
              {nextPrayerInfo && (
                <div className="bg-emerald-900/40 border border-emerald-500/30 rounded-xl p-4 text-center">
                  <div className="flex justify-between text-xs text-emerald-300 mb-1">
                    <span>{t.nextPrayer}</span>
                    <span>{formatDisplayTime(nextPrayerInfo.next?.time, settings.timeFormat || '12h')}</span>
                  </div>
                  <div className="text-2xl font-black text-white">
                    {isEn ? nextPrayerInfo.next?.nameEn : nextPrayerInfo.next?.name}
                  </div>
                  <div className="text-[11px] text-emerald-300 mt-1 font-semibold">
                    {t.timeLimit}: {isEn ? nextPrayerInfo.next?.limitEn : nextPrayerInfo.next?.limitBn}
                  </div>
                  <div className="bg-black/30 inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-mono text-emerald-300 mt-2 border border-emerald-500/20">
                    <span>{t.countdownTitle}:</span>
                    <span className="font-bold">{formatNum(formatMs(nextPrayerInfo.timeRemainingMs))}</span>
                  </div>
                </div>
              )}

              {/* 5 Prayers Grid */}
              <div className="grid grid-cols-5 gap-1.5 text-center">
                {PRAYER_LIST.map((key) => {
                  const rawTime = schedule?.timings ? schedule.timings[key] : '--:--';
                  const offset = settings.timingOffsets?.[key] || 0;
                  const adjustedTime = rawTime !== '--:--' ? applyTimeOffset(rawTime, offset) : '--:--';
                  const displayFormatted = adjustedTime !== '--:--' ? formatDisplayTime(adjustedTime, settings.timeFormat || '12h') : '--:--';
                  const isCurrent = nextPrayerInfo?.current?.key === key;
                  const pName = (PRAYER_NAMES as any)[key];
                  const windows = getPrayerWindows(schedule, settings.timingOffsets || {}, settings.timeFormat || '12h');
                  const win = (windows as any)[key] || {};
                  return (
                    <div
                      key={key}
                      className={`p-1.5 rounded-lg border ${
                        isCurrent
                          ? 'bg-emerald-500/20 border-emerald-400'
                          : 'bg-white/5 border-white/5'
                      }`}
                    >
                      <div className="text-[11px] font-bold text-emerald-200">{isEn ? pName?.en : pName?.bn}</div>
                      <div className="text-[10px] font-mono text-emerald-400 mt-0.5">{displayFormatted}</div>
                      <div className="text-[8.5px] text-emerald-300/80 mt-0.5 truncate" title={isEn ? win.limitEn : win.limitBn}>
                        {isEn ? `Until ${win.end}` : `${win.end} পর্যন্ত`}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  {isEn ? 'Open Dashboard' : 'ড্যাশবোর্ড খুলুন'}
                </button>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center justify-center gap-1.5 border border-white/10"
                >
                  <Settings className="w-3.5 h-3.5 text-emerald-400" />
                  {t.settingsTitle}
                </button>
              </div>

              <div className="text-center text-[10px] text-emerald-400/60 pt-1">
                {settings.cityName} • Asia/Dhaka
              </div>
            </div>
          </div>
        )}

      </div>

      {/* FULL-SCREEN PRAYER OVERLAY SIMULATOR (STRICT TWO BUTTONS) */}
      {showSimulatedOverlay && (
        <div className="fixed inset-0 z-50 bg-radial from-emerald-900/90 via-emerald-950 to-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-emerald-950/70 border border-emerald-400/40 rounded-3xl p-8 text-center shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            {!simulatedFocusSession ? (
              // Reminder Mode: EXACTLY TWO BUTTONS
              <div className="space-y-6">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center p-3">
                  <img src="/assets/aistudio/praying_99ed162a.png" alt="Prayer Focus" className="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
                </div>

                <div>
                  <h2 className="text-3xl font-extrabold text-emerald-300">
                    {t.prayerTimeNow} {isEn ? nextPrayerInfo?.next?.nameEn || 'Fajr' : nextPrayerInfo?.next?.name || 'ফজর'}
                  </h2>
                  <p className="text-sm text-emerald-200/80 mt-1">
                    {t.prayerTimeNowSub}
                  </p>
                </div>

                {dailyQuote && (
                  <div className="bg-emerald-950/80 border-l-4 border-emerald-400 p-4 rounded-xl text-left">
                    <p className="text-sm font-semibold text-white leading-relaxed">
                      "{dailyQuote.text}"
                    </p>
                    <p className="text-xs text-emerald-300/80 italic mt-1">
                      — {dailyQuote.reference}
                    </p>
                  </div>
                )}

                {/* EXACTLY TWO BUTTONS ONLY */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <button
                    onClick={() => {
                      setSimulatedFocusSession({
                        endTime: Date.now() + 8 * 60 * 1000
                      });
                    }}
                    className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-500/30 transition transform hover:-translate-y-0.5"
                  >
                    {t.btnPrayAction}
                  </button>

                  <button
                    onClick={() => {
                      setShowSimulatedOverlay(false);
                      showToast(isEn ? 'Reminder snoozed for 5 minutes.' : '৫ মিনিট পরে পুনরায় রিমাইন্ডার শিডিউল করা হয়েছে।');
                    }}
                    className="py-3.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-emerald-200 border border-emerald-400/30 font-semibold text-sm transition transform hover:-translate-y-0.5"
                  >
                    {t.btnSnoozeAction}
                  </button>
                </div>

                <p className="text-[11px] text-emerald-400/50">
                  {isEn ? '(Simulation mode: In the Chrome Extension, this overlays active websites)' : '(পরীক্ষামূলক মোড: বাস্তব এক্সটেনশনে এটি ওয়েবসাইটে সরাসরি ইনজেক্ট হয়)'}
                </p>
              </div>
            ) : (
              // Focus Lock Mode: 8-Minute Session
              <div className="space-y-6">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center p-3">
                  <img src="/assets/aistudio/praying_99ed162a.png" alt="Prayer Focus" className="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
                </div>

                <div>
                  <h2 className="text-3xl font-extrabold text-emerald-300">
                    {t.focusActiveTitle}
                  </h2>
                  <p className="text-sm text-emerald-200/80 mt-1">
                    {t.focusActiveSub}
                  </p>
                </div>

                <div className="text-5xl font-black text-emerald-400 font-mono tracking-widest my-4">
                  {isEn ? '08:00' : '০৮:০০'}
                </div>

                <div className="bg-emerald-950/80 border-l-4 border-emerald-400 p-4 rounded-xl text-left">
                  <p className="text-sm font-semibold text-white">
                    "When a servant is in prostration (Sujud), they are nearest to their Lord."
                  </p>
                  <p className="text-xs text-emerald-300/80 italic mt-1">
                    — Sahih Muslim 482
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSimulatedFocusSession(null);
                    setShowSimulatedOverlay(false);
                  }}
                  className="py-2.5 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 text-xs font-semibold border border-emerald-400/20"
                >
                  {t.btnExitPreview}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#022c22] border border-emerald-500/40 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-emerald-500/20 flex items-center justify-between">
              <h3 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-400" />
                <span>{t.settingsTitle}</span>
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-emerald-300 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-sm">
              {/* City Autocomplete & Location */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{isEn ? 'Location & Global City Auto-Search' : 'অবস্থান ও আন্তর্জাতিক শহর সার্চ'}</h4>
                <div className="relative">
                  <label className="block text-xs text-emerald-200 mb-1">{isEn ? 'Search Any City Worldwide' : 'বিশ্বের যেকোনো শহর সার্চ করুন'}</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={isEn ? 'Type city name (e.g. Chattogram, London, Dubai, New York)...' : 'শহরের নাম লিখুন (যেমন: চট্টগ্রাম, লন্ডন, দুবাই)...'}
                      value={cityQuery || settings.cityName}
                      onChange={async (e) => {
                        const val = e.target.value;
                        setCityQuery(val);
                        if (val.trim().length >= 1) {
                          setIsSearchingCity(true);
                          const results = await searchGlobalCities(val);
                          setCitySuggestions(results);
                          setIsSearchingCity(false);
                        } else {
                          setCitySuggestions([]);
                        }
                      }}
                      className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-3.5 py-2.5 text-white pr-9 focus:border-emerald-400 focus:outline-none"
                    />
                    <Search className="w-4 h-4 text-emerald-400 absolute right-3 top-3" />
                  </div>

                  {/* Autocomplete Dropdown */}
                  {citySuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#02221b] border border-emerald-400/40 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto divide-y divide-emerald-500/10">
                      {citySuggestions.map((c, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setSettings({
                              ...settings,
                              cityName: `${c.name}, ${c.country}`,
                              latitude: c.latitude,
                              longitude: c.longitude,
                              timezone: c.timezone
                            });
                            setCityQuery('');
                            setCitySuggestions([]);
                          }}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-500/20 text-xs flex items-center justify-between transition"
                        >
                          <div>
                            <span className="font-bold text-white">{c.name}</span>
                            <span className="text-emerald-400/80 ml-1.5">({c.country})</span>
                          </div>
                          <span className="text-[10px] text-emerald-300 font-mono">
                            {c.latitude.toFixed(2)}°, {c.longitude.toFixed(2)}°
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-emerald-200 mb-1">{isEn ? 'Latitude' : 'অক্ষাংশ'}</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={settings.latitude}
                      onChange={(e) => setSettings({ ...settings, latitude: parseFloat(e.target.value) })}
                      className="w-full bg-black/30 border border-emerald-500/30 rounded-xl px-3 py-2 text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-emerald-200 mb-1">{isEn ? 'Longitude' : 'দ্রাঘিমাংশ'}</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={settings.longitude}
                      onChange={(e) => setSettings({ ...settings, longitude: parseFloat(e.target.value) })}
                      className="w-full bg-black/30 border border-emerald-500/30 rounded-xl px-3 py-2 text-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Time Display Format (12h vs 24h) */}
              <div className="space-y-2 pt-3 border-t border-emerald-500/10">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{isEn ? 'Time Display Format' : 'ঘড়ির সময় ফরম্যাট'}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, timeFormat: '12h' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      settings.timeFormat === '12h' || !settings.timeFormat
                        ? 'bg-emerald-500 text-emerald-950 border-emerald-400 shadow-sm'
                        : 'bg-black/30 text-emerald-200 border-emerald-500/20 hover:bg-emerald-500/10'
                    }`}
                  >
                    12-Hour Format (5:15 PM)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, timeFormat: '24h' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      settings.timeFormat === '24h'
                        ? 'bg-emerald-500 text-emerald-950 border-emerald-400 shadow-sm'
                        : 'bg-black/30 text-emerald-200 border-emerald-500/20 hover:bg-emerald-500/10'
                    }`}
                  >
                    24-Hour Format (17:15)
                  </button>
                </div>
              </div>

              {/* Permanent Prayer Timing Adjustments (Applies to all days) */}
              <div className="space-y-3 pt-3 border-t border-emerald-500/10">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    {isEn ? 'Permanent Prayer Time Adjustments (Minutes)' : 'স্থায়ী ওয়াক্ত সময় সমন্বয় (মিনিট)'}
                  </h4>
                  <span className="text-[10px] text-emerald-300">Applies to all days</span>
                </div>
                <p className="text-[11px] text-emerald-200/70">
                  {isEn
                    ? 'Adjust specific prayers by +/- minutes to match your local mosque adhan. Saved permanently for every day.'
                    : 'স্থানীয় মসজিদের আযানের সাথে মেলাতে ওয়াক্তের সময় মিনিট আগে বা পরে যোগ করুন। এটি সব দিনের জন্য কার্যকর হবে।'}
                </p>

                <div className="grid grid-cols-5 gap-2 text-center">
                  {PRAYER_LIST.map((key) => {
                    const offsets = settings.timingOffsets || {};
                    const currentOffset = offsets[key] || 0;
                    return (
                      <div key={key} className="bg-black/30 p-2 rounded-xl border border-emerald-500/20">
                        <span className="block text-[11px] font-bold text-emerald-200 uppercase mb-1">{key}</span>
                        <input
                          type="number"
                          min="-60"
                          max="60"
                          value={currentOffset}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 0;
                            setSettings({
                              ...settings,
                              timingOffsets: {
                                ...(settings.timingOffsets || {}),
                                [key]: val
                              }
                            });
                          }}
                          className="w-full bg-black/50 border border-emerald-500/30 rounded-lg p-1 text-center text-xs font-mono text-emerald-300 font-bold focus:outline-none"
                        />
                        <span className="text-[9px] text-emerald-400/60 mt-0.5 block">min</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-emerald-500/10">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{isEn ? 'Prayer Calculation' : 'সালাতের হিসাব ও মাযহাব'}</h4>
                <div>
                  <label className="block text-xs text-emerald-200 mb-1">{isEn ? 'Calculation Method' : 'হিসাব পদ্ধতি'}</label>
                  <select
                    value={settings.calculationMethod}
                    onChange={(e) => setSettings({ ...settings, calculationMethod: parseInt(e.target.value, 10) })}
                    className="w-full bg-black/30 border border-emerald-500/30 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="1">University of Islamic Sciences, Karachi (Bangladesh & Subcontinent)</option>
                    <option value="4">Umm Al-Qura University, Makkah</option>
                    <option value="3">Muslim World League (MWL)</option>
                    <option value="2">Islamic Society of North America (ISNA)</option>
                    <option value="5">Egyptian General Authority of Survey</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-emerald-200 mb-1">{isEn ? 'Asr Juristic Method' : 'আসর ওয়াক্ত মাযহাব'}</label>
                  <select
                    value={settings.asrMethod}
                    onChange={(e) => setSettings({ ...settings, asrMethod: parseInt(e.target.value, 10) })}
                    className="w-full bg-black/30 border border-emerald-500/30 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="1">Hanafi (আসর দেরিতে)</option>
                    <option value="0">Standard (Shafi, Maliki, Hanbali)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-emerald-500/10">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{isEn ? 'Focus & Reminders' : 'ফোকাস ও রিমাইন্ডার'}</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chk-notif"
                    checked={settings.notificationsEnabled}
                    onChange={(e) => setSettings({ ...settings, notificationsEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500"
                  />
                  <label htmlFor="chk-notif" className="text-xs text-emerald-200 cursor-pointer">
                    {isEn ? 'Enable automatic prayer overlay popup & desktop notifications' : 'ওয়াক্ত শুরু হলে স্বয়ংক্রিয় রিমাইন্ডার পপআপ ও নোটিফিকেশন চালু রাখুন'}
                  </label>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-emerald-500/20 flex justify-end gap-3">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-emerald-200"
              >
                {isEn ? 'Cancel' : 'বাতিল'}
              </button>
              <button
                onClick={async () => {
                  await saveSettings(settings);
                  setShowSettingsModal(false);
                  const sched = await fetchPrayerTimings(true);
                  setSchedule(sched);
                  if (sched) setNextPrayerInfo(calculateNextPrayer(sched, settings.timingOffsets || {}));
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-emerald-950 transition"
              >
                {isEn ? 'Save' : 'সংরক্ষণ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-app Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2.5 bg-emerald-900 border border-emerald-400 text-emerald-100 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md">
            <Bell className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-emerald-400/60 pt-10">
        {t.footerText}
      </footer>

    </div>
  );
}
