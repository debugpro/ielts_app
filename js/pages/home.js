window.IELTS = window.IELTS || {};
window.IELTS.pages = window.IELTS.pages || {};

function getApiStatus() {
  const s = IELTS.storage.getSettings();
  const provider = s.aiProvider || 'anthropic';
  const names = { anthropic: 'Claude', deepseek: 'DeepSeek', bai: 'B.ai' };
  const hasKey = provider === 'deepseek' ? !!s.deepseekKey
               : provider === 'bai'      ? !!s.baiKey
               :                           !!s.apiKey;
  return { provider, name: names[provider] || provider, hasKey };
}

window.IELTS.pages.home = (container) => {
  const stats = IELTS.storage.getStats();
  const vocabProgress = IELTS.vocabModule.getDailyProgress();
  const checkinData = stats.checkin;
  const hasChecked = IELTS.storage.hasCheckedInToday();
  const phaseInfo = IELTS.checkinModule.getPhaseInfo(checkinData.phase || 'foundation');

  const today = new Date();
  const hours = today.getHours();
  const greeting = hours < 12 ? '早上好' : hours < 18 ? '下午好' : '晚上好';

  container.innerHTML = `
    <div class="page home-page">
      <div class="home-header">
        <div class="home-greeting">
          <span class="greeting-text">${greeting}！</span>
          <span class="home-date">${today.toLocaleDateString('zh-CN', {month:'long', day:'numeric', weekday:'short'})}</span>
        </div>
      </div>

      <!-- Streak Banner -->
      <div class="streak-banner ${hasChecked ? 'checked' : ''}">
        <div class="streak-left">
          <div class="streak-fire">${checkinData.streak > 0 ? '🔥' : '⭕'}</div>
          <div class="streak-info">
            <div class="streak-count">${checkinData.streak} 天连续打卡</div>
            <div class="streak-msg">${IELTS.checkinModule.getStreakMessage(checkinData.streak)}</div>
          </div>
        </div>
        ${!hasChecked ? `<button class="checkin-btn" id="quick-checkin">打卡</button>` : `<div class="checked-badge">✓ 已打卡</div>`}
      </div>

      <!-- Phase Progress -->
      <div class="card phase-card">
        <div class="phase-header">
          <span class="phase-emoji">${phaseInfo.emoji}</span>
          <div class="phase-info">
            <div class="phase-name">${phaseInfo.name}</div>
            <div class="phase-desc">${phaseInfo.description}</div>
          </div>
          <div class="phase-days">第${checkinData.totalDays}天</div>
        </div>
        <div class="phase-progress-wrap">
          <div class="phase-bars">
            ${IELTS.checkinModule.PHASES.map((p, i) => `
              <div class="phase-bar-item ${p.id === checkinData.phase ? 'active' : ''} ${checkinData.totalDays > (i * 30) ? 'done' : ''}">
                <div class="phase-bar-fill" style="background:${p.color}; width:${p.id === checkinData.phase ? IELTS.checkinModule.getPhaseProgress(checkinData.totalDays).progressPercent : (checkinData.totalDays > (i+1)*30 ? 100 : 0)}%"></div>
                <div class="phase-bar-label">${p.name}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Today's Progress -->
      <div class="section-title">今日进度</div>
      <div class="today-grid">
        <div class="today-card" id="go-vocab">
          <div class="today-icon">📚</div>
          <div class="today-label">词汇</div>
          <div class="today-progress-bar">
            <div class="today-bar-fill" style="width:${vocabProgress.percentage}%"></div>
          </div>
          <div class="today-count">${vocabProgress.todayCount}/${vocabProgress.target}</div>
        </div>
        <div class="today-card" id="go-speaking">
          <div class="today-icon">🎙️</div>
          <div class="today-label">口语</div>
          <div class="today-sessions">${stats.speaking.totalSessions} 次练习</div>
          <div class="today-count">${stats.speaking.practicedCount || 0}题</div>
        </div>
        <div class="today-card" id="go-writing">
          <div class="today-icon">✍️</div>
          <div class="today-label">写作</div>
          <div class="today-sessions">${stats.writing.totalAttempts} 次提交</div>
          <div class="today-count">历史记录</div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="section-title">词汇总览</div>
      <div class="vocab-overview card">
        <div class="vocab-stat">
          <div class="vocab-stat-num" style="color:#6BCB77">${vocabProgress.known}</div>
          <div class="vocab-stat-label">已掌握</div>
        </div>
        <div class="vocab-divider"></div>
        <div class="vocab-stat">
          <div class="vocab-stat-num" style="color:#FF6B6B">${vocabProgress.unknown}</div>
          <div class="vocab-stat-label">需复习</div>
        </div>
        <div class="vocab-divider"></div>
        <div class="vocab-stat">
          <div class="vocab-stat-num" style="color:#4F7FFF">${vocabProgress.total - vocabProgress.known - vocabProgress.unknown}</div>
          <div class="vocab-stat-label">未学习</div>
        </div>
        <div class="vocab-divider"></div>
        <div class="vocab-stat">
          <div class="vocab-stat-num">${vocabProgress.total}</div>
          <div class="vocab-stat-label">总词数</div>
        </div>
      </div>

      <!-- Tips -->
      <div class="tip-card card">
        <div class="tip-icon">💡</div>
        <div class="tip-content">
          <div class="tip-title">今日备考提示</div>
          <div class="tip-text">${getDailyTip()}</div>
        </div>
      </div>

      <!-- Settings link -->
      <div class="settings-row">
        <button class="settings-link" id="open-settings">
          ⚙️ 设置 / API Key
          <span class="api-status-badge" id="api-status-badge">${(() => { const a = getApiStatus(); return a.hasKey ? `<span class="api-badge-on">${a.name} ✓</span>` : `<span class="api-badge-off">未配置</span>`; })()}</span>
        </button>
      </div>
    </div>
  `;

  // Quick checkin
  const checkinBtn = document.getElementById('quick-checkin');
  if (checkinBtn) {
    checkinBtn.addEventListener('click', () => {
      IELTS.storage.doCheckin();
      IELTS.router.navigate('home');
    });
  }

  document.getElementById('go-vocab')?.addEventListener('click', () => IELTS.router.navigate('vocabulary'));
  document.getElementById('go-speaking')?.addEventListener('click', () => IELTS.router.navigate('speaking'));
  document.getElementById('go-writing')?.addEventListener('click', () => IELTS.router.navigate('writing'));
  document.getElementById('open-settings')?.addEventListener('click', () => showSettings());
};

function getDailyTip() {
  const tips = [
    'IELTS写作Task2：第一段改写题目，不要直接复制原句。使用同义词替换。',
    '雅思口语Part2：提前准备5-6个万能话题（老人/孩子/地方/物品），大多数题目都能套用。',
    '词汇技巧：学一个词，同时学它的同义词和搭配。例如：important = crucial, vital, significant。',
    '雅思听力：预读题目是关键！在音频开始前30秒，快速浏览问题并预测答案类型。',
    '写作CC分提升：每段第一句写主题句，最后一句做小结，段落之间用连接词过渡。',
    '口语流利度：不要害怕短暂停顿。用"Well...", "That\'s a good question...", "Let me think..."赢得思考时间。',
    '雅思阅读：先看题目，再读文章，用scanning技巧定位关键词。',
    '冲击8分词汇技巧：多读学术文章，关注搭配（collocation）而不只是单词，如 "address an issue"，"draw a conclusion"。',
    '写作GRA分：使用3种以上句式：简单句、复合句、含从句的复杂句。',
    'Task1描述数据：先写overview（总体趋势），再写具体数据，避免逐一罗列所有数字。',
  ];
  const dayIndex = new Date().getDate() % tips.length;
  return tips[dayIndex];
}

function showSettings() {
  const settings = IELTS.storage.getSettings();
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-title">⚙️ 设置</div>
      <div class="modal-section">
        <div class="modal-label">AI 评分提供商</div>
        <div class="provider-tabs">
          <label class="provider-tab ${(settings.aiProvider || 'anthropic') === 'anthropic' ? 'active' : ''}">
            <input type="radio" name="ai-provider" value="anthropic" ${(settings.aiProvider || 'anthropic') === 'anthropic' ? 'checked' : ''}>
            Claude (Anthropic)
          </label>
          <label class="provider-tab ${settings.aiProvider === 'deepseek' ? 'active' : ''}">
            <input type="radio" name="ai-provider" value="deepseek" ${settings.aiProvider === 'deepseek' ? 'checked' : ''}>
            DeepSeek
          </label>
          <label class="provider-tab ${settings.aiProvider === 'bai' ? 'active' : ''}">
            <input type="radio" name="ai-provider" value="bai" ${settings.aiProvider === 'bai' ? 'checked' : ''}>
            B.ai
          </label>
        </div>
      </div>
      <div class="modal-section" id="key-section-anthropic" style="display:${(settings.aiProvider||'anthropic')==='anthropic'?'block':'none'}">
        <div class="modal-label">Anthropic API Key</div>
        <div class="modal-hint">获取：console.anthropic.com</div>
        <input type="password" id="api-key-input" class="modal-input" placeholder="sk-ant-..." value="${settings.apiKey || ''}">
      </div>
      <div class="modal-section" id="key-section-deepseek" style="display:${settings.aiProvider==='deepseek'?'block':'none'}">
        <div class="modal-label">DeepSeek API Key</div>
        <div class="modal-hint">获取：platform.deepseek.com</div>
        <input type="password" id="deepseek-key-input" class="modal-input" placeholder="sk-..." value="${settings.deepseekKey || ''}">
      </div>
      <div class="modal-section" id="key-section-bai" style="display:${settings.aiProvider==='bai'?'block':'none'}">
        <div class="modal-label">B.ai API Key</div>
        <div class="modal-hint">获取：api.b.ai</div>
        <input type="password" id="bai-key-input" class="modal-input" placeholder="sk-..." value="${settings.baiKey || ''}">
      </div>
      <div class="modal-section">
        <div class="modal-label">每日词汇目标</div>
        <input type="number" id="daily-target-input" class="modal-input" min="10" max="50" value="${settings.dailyVocabTarget || 20}">
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="modal-cancel">取消</button>
        <button class="btn btn-primary" id="modal-save">保存</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.addEventListener('click', e => {
    if (e.target === modal) modal.remove();
  });

  document.getElementById('modal-cancel').addEventListener('click', () => modal.remove());
  modal.querySelectorAll('input[name="ai-provider"]').forEach(radio => {
    radio.addEventListener('change', () => {
      modal.querySelectorAll('.provider-tab').forEach(t => t.classList.remove('active'));
      radio.closest('.provider-tab').classList.add('active');
      ['anthropic', 'deepseek', 'bai'].forEach(p => {
        const sec = document.getElementById(`key-section-${p}`);
        if (sec) sec.style.display = radio.value === p ? 'block' : 'none';
      });
    });
  });

  document.getElementById('modal-save').addEventListener('click', () => {
    const selectedProvider = modal.querySelector('input[name="ai-provider"]:checked')?.value || 'anthropic';
    const newSettings = {
      ...settings,
      apiKey: document.getElementById('api-key-input').value.trim(),
      deepseekKey: document.getElementById('deepseek-key-input').value.trim(),
      baiKey: document.getElementById('bai-key-input').value.trim(),
      aiProvider: selectedProvider,
      dailyVocabTarget: parseInt(document.getElementById('daily-target-input').value) || 20
    };
    IELTS.storage.saveSettings(newSettings);
    modal.remove();
    showToast('设置已保存');
    const badge = document.getElementById('api-status-badge');
    if (badge) {
      const a = getApiStatus();
      badge.innerHTML = a.hasKey ? `<span class="api-badge-on">${a.name} ✓</span>` : `<span class="api-badge-off">未配置</span>`;
    }
  });
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2000);
}
