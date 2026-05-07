window.IELTS = window.IELTS || {};
window.IELTS.pages = window.IELTS.pages || {};

window.IELTS.pages.checkin = (container) => {
  const data = IELTS.checkinModule.getData();
  const phaseProgress = IELTS.checkinModule.getPhaseProgress(data.totalDays);
  const calendar = IELTS.checkinModule.getCalendarData();
  const hasChecked = IELTS.checkinModule.hasCheckedInToday();

  container.innerHTML = `
    <div class="page checkin-page">
      <div class="page-header">
        <div class="page-title">📅 学习打卡</div>
      </div>

      <!-- Main checkin card -->
      <div class="checkin-main-card card ${hasChecked ? 'checked-today' : ''}">
        <div class="checkin-streak-display">
          <div class="streak-flame">${data.streak > 6 ? '🔥🔥' : data.streak > 0 ? '🔥' : '💤'}</div>
          <div class="streak-number">${data.streak}</div>
          <div class="streak-label">天连续打卡</div>
        </div>
        <div class="streak-message">${IELTS.checkinModule.getStreakMessage(data.streak)}</div>
        ${hasChecked
          ? `<div class="already-checked">✅ 今天已打卡 太棒了！</div>`
          : `<button class="checkin-main-btn" id="main-checkin-btn">🎯 今日打卡</button>`
        }
        <div class="total-days-text">累计学习 ${data.totalDays} 天</div>
      </div>

      <!-- Phase Progress -->
      <div class="section-title">学习阶段进度</div>
      <div class="phases-container">
        ${IELTS.checkinModule.PHASES.map((phase, i) => {
          const phaseStartDay = i * 30;
          const isActive = phase.id === phaseProgress.phase.id;
          const isDone = data.totalDays > (i + 1) * 30;
          let pct = 0;
          if (isDone) pct = 100;
          else if (isActive) pct = phaseProgress.progressPercent;

          return `
            <div class="phase-item ${isActive ? 'phase-active' : ''} ${isDone ? 'phase-done' : ''}">
              <div class="phase-item-header">
                <span class="phase-item-emoji">${phase.emoji}</span>
                <span class="phase-item-name">${phase.name}</span>
                <span class="phase-item-days">第${phaseStartDay + 1}–${(i + 1) * 30}天</span>
                ${isDone ? '<span class="phase-done-badge">✓</span>' : ''}
                ${isActive ? `<span class="phase-active-badge">${phaseProgress.daysInPhase}/${phaseProgress.phaseTotal}天</span>` : ''}
              </div>
              <div class="phase-item-bar">
                <div class="phase-item-fill" style="width:${pct}%; background:${phase.color}"></div>
              </div>
              <div class="phase-item-desc">${phase.description}</div>
              <div class="phase-item-target">📌 ${phase.target}</div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- 30-day Calendar -->
      <div class="section-title">近30天打卡记录</div>
      <div class="calendar-grid">
        ${calendar.map(day => `
          <div class="cal-day ${day.checked ? 'cal-checked' : ''} ${day.isToday ? 'cal-today' : ''}">
            <div class="cal-num">${day.day}</div>
            ${day.checked ? '<div class="cal-dot"></div>' : ''}
          </div>
        `).join('')}
      </div>
      <div class="calendar-legend">
        <span class="legend-item"><span class="legend-dot checked"></span>已打卡</span>
        <span class="legend-item"><span class="legend-dot today"></span>今天</span>
      </div>

      <!-- Overall Stats -->
      <div class="section-title">学习统计</div>
      <div class="stats-grid">
        ${renderAllStats(data)}
      </div>

      <!-- Motivation quote -->
      <div class="motivation-card card">
        <div class="motivation-text">${getMotivationQuote()}</div>
      </div>
    </div>
  `;

  // Checkin button
  document.getElementById('main-checkin-btn')?.addEventListener('click', () => {
    const result = IELTS.checkinModule.doCheckin();

    if (result.alreadyChecked) {
      showCheckinToast('今天已经打卡了！');
      return;
    }

    // Celebration animation
    const btn = document.getElementById('main-checkin-btn');
    const card = btn?.closest('.checkin-main-card');
    if (card) card.classList.add('checking-in');

    showCheckinAnimation(result.streak);

    setTimeout(() => {
      IELTS.router.navigate('checkin');
    }, 1500);
  });
};

function renderAllStats(data) {
  const stats = IELTS.storage.getStats();
  const items = [
    { label: '最长连续', value: (data.maxStreak || data.streak) + '天', icon: '🔥' },
    { label: '累计打卡', value: data.totalDays + '天', icon: '📅' },
    { label: '已掌握词汇', value: stats.vocab.known.length + '词', icon: '📚' },
    { label: '口语练习', value: stats.speaking.totalSessions + '次', icon: '🎙️' },
    { label: '写作提交', value: stats.writing.totalAttempts + '次', icon: '✍️' },
    { label: '当前阶段', value: IELTS.checkinModule.getPhaseInfo(data.phase).name, icon: '🎯' }
  ];

  return items.map(item => `
    <div class="stat-item card">
      <div class="stat-icon">${item.icon}</div>
      <div class="stat-value">${item.value}</div>
      <div class="stat-label">${item.label}</div>
    </div>
  `).join('');
}

function showCheckinAnimation(streak) {
  const overlay = document.createElement('div');
  overlay.className = 'checkin-celebration';
  overlay.innerHTML = `
    <div class="celebration-content">
      <div class="celebration-emoji">${streak >= 7 ? '🎉🔥🎉' : '✅'}</div>
      <div class="celebration-text">打卡成功！</div>
      <div class="celebration-streak">连续 ${streak} 天</div>
    </div>
  `;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('show'), 10);
  setTimeout(() => {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 300);
  }, 1200);
}

function showCheckinToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2000);
}

function getMotivationQuote() {
  const quotes = [
    '"The secret of getting ahead is getting started." — Mark Twain',
    '"你的雅思7分之路，始于今天的每一个单词。"',
    '"Excellence is not a singular act but a habit." — Aristotle',
    '"每一个学过的单词，都是通往梦想的一块砖。"',
    '"Success is the sum of small efforts, repeated day in and day out." — Robert Collier',
    '"每天进步一点点，三个月后你会感谢今天坚持的自己。"',
    '"The future depends on what you do today." — Mahatma Gandhi',
    '"雅思备考不是短跑，是马拉松。坚持，就是胜利。"',
  ];
  return quotes[new Date().getDate() % quotes.length];
}
