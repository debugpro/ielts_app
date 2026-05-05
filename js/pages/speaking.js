window.IELTS = window.IELTS || {};
window.IELTS.pages = window.IELTS.pages || {};

window.IELTS.pages.speaking = (container) => {
  const stats = IELTS.speakingModule.getStats();

  container.innerHTML = `
    <div class="page speaking-page">
      <div class="page-header">
        <div class="page-title">🎙️ 口语练习</div>
        <div class="speaking-stats-mini">${stats.totalSessions} 次练习</div>
      </div>

      <!-- Part selector -->
      <div class="part-tabs">
        <button class="part-tab active" data-part="part1">Part 1<br><small>常规问答</small></button>
        <button class="part-tab" data-part="part2">Part 2<br><small>长段独白</small></button>
        <button class="part-tab" data-part="part3">Part 3<br><small>深度讨论</small></button>
      </div>

      <!-- Content area -->
      <div id="speaking-content"></div>
    </div>
  `;

  let currentPart = 'part1';

  const partTabs = container.querySelectorAll('.part-tab');
  partTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      partTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentPart = tab.dataset.part;
      renderPartContent(currentPart);
    });
  });

  renderPartContent('part1');

  function renderPartContent(part) {
    const contentDiv = document.getElementById('speaking-content');
    if (!contentDiv) return;

    const partDescriptions = {
      part1: { desc: '考官就熟悉话题提问，如工作、家庭、爱好', time: '4-5分钟', tips: '自然回答，适当展开，避免过长' },
      part2: { desc: '根据题卡准备1分钟，然后独立发言2分钟', time: '3-4分钟', tips: '使用题卡所有要点，逻辑清晰' },
      part3: { desc: '与考官深度讨论Part2话题相关的抽象问题', time: '4-5分钟', tips: '表达个人观点，给出理由和例子' }
    };

    const info = partDescriptions[part];
    const question = IELTS.speakingModule.getRandomQuestion(part);
    const allQuestions = IELTS.speakingModule.getAllQuestions(part);

    contentDiv.innerHTML = `
      <div class="part-info-card card">
        <div class="part-info-time">⏱ ${info.time}</div>
        <div class="part-info-desc">${info.desc}</div>
        <div class="part-info-tip">💡 ${info.tips}</div>
      </div>

      ${part === 'part2' ? renderPart2(question) : renderPart13(question, part)}

      <div class="speaking-btn-row">
        <button class="btn btn-secondary" id="btn-random">🎲 换一题</button>
        <button class="btn btn-outline" id="btn-browse-speaking">📋 题库</button>
      </div>
    `;

    if (part === 'part2') {
      setupPart2Timer();
    }

    document.getElementById('btn-random')?.addEventListener('click', () => renderPartContent(part));
    document.getElementById('btn-browse-speaking')?.addEventListener('click', () => showQuestionBrowser(part, allQuestions));

    // Mark as practiced
    if (question) IELTS.speakingModule.recordSession(question.id);
  }

  function renderPart13(question, part) {
    if (!question) return '<div class="empty-state">暂无题目</div>';
    return `
      <div class="question-card card">
        <div class="q-topic-badge">${question.topic}</div>
        <div class="q-main">${question.question}</div>
        ${question.followup ? `
          <div class="q-followup-title">可能的追问：</div>
          ${question.followup.map(f => `<div class="q-followup">• ${f}</div>`).join('')}
        ` : ''}
        ${question.samplePoints ? `
          <div class="q-followup-title">答题要点：</div>
          ${question.samplePoints.map(p => `<div class="q-followup">• ${p}</div>`).join('')}
        ` : ''}
      </div>
      <div class="tips-card card">
        <div class="tips-title">🎯 评分提示</div>
        <div class="tips-text">${question.tips || question.bandTips || ''}</div>
      </div>
    `;
  }

  function renderPart2(question) {
    if (!question) return '<div class="empty-state">暂无题目</div>';
    return `
      <div class="question-card card part2-card">
        <div class="q-topic-badge">${question.topic}</div>
        <div class="q-prompt">${question.prompt.replace(/\n/g, '<br>')}</div>
      </div>

      <div class="timer-section card" id="timer-section">
        <div class="timer-phase" id="timer-phase">准备阶段</div>
        <div class="timer-display" id="timer-display">1:00</div>
        <div class="timer-hint" id="timer-hint">1分钟准备时间</div>
        <div class="timer-controls">
          <button class="btn btn-primary" id="btn-start-prep">开始准备</button>
        </div>
      </div>

      <div class="tips-card card">
        <div class="tips-title">🎯 答题要点</div>
        ${question.keyPoints.map(p => `<div class="key-point">• ${p}</div>`).join('')}
        <div class="tips-title" style="margin-top:12px">💡 评分提示</div>
        <div class="tips-text">${question.bandTips}</div>
      </div>
    `;
  }

  function setupPart2Timer() {
    let phase = 'idle'; // idle | prep | speaking | done

    const startPrepBtn = document.getElementById('btn-start-prep');
    if (!startPrepBtn) return;

    startPrepBtn.addEventListener('click', () => {
      if (phase === 'idle') {
        phase = 'prep';
        document.getElementById('timer-phase').textContent = '📝 准备中';
        document.getElementById('timer-hint').textContent = '记下要点，1分钟后自动开始答题';
        startPrepBtn.textContent = '跳过准备';

        IELTS.speakingModule.startTimer(60,
          (s) => {
            const el = document.getElementById('timer-display');
            if (el) el.textContent = IELTS.speakingModule.formatTime(s);
          },
          () => startSpeaking()
        );
      } else if (phase === 'prep') {
        IELTS.speakingModule.stopTimer();
        startSpeaking();
      } else if (phase === 'speaking') {
        IELTS.speakingModule.stopTimer();
        endSpeaking();
      }
    });

    function startSpeaking() {
      phase = 'speaking';
      const phaseEl = document.getElementById('timer-phase');
      const hintEl = document.getElementById('timer-hint');
      const btn = document.getElementById('btn-start-prep');
      if (phaseEl) phaseEl.textContent = '🎙️ 答题中';
      if (hintEl) hintEl.textContent = '按雅思标准回答，2分钟内完成';
      if (btn) btn.textContent = '结束答题';

      IELTS.speakingModule.startTimer(120,
        (s) => {
          const el = document.getElementById('timer-display');
          if (el) {
            el.textContent = IELTS.speakingModule.formatTime(s);
            el.style.color = s <= 30 ? '#FF6B6B' : '#4F7FFF';
          }
        },
        () => endSpeaking()
      );
    }

    function endSpeaking() {
      phase = 'done';
      const phaseEl = document.getElementById('timer-phase');
      const hintEl = document.getElementById('timer-hint');
      const displayEl = document.getElementById('timer-display');
      const btn = document.getElementById('btn-start-prep');
      if (phaseEl) phaseEl.textContent = '✅ 完成';
      if (hintEl) hintEl.textContent = '参考评分要点检查你的回答';
      if (displayEl) { displayEl.textContent = '完成'; displayEl.style.color = '#6BCB77'; }
      if (btn) { btn.textContent = '重新开始'; btn.onclick = () => setupPart2Timer(); }
    }
  }
};

function showQuestionBrowser(part, questions) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';

  const partNames = { part1: 'Part 1', part2: 'Part 2', part3: 'Part 3' };

  modal.innerHTML = `
    <div class="modal-card modal-fullscreen">
      <div class="modal-header">
        <div class="modal-title">🎙️ ${partNames[part]} 题库</div>
        <button class="modal-close" id="q-close">✕</button>
      </div>
      <div class="question-list">
        ${questions.map((q, i) => `
          <div class="q-list-item" data-index="${i}">
            <div class="q-list-num">${i + 1}</div>
            <div class="q-list-content">
              <div class="q-list-topic">${q.topic}</div>
              <div class="q-list-q">${q.question || q.prompt?.split('\n')[0] || ''}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('q-close').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}
