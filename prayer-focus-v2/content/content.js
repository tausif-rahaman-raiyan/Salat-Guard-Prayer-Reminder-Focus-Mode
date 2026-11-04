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

    if (state.type === 'focus') {
      // Focus Session Active View
      const session = state.session || {};
      const prayerName = PRAYER_NAMES_BN[session.prayerKey] || 'নামাজ';
      
      overlayElement.innerHTML = `
        <div class="pf-card">
          <div class="pf-icon-container">🕌</div>
          <h2 class="pf-title">${prayerName}-এর ফোকাস সেশন চলছে</h2>
          <p class="pf-subtext">দুনিয়ার কাজ থেকে বিরতি নিয়ে নামাজ আদায় করুন।</p>
          <div class="pf-focus-timer" id="pf-countdown">--:--</div>
          <div class="pf-quote-box">
            <p class="pf-quote-text">"কিয়ামতের দিন সর্বপ্রথম মানুষের সালাতের হিসাব নেওয়া হবে।"</p>
            <p class="pf-quote-ref">সুনান আত-তিরমিযী ৪১৩</p>
          </div>
          <p class="pf-disclaimer">এই উইন্ডোটি নামাজ ফোকাস চলাকালে সচল থাকবে। ব্রাউজারের সিস্টেম পেইজ বা সেটিংস ব্লক করা সম্ভব নয়।</p>
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
          el.textContent = toBengaliNumerals(formatted);
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

    // Reminder View with EXACTLY TWO BUTTONS
    const session = state.session || {};
    const prayerName = PRAYER_NAMES_BN[session.prayerKey] || 'ওয়াক্তের';
    const quote = state.quote || {
      text: "নিশ্চয়ই সালাত অশ্লীল ও মন্দ কাজ থেকে বিরত রাখে।",
      reference: "সূরা আল-আনকাবুত ২৯:৪৫"
    };

    overlayElement.innerHTML = `
      <div class="pf-card">
        <div class="pf-icon-container">🕌</div>
        <h2 class="pf-title">এখন ${prayerName} নামাজের সময়</h2>
        <p class="pf-subtext">দুনিয়ার কাজ কিছুক্ষণের জন্য থামিয়ে আল্লাহর ডাকে সাড়া দাও।</p>
        
        <div class="pf-quote-box">
          <p class="pf-quote-text">"${escapeHtml(quote.text)}"</p>
          <p class="pf-quote-ref">${escapeHtml(quote.reference)}</p>
        </div>

        <div class="pf-buttons-row">
          <button id="pf-btn-pray" class="pf-btn-pray">
            ✓ আমি নামাজে যাচ্ছি
          </button>
          <button id="pf-btn-snooze" class="pf-btn-snooze">
            ৫ মিনিট পরে মনে করিয়ে দিন
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
