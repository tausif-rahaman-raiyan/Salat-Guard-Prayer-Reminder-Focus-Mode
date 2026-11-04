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
        uses: actions/deploy-pages@v4
        continue-on-error: true`;

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

      {/* Troubleshooting 1: GitHub Pages 404 Error */}
      <div className="bg-rose-950/40 border border-rose-500/40 rounded-3xl p-7 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
            <h2 className="text-lg font-bold text-rose-200">
              {isEn ? 'Fix: "Failed to create deployment (status: 404) on GitHub Pages"' : 'সমাধান: GitHub Pages-এ "Failed to create deployment (status: 404)"'}
            </h2>
          </div>
          <a
            href="https://github.com/tausif-rahaman-raiyan/Salat-Guard-Prayer-Reminder-Focus-Mode/settings/pages"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/40 transition"
          >
            <span>{isEn ? 'Open Pages Settings' : 'পেইজেস সেটিংস খুলুন'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="text-xs md:text-sm text-rose-100/90 leading-relaxed space-y-3">
          <p>
            {isEn
              ? 'This 404 error happens because by default GitHub Pages expects branch deployment. You need to enable "GitHub Actions" as the deployment source.'
              : 'গিটহাবে ডিফল্টভাবে GitHub Pages সক্রিয় থাকে না অথবা "Deploy from a branch" মোডে থাকে, যার কারণে Actions থেকে ডিপ্লয় করার সময় 404 নট ফাউন্ড ত্রুটি দেখায়।'}
          </p>

          <div className="bg-black/60 border border-rose-500/30 rounded-xl p-4 text-xs space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-500/30 text-rose-300 inline-flex items-center justify-center text-[11px]">1</span>
              <span>{isEn ? 'Open Repository Settings > Pages' : 'GitHub রিপোজিটরির Settings > Pages-এ যান'}:</span>
            </div>
            <p className="text-emerald-300 font-mono text-[11px] pl-7">
              https://github.com/tausif-rahaman-raiyan/Salat-Guard-Prayer-Reminder-Focus-Mode/settings/pages
            </p>

            <div className="font-bold text-white flex items-center gap-2 pt-1">
              <span className="w-5 h-5 rounded-full bg-rose-500/30 text-rose-300 inline-flex items-center justify-center text-[11px]">2</span>
              <span>{isEn ? 'Change Source under "Build and deployment":' : '"Build and deployment"-এর নিচে Source পরিবর্তন করুন'}:</span>
            </div>
            <p className="text-rose-200 pl-7">
              {isEn ? 'Click the ' : 'ড্রপডাউনে ক্লিক করে '}
              <strong className="text-amber-300">"Deploy from a branch"</strong>
              {isEn ? ' dropdown and change it to ' : ' পরিবর্তন করে '}
              <strong className="text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">GitHub Actions</strong>
              {isEn ? '.' : ' নির্বাচন করুন।'}
            </p>

            <div className="font-bold text-white flex items-center gap-2 pt-1">
              <span className="w-5 h-5 rounded-full bg-rose-500/30 text-rose-300 inline-flex items-center justify-center text-[11px]">3</span>
              <span>{isEn ? 'Re-run Failed Workflow:' : 'ওয়ার্কফ্লোটি পুনরায় চালান'}:</span>
            </div>
            <p className="text-emerald-200 pl-7">
              {isEn
                ? 'Go to Actions tab, click "Re-run all jobs" or push your code. The deployment will immediately succeed and your live website will be live at: '
                : 'Actions ট্যাবে গিয়ে "Re-run all jobs"-এ ক্লিক করুন অথবা কোড পুশ করুন। সাথে সাথে ওয়েবসাইটটি লাইভ হবে: '}
              <span className="text-emerald-400 font-mono">https://tausif-rahaman-raiyan.github.io/Salat-Guard-Prayer-Reminder-Focus-Mode/</span>
            </p>
          </div>
        </div>
      </div>

      {/* Troubleshooting 2: Manifest file is missing or unreadable */}
      <div className="bg-amber-950/40 border border-amber-500/40 rounded-3xl p-7 space-y-4">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
          <h2 className="text-lg font-bold text-amber-300">
            {isEn ? 'Fix: "Manifest file is missing or unreadable"' : 'সমাধান: "Manifest file is missing or unreadable"'}
          </h2>
        </div>
        <div className="text-xs md:text-sm text-amber-100/90 leading-relaxed space-y-3">
          <p>
            {isEn
              ? 'When Chrome displays "Manifest file is missing or unreadable", it means you selected the root repository folder or an outer wrapper folder that does not directly contain manifest.json.'
              : 'গুগল ক্রোমে এই ত্রুটি দেখালে বুঝবেন আপনি মূল প্রজেক্ট রুট ফোল্ডার (যেখানে Vite ও React আছে) সিলেক্ট করেছেন, যার সরাসরি ভেতরে manifest.json নেই। এক্সটেনশনটি prayer-focus-v2 ফোল্ডারে রয়েছে।'}
          </p>
          <div className="bg-black/50 border border-amber-500/20 rounded-xl p-4 font-mono text-xs text-amber-200 space-y-1.5">
            <div className="font-bold text-emerald-400">
              {isEn ? '✓ EXACT folder to select in "Load unpacked":' : '✓ "Load unpacked" এ যে ফোল্ডারটি সিলেক্ট করবেন:'}
            </div>
            <div className="text-rose-400 line-through">❌ Salat-Guard-Prayer-Reminder-Focus-Mode/ (Repository root — Do NOT select)</div>
            <div className="text-emerald-300 font-bold">👉 📂 prayer-focus-v2/ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;← (SELECT THIS FOLDER!)</div>
            <div className="pl-6 text-emerald-400/90">├── 📄 manifest.json &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;← (Present right here!)</div>
            <div className="pl-6 text-emerald-400/70">├── 📁 assets/</div>
            <div className="pl-6 text-emerald-400/70">├── 📁 background/</div>
            <div className="pl-6 text-emerald-400/70">├── 📁 dashboard/</div>
            <div className="pl-6 text-emerald-400/70">├── 📁 modules/</div>
            <div className="pl-6 text-emerald-400/70">└── 📁 popup/</div>
          </div>
          <p className="text-xs text-amber-200/80">
            {isEn
              ? 'Tip: If using prayer-focus-v2.0.0.zip, make sure to extract (unzip) it first into a normal folder before clicking "Load unpacked".'
              : 'টিপস: prayer-focus-v2.0.0.zip ডাউনলোড করলে আগে আনজিপ করে সাধারণ ফোল্ডারে রূপান্তর করুন, তারপর ক্রোম থেকে সিলেক্ট করুন।'}
          </p>
        </div>
      </div>

      {/* Troubleshooting 3: Node 20 & Ubuntu 26 runner notices */}
      <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-3xl p-6 space-y-2">
        <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{isEn ? 'Regarding GitHub Runner Notices (Node 20 & Ubuntu 26)' : 'গিটহাব রানার নোটিশ (Node 20 এবং Ubuntu 26)'}</span>
        </h3>
        <p className="text-xs text-emerald-200/80 leading-relaxed">
          {isEn
            ? 'The messages "Node.js 20 is deprecated... forced to run on Node.js 24" and "ubuntu-latest label will migrate to Ubuntu 26" are harmless informational notices from GitHub runner infrastructure. They do NOT break your build, tests, or releases.'
            : 'Node 20 ও Ubuntu 26 সংক্রান্ত মেসেজগুলো গিটহাবের সার্ভারের সাধারণ সতর্কবার্তা। এটি আপনার কোড, টেস্ট বা এক্সটেনশন রিলিজের কোনো ক্ষতি করে না।'}
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
