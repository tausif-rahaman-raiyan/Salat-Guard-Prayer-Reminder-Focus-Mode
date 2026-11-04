import { getDhakaDateString, toBengaliNumerals } from './timezone.js';
import { getMonthlyStats, getPrayerRecordForDate, PRAYER_LIST } from './prayer-tracker.js';
import { PRAYER_NAMES } from './prayer-api.js';

let selectedDate = getDhakaDateString();

export async function renderMonthlyCalendar(containerEl, year, month, onSelectDateCallback, lang = 'en') {
  if (!containerEl) return;
  containerEl.innerHTML = '';

  const stats = await getMonthlyStats(year, month);
  const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayStr = getDhakaDateString();

  // Empty cells before first day
  for (let i = 0; i < firstDayIndex; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'cal-day-cell empty';
    emptyCell.style.opacity = '0.2';
    emptyCell.style.pointerEvents = 'none';
    containerEl.appendChild(emptyCell);
  }

  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const rec = stats.dailyRecords[dayStr] || {};
    
    const cell = document.createElement('div');
    cell.className = 'cal-day-cell';
    if (dayStr === todayStr) cell.classList.add('is-today');
    if (dayStr === selectedDate) cell.classList.add('is-selected');

    // Day number
    const numEl = document.createElement('span');
    numEl.className = 'day-number';
    numEl.textContent = lang === 'bn' ? toBengaliNumerals(day) : String(day);
    cell.appendChild(numEl);

    // 5 prayer dots
    const dotsRow = document.createElement('div');
    dotsRow.className = 'day-dots-row';

    PRAYER_LIST.forEach((p) => {
      const dot = document.createElement('span');
      dot.className = 'dot-indicator';
      if (rec[p] === 'prayed') dot.classList.add('prayed');
      else if (rec[p] === 'missed') dot.classList.add('missed');
      dotsRow.appendChild(dot);
    });

    cell.appendChild(dotsRow);

    cell.onclick = () => {
      selectedDate = dayStr;
      document.querySelectorAll('.cal-day-cell').forEach((c) => c.classList.remove('is-selected'));
      cell.classList.add('is-selected');
      if (onSelectDateCallback) {
        onSelectDateCallback(dayStr, rec, lang);
      }
    };

    containerEl.appendChild(cell);
  }
}

export function renderDateDetails(containerEl, dateStr, rec) {
  if (!containerEl) return;
  const todayStr = getDhakaDateString();
  const isToday = dateStr === todayStr;

  let prayedCount = 0;
  let missedCount = 0;
  let hasActivity = false;

  PRAYER_LIST.forEach((p) => {
    if (rec[p] === 'prayed') {
      prayedCount++;
      hasActivity = true;
    } else if (rec[p] === 'missed') {
      missedCount++;
      hasActivity = true;
    }
  });

  if (!hasActivity) {
    containerEl.innerHTML = `
      <div style="text-align: center; padding: 10px;">
        <h4 style="color: #6ee7b7; font-size: 15px; margin-bottom: 6px;">
          তারিখ: ${toBengaliNumerals(dateStr)} ${isToday ? '(আজ)' : ''}
        </h4>
        <p style="color: #a7f3d0; font-size: 14px;">এই তারিখে কোনো কার্যক্রম এখনো রেকর্ড করা হয়নি।</p>
      </div>
    `;
    return;
  }

  const itemsHtml = PRAYER_LIST.map((key) => {
    const status = rec[key] || 'none';
    const statusText = status === 'prayed' ? 'আদায় করা হয়েছে ✓' : status === 'missed' ? 'ছুটে গেছে ✕' : 'রেকর্ড নেই';
    const color = status === 'prayed' ? '#34d399' : status === 'missed' ? '#f87171' : '#9ca3af';

    return `
      <div style="display: flex; justify-content: space-between; padding: 6px 12px; background: rgba(0,0,0,0.25); border-radius: 8px; margin-bottom: 4px;">
        <span style="font-weight: 600;">${PRAYER_NAMES[key].bn}</span>
        <span style="color: ${color}; font-weight: 700;">${statusText}</span>
      </div>
    `;
  }).join('');

  containerEl.innerHTML = `
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(52, 211, 153, 0.2); padding-bottom: 8px;">
        <h4 style="color: #6ee7b7; font-size: 15px;">
          তারিখ: ${toBengaliNumerals(dateStr)} ${isToday ? '(আজ)' : ''}
        </h4>
        <span style="font-size: 13px; color: #d1fae5;">আদায়: ${toBengaliNumerals(prayedCount)}/৫ | ছুটে গেছে: ${toBengaliNumerals(missedCount)}</span>
      </div>
      <div>
        ${itemsHtml}
      </div>
    </div>
  `;
}
