(() => {
  // Prevent double injection
  if (window.__PRAYER_FOCUS_CONTENT_LOADED__) return;
  window.__PRAYER_FOCUS_CONTENT_LOADED__ = true;

  const PRAYER_NAMES_BN = {
    fajr: 'ফজর',
    dhuhr: 'যোহর',
    asr: 'আসর',
    maghrib: 'মাগরিব',
    isha: 'এশা'
  };

  let overlayElement = null;
  let timerInterval = null;

  function toBengaliNumerals(str) {
    const digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(str).replace(/[0-9]/g, (w) => digits[+w]);
  }

  function removeOverlay() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    if (overlayElement && overlayElement.parentNode) {
      overlayElement.parentNode.removeChild(overlayElement);
      overlayElement = null;
    }
  }

  function renderOverlay(state) {
    if (!state || !state.show) {
      removeOverlay();
      return;
    }

    if (!overlayElement) {
      overlayElement = document.createElement('div');
      overlayElement.id = 'prayer-focus-overlay-root';
      document.body.appendChild(overlayElement);
    }

    const settings = state.settings || {};
    const isBn = settings.language === 'bn';

    if (state.type === 'focus') {
      // Focus Session Active View
      const session = state.session || {};
      const PRAYER_NAMES_EN = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };
      const prayerName = isBn ? (PRAYER_NAMES_BN[session.prayerKey] || 'ওয়াক্তের') : (PRAYER_NAMES_EN[session.prayerKey] || 'Prayer');
      
      const title = isBn ? `${prayerName}-এর ফোকাস সেশন চলছে` : `${prayerName} Prayer Focus Session Active`;
      const sub = isBn ? 'দুনিয়ার কাজ থেকে বিরতি নিয়ে নামাজ আদায় করুন।' : 'Take a quiet break from worldly distractions and perform your prayer.';
      const quoteText = isBn ? '"কিয়ামতের দিন সর্বপ্রথম মানুষের সালাতের হিসাব নেওয়া হবে।"' : '"The first matter that the slave will be brought to account for on the Day of Judgment is the prayer."';
      const quoteRef = isBn ? 'সুনান আত-তিরমিযী ৪১৩' : 'Sunan an-Nasa\'i 465';
      const disclaimer = isBn 
        ? 'এই উইন্ডোটি নামাজ ফোকাস চলাকালে সচল থাকবে। ব্রাউজারের সিস্টেম পেইজ বা সেটিংস ব্লক করা সম্ভব নয়।'
        : 'This window remains active during prayer focus. Browser internal pages cannot be blocked.';

      const iconUrl = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL ? chrome.runtime.getURL('assets/icons/icon128.png') : '/assets/aistudio/praying_99ed162a.png';

      overlayElement.innerHTML = `
        <div class="pf-card">
          <div class="pf-icon-container"><img src="${iconUrl}" alt="Prayer Focus" style="width: 52px; height: 52px; object-fit: contain; filter: drop-shadow(0 0 10px rgba(52,211,153,0.6)); margin: 0 auto 10px auto;"></div>
          <h2 class="pf-title">${title}</h2>
          <p class="pf-subtext">${sub}</p>
          <div class="pf-focus-timer" id="pf-countdown">--:--</div>
          <div class="pf-quote-box">
            <p class="pf-quote-text">${quoteText}</p>
            <p class="pf-quote-ref">${quoteRef}</p>
          </div>
          <p class="pf-disclaimer">${disclaimer}</p>
        </div>
      `;

      if (timerInterval) clearInterval(timerInterval);

      const updateTimer = () => {
        const remaining = Math.max(0, session.focusEnd - Date.now());
        const totalSec = Math.floor(remaining / 1000);
        const mins = Math.floor(totalSec / 60);
        const secs = totalSec % 60;
        const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        
        const el = document.getElementById('pf-countdown');
        if (el) {
          el.textContent = isBn ? toBengaliNumerals(formatted) : formatted;
        }

        if (remaining <= 0) {
          removeOverlay();
          checkState();
        }
      };

      updateTimer();
      timerInterval = setInterval(updateTimer, 1000);
      return;
    }

    const session = state.session || {};

    const PRAYER_NAMES_EN = {
      fajr: 'Fajr',
      dhuhr: 'Dhuhr',
      asr: 'Asr',
      maghrib: 'Maghrib',
      isha: 'Isha'
    };

    const prayerName = isBn ? (PRAYER_NAMES_BN[session.prayerKey] || 'ওয়াক্তের') : (PRAYER_NAMES_EN[session.prayerKey] || 'Prayer');
    const quote = state.quote || {
      text: isBn ? "নিশ্চয়ই সালাত অশ্লীল ও মন্দ কাজ থেকে বিরত রাখে।" : "Indeed, prayer prohibits immorality and wrongdoing.",
      reference: isBn ? "সূরা আল-আনকাবুত ২৯:৪৫" : "Surah Al-Ankabut 29:45"
    };

    const titleText = isBn ? `এখন ${prayerName} নামাজের সময়` : `It's time for ${prayerName} Prayer`;
    const subText = isBn ? "দুনিয়ার কাজ কিছুক্ষণের জন্য থামিয়ে আল্লাহর ডাকে সাড়া দাও।" : "Pause your worldly tasks for a few moments and answer the call to prayer.";
    const btn1Text = isBn ? "✓ আমি নামাজে যাচ্ছি" : "✓ I am going to pray";
    const btn2Text = isBn ? "৫ মিনিট পরে মনে করিয়ে দিন" : "Remind me in 5 minutes";

      const iconUrl = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL ? chrome.runtime.getURL('assets/icons/icon128.png') : '/assets/aistudio/praying_99ed162a.png';

      overlayElement.innerHTML = `
        <div class="pf-card">
          <div class="pf-icon-container"><img src="${iconUrl}" alt="Prayer Focus" style="width: 52px; height: 52px; object-fit: contain; filter: drop-shadow(0 0 10px rgba(52,211,153,0.6)); margin: 0 auto 10px auto;"></div>
          <h2 class="pf-title">${titleText}</h2>
        <p class="pf-subtext">${subText}</p>
        
        <div class="pf-quote-box">
          <p class="pf-quote-text">"${escapeHtml(quote.text)}"</p>
          <p class="pf-quote-ref">— ${escapeHtml(quote.reference)}</p>
        </div>

        <div class="pf-buttons-row">
          <button id="pf-btn-pray" class="pf-btn-pray">
            ${btn1Text}
          </button>
          <button id="pf-btn-snooze" class="pf-btn-snooze">
            ${btn2Text}
          </button>
        </div>
      </div>
    `;

    // Strict Button 1 handler
    const btnPray = document.getElementById('pf-btn-pray');
    if (btnPray) {
      btnPray.onclick = () => {
        btnPray.disabled = true;
        chrome.runtime.sendMessage({ action: 'ACTION_PRAY' }, () => {
          checkState();
        });
      };
    }

    // Strict Button 2 handler
    const btnSnooze = document.getElementById('pf-btn-snooze');
    if (btnSnooze) {
      btnSnooze.onclick = () => {
        btnSnooze.disabled = true;
        chrome.runtime.sendMessage({ action: 'ACTION_SNOOZE' }, () => {
          removeOverlay();
        });
      };
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function checkState() {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ action: 'GET_OVERLAY_STATE' }, (resp) => {
        if (chrome.runtime.lastError) {
          return;
        }
        if (resp) {
          renderOverlay(resp);
        }
      });
    }
  }

  // Listen for broadcast messages from background service worker
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request) => {
      if (request.action === 'CHECK_OVERLAY') {
        checkState();
      }
    });
  }

  // Initial check on page load
  checkState();
})();
