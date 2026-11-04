import React, { useState } from 'react';
import {
  FolderGit2,
  Terminal,
  Copy,
  Check,
  FileCode2,
  Download,
  ShieldCheck,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { Language } from './translations';

interface GitGuideProps {
  lang: Language;
}

export const GitGuidePage: React.FC<GitGuideProps> = ({ lang }) => {
  const isEn = lang === 'en';
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const gitCommands = [
    `# 1. Initialize git in your local project folder
git init`,
    `# 2. Add all extension, website, and GitHub Actions workflow files
git add .`,
    `# 3. Create your initial commit
git commit -m "feat: release Prayer Focus v2.0.0 Chrome extension and website"`,
    `# 4. Set the default branch to main
git branch -M main`,
    `# 5. Link to your GitHub remote repository (replace with your repo URL)
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git`,
    `# 6. Push code to GitHub
git push -u origin main`
  ];

  const fullGitScript = gitCommands.join('\n\n');

  const yamlContent = `name: Build Website & Extension Package

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build:
    name: Build & Package Prayer Focus
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code Repository
        uses: actions/checkout@v4

      - name: Set up Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Project Dependencies
        run: npm ci || npm install

      - name: Run Test Suite & Linter
        run: |
          npm run lint
          node prayer-focus-v2/tests/prayer-engine.test.js

      - name: Build Web Application
        run: npm run build

      - name: Package Chrome Extension ZIP
        run: |
          mkdir -p dist/packages
          cd prayer-focus-v2
          zip -r ../dist/packages/prayer-focus-v2.0.0.zip ./* -x "tests/*"
          cd ..
          cp dist/packages/prayer-focus-v2.0.0.zip public/prayer-focus-v2.0.0.zip 2>/dev/null || true
          echo "Extension zip packaged successfully!"
          ls -lh dist/packages/

      - name: Upload Extension ZIP Artifact
        uses: actions/upload-artifact@v4
        with:
          name: prayer-focus-extension-v2.0.0
          path: dist/packages/prayer-focus-v2.0.0.zip

      - name: Upload Web Build Artifact
        uses: actions/upload-artifact@v4
        with:
          name: prayer-focus-web-dist
          path: dist/`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900/50 to-emerald-950 border border-emerald-500/30 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-2">
          <FolderGit2 className="w-8 h-8 text-emerald-400" />
          <h1 className="text-2xl md:text-3xl font-black text-white">
            {isEn ? 'GitHub Push Guide & Actions YAML' : 'গিটহাব পুশ ও অটোমেশন YAML নির্দেশিকা'}
          </h1>
        </div>
        <p className="text-emerald-200/90 text-sm max-w-2xl leading-relaxed">
          {isEn
            ? 'Follow these exact terminal commands to push this codebase to your GitHub repository and automatically trigger the build pipeline to compile the website and extension zip package.'
            : 'নিচের কমান্ডগুলো রান করে আপনার গিটহাব একাউন্টে কোড পুশ করুন। সাথে দেওয়া YAML ফাইলটি অটোমেটিক ওয়েবসাইট বিল্ড ও এক্সটেনশনের জিপ তৈরি করে দিবে।'}
        </p>
      </div>

      {/* Step by Step Git Commands */}
      <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-3xl p-7 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <span>{isEn ? 'Terminal Commands to Push to GitHub' : 'গিটহাবে পুশ করার টার্মিনাল কমান্ড'}</span>
          </h2>
          <button
            onClick={() => copyToClipboard(fullGitScript, 999)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition"
          >
            {copiedIndex === 999 ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                {isEn ? 'Copied All!' : 'সব কপি হয়েছে!'}
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                {isEn ? 'Copy All Commands' : 'সব কমান্ড কপি করুন'}
              </>
            )}
          </button>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {gitCommands.map((cmd, idx) => (
            <div
              key={idx}
              className="bg-black/50 border border-emerald-500/20 rounded-xl p-3.5 flex items-center justify-between group hover:border-emerald-500/40 transition"
            >
              <pre className="text-emerald-300 overflow-x-auto whitespace-pre-wrap">{cmd}</pre>
              <button
                onClick={() => copyToClipboard(cmd, idx)}
                className="opacity-60 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-400 transition ml-3 shrink-0"
                title="Copy snippet"
              >
                {copiedIndex === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* GitHub Actions YAML Workflow */}
      <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-3xl p-7 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">
                {isEn ? 'GitHub Actions Workflow (.github/workflows/build-and-package.yml)' : 'গিটহাব অ্যাকশনস অটোমেশন ফাইল'}
              </h2>
            </div>
            <p className="text-xs text-emerald-300/80 mt-1">
              {isEn
                ? 'Automatically lints, runs tests, creates dist/ web build, and packages prayer-focus-v2.0.0.zip on push.'
                : 'প্রতিটি পুশের সাথে সাথে অটোমেটিক টেস্ট রান করে ওয়েবসাইট ও এক্সটেনশনের জিপ বানাবে।'}
            </p>
          </div>
          <button
            onClick={() => copyToClipboard(yamlContent, 888)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition shrink-0"
          >
            {copiedIndex === 888 ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                {isEn ? 'YAML Copied!' : 'YAML কপি হয়েছে!'}
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                {isEn ? 'Copy YAML Content' : 'YAML কপি করুন'}
              </>
            )}
          </button>
        </div>

        <div className="bg-black/60 border border-emerald-500/20 rounded-2xl p-4 overflow-x-auto">
          <pre className="font-mono text-xs text-emerald-300/90 leading-relaxed">
            {yamlContent}
          </pre>
        </div>
      </div>

      {/* Direct Chrome Installation steps */}
      <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-3xl p-7 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>{isEn ? 'How to Load the Extension in Chrome' : 'ক্রোমে এক্সটেনশনটি যেভাবে ইনস্টল করবেন'}</span>
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-xs md:text-sm text-emerald-200/90 leading-relaxed">
          <li>
            {isEn
              ? 'Download the packaged ZIP file using the green button at the top or clone your repo.'
              : 'ওপরের সবুজ বাটন থেকে prayer-focus-v2.0.0.zip ডাউনলোড করুন অথবা রিপোজিটরি ক্লোন করুন।'}
          </li>
          <li>
            {isEn
              ? 'Extract the ZIP so you have the "prayer-focus-v2" folder.'
              : 'জিপ ফাইলটি আনজিপ করুন যেন "prayer-focus-v2" ফোল্ডারটি পাওয়া যায়।'}
          </li>
          <li>
            {isEn
              ? 'In Google Chrome, navigate to chrome://extensions/ in the address bar.'
              : 'গুগল ক্রোম ব্রাউজারে chrome://extensions/ লিখে এন্টার চাপুন।'}
          </li>
          <li>
            {isEn
              ? 'Enable the "Developer mode" toggle located in the top-right corner.'
              : 'ডান পাশের ওপরের কোণায় থাকা "Developer mode" অন করুন।'}
          </li>
          <li>
            {isEn
              ? 'Click "Load unpacked" (top-left) and select the prayer-focus-v2 directory.'
              : 'বাম পাশের ওপরে "Load unpacked" এ ক্লিক করে prayer-focus-v2 ফোল্ডারটি নির্বাচন করুন।'}
          </li>
          <li>
            {isEn
              ? 'Done! The Prayer Focus extension is now live and protecting your prayers.'
              : 'অভিনন্দন! Prayer Focus এক্সটেনশনটি আপনার ব্রাউজারে সক্রিয় হয়ে গেছে।'}
          </li>
        </ol>
      </div>
    </div>
  );
};
