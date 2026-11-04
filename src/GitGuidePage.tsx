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
  AlertCircle,
  Globe
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

  const yamlContent = `name: Build Website, Extension Package & Deploy Website

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]
  workflow_dispatch:

permissions:
  contents: write
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

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
          node-version: 22

      - name: Install Project Dependencies
        run: npm install --legacy-peer-deps

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
          cp dist/packages/prayer-focus-v2.0.0.zip dist/prayer-focus-v2.0.0.zip 2>/dev/null || true
          echo "Extension zip packaged successfully!"
          ls -lh dist/packages/

      - name: Upload Extension ZIP Artifact
        uses: actions/upload-artifact@v4
        with:
          name: prayer-focus-extension-v2.0.0
          path: dist/packages/prayer-focus-v2.0.0.zip

      - name: Upload GitHub Pages Artifact
        if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist/

      - name: Create or Update GitHub Release with Extension ZIP
        if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'
        uses: softprops/action-gh-release@v2
        with:
          tag_name: v2.0.0
          name: "Prayer Focus v2.0.0"
          body: |
            ## 🕌 Prayer Focus v2.0.0 Release
            Automated production build of the Prayer Focus Chrome Extension (Manifest V3) & Website.
            
            ### 📦 Download & Install:
            - Download prayer-focus-v2.0.0.zip attached below.
            - Extract the zip file.
            - In Chrome, open chrome://extensions/ and enable Developer Mode.
            - Click Load unpacked and select the folder that directly contains manifest.json.
          files: dist/packages/prayer-focus-v2.0.0.zip
          draft: false
          prerelease: false
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}

  deploy-website:
    name: Deploy Website to GitHub Pages
    needs: build
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900/50 to-emerald-950 border border-emerald-500/30 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FolderGit2 className="w-8 h-8 text-emerald-400" />
            <h1 className="text-2xl md:text-3xl font-black text-white">
              {isEn ? 'GitHub Push, Deploy Website & YAML Pipeline' : 'গিটহাব পুশ, ওয়েবসাইট ডেপ্লয় ও YAML অটোমেশন'}
            </h1>
          </div>
          <p className="text-emerald-200/90 text-sm max-w-2xl leading-relaxed">
            {isEn
              ? 'Push this codebase to GitHub to automatically trigger the pipeline: build the website, deploy it live to GitHub Pages, and package the Chrome Extension ZIP release.'
              : 'নিচের কমান্ড দিয়ে গিটহাবে পুশ করলেই স্বয়ংক্রিয়ভাবে ওয়েবসাইটটি GitHub Pages-এ লাইভ ডেপ্লয় হবে এবং রিলিজ পেইজে এক্সটেনশনের জিপ তৈরি হয়ে যাবে।'}
          </p>
        </div>
        <img
          src="/assets/aistudio/praying_99ed162a.png"
          alt="Prayer Focus"
          className="w-16 h-16 object-contain drop-shadow-[0_0_12px_rgba(52,211,153,0.5)] shrink-0"
        />
      </div>

      {/* Troubleshooting "Manifest file is missing or unreadable" */}
      <div className="bg-amber-950/40 border border-amber-500/40 rounded-3xl p-7 space-y-4">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
          <h2 className="text-lg font-bold text-amber-300">
            {isEn ? 'How to Solve "Manifest file is missing or unreadable"' : '"Manifest file is missing or unreadable" ত্রুটি সমাধানের নিয়ম'}
          </h2>
        </div>
        <div className="text-xs md:text-sm text-amber-100/90 leading-relaxed space-y-2">
          <p>
            {isEn
              ? 'When Chrome shows this error, it means you selected a folder that does not directly contain the "manifest.json" file.'
              : 'গুগল ক্রোমে এই ত্রুটি দেখালে বুঝবেন আপনি এমন একটি ফোল্ডার সিলেক্ট করেছেন যার ভেতরে সরাসরি "manifest.json" ফাইলটি নেই (হয়তো কোনো সাবফোল্ডারের ভেতরে রয়েছে)।'}
          </p>
          <div className="bg-black/50 border border-amber-500/20 rounded-xl p-4 font-mono text-xs text-amber-200 space-y-1">
            <div className="font-bold text-emerald-400">
              {isEn ? '✓ CORRECT folder structure to select:' : '✓ যে ফোল্ডারটি নির্বাচন করতে হবে:'}
            </div>
            <div>📂 Selected Folder/</div>
            <div className="pl-4">├── 📄 manifest.json &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;← (Must be directly here!)</div>
            <div className="pl-4">├── 📁 assets/</div>
            <div className="pl-4">├── 📁 background/</div>
            <div className="pl-4">├── 📁 dashboard/</div>
            <div className="pl-4">└── 📁 popup/</div>
          </div>
          <p className="text-xs text-amber-200/80">
            {isEn
              ? 'If you extracted the ZIP into "prayer-focus-v2.0.0", double click into it to check if there is an inner "prayer-focus-v2" folder. Click into the folder where "manifest.json" is visible, and select that folder.'
              : 'জিপ ফাইল আনজিপ করার পর ফোল্ডারটি ওপেন করে নিশ্চিত হোন যে ভেতরে manifest.json দেখা যাচ্ছে। যে ফোল্ডারে manifest.json রয়েছে, "Load unpacked" এ ক্লিক করে ঠিক সেই ফোল্ডারটি নির্বাচন করুন।'}
          </p>
        </div>
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

      {/* GitHub Actions YAML Workflow with Automatic Website Deployment */}
      <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-3xl p-7 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">
                {isEn ? 'GitHub Actions Workflow with Auto Website Deployment' : 'গিটহাব অ্যাকশনস ও ওয়েবসাইট অটো ডেপ্লয় YAML'}
              </h2>
            </div>
            <p className="text-xs text-emerald-300/80 mt-1">
              {isEn
                ? 'File location: .github/workflows/build-and-package.yml. Deploys website to GitHub Pages and attaches zip to GitHub Releases.'
                : 'ফাইল লোকেশন: .github/workflows/build-and-package.yml। এটি ওয়েবসাইটকে GitHub Pages-এ লাইভ করে এবং জিপ রিলিজ যুক্ত করে।'}
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
          <span>{isEn ? 'How to Load the Extension in Chrome (Correct Method)' : 'ক্রোমে সঠিকভাবে এক্সটেনশনটি লোড করার পদ্ধতি'}</span>
        </h2>
        <ol className="list-decimal list-inside space-y-2.5 text-xs md:text-sm text-emerald-200/90 leading-relaxed">
          <li>
            {isEn
              ? 'Download "prayer-focus-v2.0.0.zip" from the top-right button.'
              : 'ওপরের ডানপাশের বাটন থেকে "prayer-focus-v2.0.0.zip" ডাউনলোড করুন।'}
          </li>
          <li>
            {isEn
              ? 'Extract/Unzip the file on your computer (e.g. into your folder).'
              : 'ফাইলটি আপনার কম্পিউটারে আনজিপ (Extract) করুন।'}
          </li>
          <li>
            {isEn
              ? 'In Google Chrome, navigate to chrome://extensions/ in your URL bar.'
              : 'গুগল ক্রোমের অ্যাড্রেস বারে chrome://extensions/ লিখে এন্টার দিন।'}
          </li>
          <li>
            {isEn
              ? 'Toggle ON "Developer mode" in the top-right corner.'
              : 'ডান পাশের ওপরের কোনায় থাকা "Developer mode" সুইচটি অন করুন।'}
          </li>
          <li>
            {isEn
              ? 'Click "Load unpacked" (top-left) and select the folder that contains "manifest.json".'
              : 'বাম পাশের ওপরে "Load unpacked" এ ক্লিক করুন এবং manifest.json থাকা মূল ফোল্ডারটি সিলেক্ট করুন।'}
          </li>
          <li>
            {isEn
              ? 'Done! The Prayer Focus extension icon appears in your toolbar with the worshipper emblem.'
              : 'সম্পন্ন! Prayer Focus এক্সটেনশনটি আপনার ব্রাউজারে সুন্দর আইকনসহ প্রস্তুত হয়ে যাবে।'}
          </li>
        </ol>
      </div>
    </div>
  );
};
