import React, { useState } from 'react';
import {
  BookOpen,
  ShieldCheck,
  Zap,
  Globe,
  Clock,
  CheckCircle,
  Database,
  BellRing,
  Code2,
  FileText,
  AlertTriangle,
  FolderGit2
} from 'lucide-react';
import { Language } from './translations';

interface DocsProps {
  lang: Language;
}

export const DocsPage: React.FC<DocsProps> = ({ lang }) => {
  const isEn = lang === 'en';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Intro */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900/60 to-emerald-950 border border-emerald-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider mb-3">
              {isEn ? 'A-Z Comprehensive Documentation' : 'A-Z পূর্ণাঙ্গ নির্দেশিকা ও সিস্টেম বিবরণী'}
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              {isEn
                ? 'Everything About Prayer Focus v2.0'
                : 'Prayer Focus v2.0 সম্পর্কে সবকিছু জানুন'}
            </h1>
            <p className="text-emerald-200/90 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
              {isEn
                ? 'An enterprise-grade, privacy-first Chrome Extension and productivity suite designed to protect your 5 daily prayers and build consistent Quran habits without ever overriding your Chrome New Tab.'
                : 'গুগল ক্রোমের অরিজিনাল New Tab অক্ষত রেখে ৫ ওয়াক্ত সালাত সুরক্ষা ও কোরআন অধ্যয়নের সুদৃঢ় অভ্যাস গড়ে তোলার জন্য একটি পূর্ণাঙ্গ ইসলামিক প্রোডাক্টিভিটি এক্সটেনশন ও ওয়েব ড্যাশবোর্ড।'}
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-inner shrink-0">
            <img src="./assets/aistudio/praying_99ed162a.png" alt="Prayer Focus" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
          </div>
        </div>
      </div>

      {/* Feature Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">
            {isEn ? '1. Absolute New Tab Safety' : '১. নিউ ট্যাব সম্পূর্ণ অক্ষত'}
          </h3>
          <p className="text-xs text-emerald-200/80 leading-relaxed">
            {isEn
              ? 'Chrome New Tab is strictly preserved. No overrides, no hijacked search engines, and no unwanted redirections. The dashboard opens independently.'
              : 'গুগল ক্রোমের নিউ ট্যাব, সার্চ ইঞ্জিন ও বুকমার্ক সম্পূর্ণ অক্ষত থাকে। কোনো ডাইভার্ট বা ওভাররাইড করা হয় না।'}
          </p>
        </div>

        <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">
            {isEn ? '2. Zero Demo Data Standard' : '২. শতভাগ বাস্তব ব্যবহারকারী রেকর্ড'}
          </h3>
          <p className="text-xs text-emerald-200/80 leading-relaxed">
            {isEn
              ? 'Never displays fabricated streaks or hardcoded numbers. Starts fresh: "No activity recorded for today yet". All charts use pure local storage records.'
              : 'কোনো ডেমো বা ভুয়া চার্ট নেই। নতুন ইনস্টলেশনে "আজকের কোনো কার্যক্রম এখনো রেকর্ড করা হয়নি" বার্তা দেখাবে। কেবল বাস্তব ব্যবহারকারীর আমল সেভ হয়।'}
          </p>
        </div>

        <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
            <BellRing className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">
            {isEn ? '3. Strict Two-Action Popup' : '৩. নির্দিষ্ট দুটি অ্যাকশন বাটন'}
          </h3>
          <p className="text-xs text-emerald-200/80 leading-relaxed">
            {isEn
              ? 'When prayer time arrives, an overlay displays verified Quran quotes with exactly 2 buttons: "I am going to pray" (8-min focus lock) or "Remind in 5 mins".'
              : 'ওয়াক্ত শুরু হলে ওয়েবসাইটে ২টি বাটনসহ পপআপ আসে: "✓ আমি নামাজে যাচ্ছি" (৮ মিনিটের ফোকাস সেশন) এবং "৫ মিনিট পরে মনে করিয়ে দিন"।'}
          </p>
        </div>
      </div>

      {/* Detailed System Breakdown */}
      <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-3xl p-8 space-y-8">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <Code2 className="w-5 h-5 text-emerald-400" />
            <span>{isEn ? 'Detailed Component Architecture' : 'সিস্টেমের অভ্যন্তরীণ আর্কিটেকচার'}</span>
          </h2>
          <div className="space-y-4 text-xs md:text-sm text-emerald-200/90 leading-relaxed">
            <div className="bg-black/30 border border-emerald-500/15 p-4 rounded-xl">
              <span className="font-bold text-emerald-400 block mb-1">
                {isEn ? 'Background Service Worker (Manifest V3)' : 'ব্যাকগ্রাউন্ড সার্ভিস ওয়ার্কার (Manifest V3)'}
              </span>
              <p>
                {isEn
                  ? 'Runs on Chrome Manifest V3 using chrome.alarms instead of power-hungry setInterval loops. Wakes up reliably, calculates transitions for Asia/Dhaka prayer windows, broadcasts reminders to open tabs, and persists state across restarts.'
                  : 'ক্রোম ম্যানিফেস্ট ৩ আর্কিটেকচারে chrome.alarms ব্যবহার করে কাজ করে। ব্রাউজার রিস্টার্ট বা স্লিপের পরও নির্ভরযোগ্যভাবে ওয়াক্ত হিসাব ও শিডিউল বজায় রাখে।'}
              </p>
            </div>

            <div className="bg-black/30 border border-emerald-500/15 p-4 rounded-xl">
              <span className="font-bold text-emerald-400 block mb-1">
                {isEn ? 'Content Script Website Overlay' : 'কন্টেন্ট স্ক্রিপ্ট ফুলস্ক্রিন ওভারলে'}
              </span>
              <p>
                {isEn
                  ? 'Injected cleanly into active tabs (document_end) without conflicting with website styles. During focus lock, it gently blocks distracting web pages with an emerald reflection screen, reminding the user to step away for Salah.'
                  : 'সাধারণ ওয়েবসাইটে জেন্টল গ্লাস ও ডার্ক এমারেল্ড স্ক্রিন ইনজেক্ট করে যা নামাজ আদায়ের ৮ মিনিট মনোযোগ ধরে রাখে এবং বিভ্রান্তি দূর করে।'}
              </p>
            </div>

            <div className="bg-black/30 border border-emerald-500/15 p-4 rounded-xl">
              <span className="font-bold text-emerald-400 block mb-1">
                {isEn ? '62+ Verified Bengali Islamic Quotes' : '৬২+ নির্ভুল বাংলা ইসলামিক উদ্ধৃতি ও আয়াত'}
              </span>
              <p>
                {isEn
                  ? 'Carefully curated Quranic verses with Surah name and Ayah numbers (e.g. Surah Al-Ankabut 29:45, Surah Ar-Ra’d 13:28) and authentic Hadith (Bukhari, Muslim, Tirmidhi). Never repeats on mere refresh; changes synchronously by calendar date.'
                  : 'সূরা নাম ও আয়াত নম্বরসহ যাচাইকৃত কোরআনের বাণী এবং বুখারী, মুসলিম ও তিরমিযীর সহীহ হাদিস। প্রতিদিন তারিখ অনুযায়ী একটি করে নতুন আয়াত বা উপদেশ প্রদর্শিত হয়।'}
              </p>
            </div>

            <div className="bg-black/30 border border-emerald-500/15 p-4 rounded-xl">
              <span className="font-bold text-emerald-400 block mb-1">
                {isEn ? 'Self-Reported Quran Reading Timer' : 'স্ব-প্রতিবেদিত কোরআন তিলাওয়াত টাইমার'}
              </span>
              <p>
                {isEn
                  ? 'Built-in stopwatch with Start, Pause, Save, and Reset. Tracks daily reading minutes against your personal goal. Honest habit tracking stored locally in your browser.'
                  : 'দৈনিক পড়ার লক্ষ্য নির্ধারণ, স্টপওয়াচ টাইমার ও মোট তিলাওয়াত ট্র্যাকার। এটি আপনার অভ্যাস গঠনের ব্যক্তিগত সহায়ক।'}
              </p>
            </div>

            {/* Prayer Windows & Jurisprudential Limits */}
            <div className="bg-emerald-900/30 border border-emerald-400/30 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-emerald-300 text-sm md:text-base">
                  {isEn ? 'Prayer Windows & Time Limits (Shariah Boundaries)' : 'শরীয়তসম্মত ৫ ওয়াক্ত সালাতের সময়সীমা ও সমাপ্তির নিয়ম'}
                </span>
              </div>
              <p className="text-xs md:text-sm text-emerald-200/90 leading-relaxed">
                {isEn
                  ? 'Each prayer has an exact permissible start and end window calculated from solar positions and Islamic jurisprudence:'
                  : 'প্রত্যেক সালাতের জন্য সূর্যালোক ও ফিকহের আলোকে নির্দিষ্ট শুরু ও শেষ সময়সীমা স্বয়ংক্রিয়ভাবে হিসাব করা হয়:'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
                <div className="bg-black/40 border border-emerald-500/20 rounded-xl p-3 text-center">
                  <div className="font-bold text-white text-xs">{isEn ? 'Fajr (الفجر)' : 'ফজর (الفجر)'}</div>
                  <div className="text-[11px] text-emerald-300 font-medium mt-1">
                    {isEn ? 'Starts at Dawn' : 'সুবেহ সাদিক শুরু'}
                  </div>
                  <div className="text-[10px] text-amber-300 font-semibold mt-0.5">
                    {isEn ? 'Ends: At Sunrise' : 'সমাপ্তি: সূর্যোদয়'}
                  </div>
                </div>
                <div className="bg-black/40 border border-emerald-500/20 rounded-xl p-3 text-center">
                  <div className="font-bold text-white text-xs">{isEn ? 'Dhuhr (الظهر)' : 'যোহর (الظهر)'}</div>
                  <div className="text-[11px] text-emerald-300 font-medium mt-1">
                    {isEn ? 'Starts at Zawal' : 'সূর্য ঢলে পড়া শুরু'}
                  </div>
                  <div className="text-[10px] text-amber-300 font-semibold mt-0.5">
                    {isEn ? 'Ends: At Asr Adhan' : 'সমাপ্তি: আসরের ওয়াক্ত'}
                  </div>
                </div>
                <div className="bg-black/40 border border-emerald-500/20 rounded-xl p-3 text-center">
                  <div className="font-bold text-white text-xs">{isEn ? 'Asr (العصر)' : 'আসর (العصر)'}</div>
                  <div className="text-[11px] text-emerald-300 font-medium mt-1">
                    {isEn ? 'Starts at Shadow Limit' : 'ছায়া দ্বিগুণ/একগুণ'}
                  </div>
                  <div className="text-[10px] text-amber-300 font-semibold mt-0.5">
                    {isEn ? 'Ends: At Sunset (Maghrib)' : 'সমাপ্তি: সূর্যাস্ত (মাগরিব)'}
                  </div>
                </div>
                <div className="bg-black/40 border border-emerald-500/20 rounded-xl p-3 text-center">
                  <div className="font-bold text-white text-xs">{isEn ? 'Maghrib (المغرب)' : 'মাগরিব (المغرب)'}</div>
                  <div className="text-[11px] text-emerald-300 font-medium mt-1">
                    {isEn ? 'Starts at Sunset' : 'সূর্যাস্তের পরপরই'}
                  </div>
                  <div className="text-[10px] text-amber-300 font-semibold mt-0.5">
                    {isEn ? 'Ends: At Isha Twilight' : 'সমাপ্তি: এশার ওয়াক্ত'}
                  </div>
                </div>
                <div className="bg-black/40 border border-emerald-500/20 rounded-xl p-3 text-center">
                  <div className="font-bold text-white text-xs">{isEn ? 'Isha (العشاء)' : 'এশা (العشاء)'}</div>
                  <div className="text-[11px] text-emerald-300 font-medium mt-1">
                    {isEn ? 'Starts after Twilight' : 'লালিমা দূর হলে শুরু'}
                  </div>
                  <div className="text-[10px] text-amber-300 font-semibold mt-0.5">
                    {isEn ? 'Ends: Midnight / Fajr' : 'সমাপ্তি: মধ্যরাত / ফজর'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Browser Sandbox Limitation Transparency */}
        <div className="bg-amber-950/30 border border-amber-500/30 p-5 rounded-2xl flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs md:text-sm text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300 block mb-1">
              {isEn ? 'Notice on Chrome Security Sandbox' : 'ক্রোম ব্রাউজার সিকিউরিটি সীমাবদ্ধতা'}
            </strong>
            {isEn
              ? 'Chrome extensions are technically restricted by browser security policies from running content scripts on internal pages (chrome://*, chrome-extension://*, or the Chrome Web Store). The extension blocks ordinary HTTP/HTTPS websites during focus mode.'
              : 'গুগল ক্রোমের নিরাপত্তা নিয়মানুযায়ী ক্রোম সিস্টেম পেইজ (chrome://, সেটিংস) কোনো এক্সটেনশন দ্বারা ব্লক করা সম্ভব নয়। সাধারণ ইন্টারনেট ব্রাউজিংয়ের সময় ফোকাস লক সক্রিয় থাকবে।'}
          </div>
        </div>
      </div>
    </div>
  );
};
