window.IELTS = window.IELTS || {};
window.IELTS.pages = window.IELTS.pages || {};

window.IELTS.pages.writing = (container) => {
  const history = IELTS.storage.getWritingHistory();
  const settings = IELTS.storage.getSettings();

  container.innerHTML = `
    <div class="page writing-page">
      <div class="page-header">
        <div class="page-title">✍️ 写作练习</div>
        <div class="writing-stats-mini">${history.totalAttempts} 次提交</div>
      </div>

      <!-- Task tabs -->
      <div class="part-tabs">
        <button class="part-tab active" data-task="task1">Task 1<br><small>图表描述</small></button>
        <button class="part-tab" data-task="task2">Task 2<br><small>议论文</small></button>
      </div>

      <div id="writing-content"></div>
    </div>
  `;

  let currentTask = 'task1';
  let currentQuestion = null;

  const taskTabs = container.querySelectorAll('.part-tab');
  taskTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      taskTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTask = tab.dataset.task;
      loadQuestion(currentTask);
    });
  });

  loadQuestion('task1');

  function loadQuestion(task) {
    currentQuestion = IELTS.writingModule.getRandomQuestion(task);
    renderQuestion();
  }

  function renderQuestion() {
    const contentDiv = document.getElementById('writing-content');
    if (!contentDiv || !currentQuestion) return;

    const taskInfo = {
      task1: { minWords: 150, time: '20分钟', label: 'Task 1：图表/流程图描述' },
      task2: { minWords: 250, time: '40分钟', label: 'Task 2：议论文' }
    }[currentTask];

    contentDiv.innerHTML = `
      <div class="writing-question-card card">
        <div class="wq-header">
          <span class="wq-type-badge">${currentQuestion.type}</span>
          <span class="wq-meta">⏱ ${taskInfo.time} | 最少${taskInfo.minWords}词</span>
        </div>
        <div class="wq-title">${currentQuestion.title}</div>
        <div class="wq-prompt">${currentQuestion.prompt}</div>
        ${currentQuestion.imageDesc ? `
          <div class="wq-image-desc">
            <div class="wq-image-label">📊 题目图表说明：</div>
            <div class="wq-image-text">${currentQuestion.imageDesc}</div>
          </div>
        ` : ''}
      </div>

      <!-- Key Arguments hint (collapsible) -->
      <details class="hints-details">
        <summary class="hints-summary">💡 答题思路提示 <span class="expand-hint">（点击展开）</span></summary>
        <div class="hints-content">
          ${renderHints(currentQuestion)}
        </div>
      </details>

      <!-- Text input -->
      <div class="writing-input-section">
        <div class="writing-input-header">
          <span class="writing-input-label">✏️ 你的答案</span>
          <span class="word-count-display" id="word-count">0词</span>
        </div>
        <textarea
          id="writing-textarea"
          class="writing-textarea"
          placeholder="在此输入你的答案…（建议使用键盘输入，可以练习打字速度）"
          rows="12"
        ></textarea>
      </div>

      <!-- Score section -->
      <div id="score-section" style="display:none"></div>

      <!-- Action buttons -->
      <div class="writing-actions">
        <button class="btn btn-secondary" id="btn-new-question">🎲 换一题</button>
        <button class="btn btn-primary" id="btn-submit">提交评分</button>
      </div>

      ${(() => {
        const p = settings.aiProvider || 'anthropic';
        const hasKey = p === 'deepseek' ? !!settings.deepseekKey
                     : p === 'bai'      ? !!settings.baiKey
                     :                    !!settings.apiKey;
        const providerName = p === 'deepseek' ? 'DeepSeek'
                           : p === 'bai'      ? 'B.ai'
                           :                    'Claude Haiku';
        return hasKey
          ? `<div class="api-notice ai-enabled">🤖 <strong>AI评分已启用</strong>（${providerName}）</div>`
          : `<div class="api-notice">💡 <strong>提升评分准确度：</strong>在设置中添加 API Key 可获得AI评分。当前使用规则评分。</div>`;
      })()}
    `;

    // Word count
    const textarea = document.getElementById('writing-textarea');
    const countDisplay = document.getElementById('word-count');
    const minWords = currentTask === 'task1' ? 150 : 250;

    textarea?.addEventListener('input', () => {
      const count = IELTS.writingModule.countWords(textarea.value);
      if (countDisplay) {
        countDisplay.textContent = `${count}词`;
        countDisplay.style.color = count >= minWords ? '#6BCB77' : count > minWords * 0.8 ? '#FFA500' : '#FF6B6B';
      }
    });

    document.getElementById('btn-new-question')?.addEventListener('click', () => loadQuestion(currentTask));

    document.getElementById('btn-submit')?.addEventListener('click', async () => {
      const text = textarea?.value?.trim();
      if (!text || text.length < 50) {
        showToastWriting('请先输入你的答案');
        return;
      }
      await submitForScoring(text);
    });
  }

  async function submitForScoring(text) {
    const btn = document.getElementById('btn-submit');
    const scoreSection = document.getElementById('score-section');
    if (!btn || !scoreSection) return;

    btn.disabled = true;
    btn.textContent = '评分中…';
    scoreSection.style.display = 'none';

    try {
      let result;
      const settings = IELTS.storage.getSettings();
      const provider = settings.aiProvider || 'anthropic';
      const hasKey = provider === 'deepseek' ? !!settings.deepseekKey
                   : provider === 'bai'      ? !!settings.baiKey
                   :                           !!settings.apiKey;

      if (hasKey) {
        try {
          result = await IELTS.writingModule.scoreWithAI(
            text,
            currentQuestion.prompt,
            currentTask
          );
        } catch (aiErr) {
          const noKeyMsgs = ['NO_API_KEY', 'NO_DEEPSEEK_KEY', 'NO_BAI_KEY'];
          if (noKeyMsgs.includes(aiErr.message)) {
            result = IELTS.writingModule.scoreLocally(text, currentTask);
          } else {
            showToastWriting(`AI评分失败: ${aiErr.message}，使用规则评分`);
            result = IELTS.writingModule.scoreLocally(text, currentTask);
          }
        }
      } else {
        result = IELTS.writingModule.scoreLocally(text, currentTask);
      }

      IELTS.writingModule.saveAttempt(currentQuestion.id, text, result.overall);
      renderScoreResult(scoreSection, result);
      scoreSection.style.display = 'block';
      scoreSection.scrollIntoView({ behavior: 'smooth' });

    } catch (err) {
      showToastWriting('评分出错，请重试');
    } finally {
      btn.disabled = false;
      btn.textContent = '提交评分';
    }
  }

  function renderScoreResult(section, result) {
    const bandColor = (band) => {
      if (band >= 7) return '#6BCB77';
      if (band >= 6) return '#4F7FFF';
      if (band >= 5) return '#FFA500';
      return '#FF6B6B';
    };

    section.innerHTML = `
      <div class="score-card card">
        <div class="score-header">
          <div class="score-title">${result.aiScored ? '🤖 AI评分结果' : '📊 评分结果'}</div>
          <div class="score-overall" style="color:${bandColor(result.overall)}">
            ${result.overall}
          </div>
        </div>
        <div class="score-sub">预估综合分</div>

        <div class="score-grid">
          ${['tr', 'cc', 'lr', 'gra'].map(key => `
            <div class="score-item">
              <div class="score-label">${key.toUpperCase()}</div>
              <div class="score-value" style="color:${bandColor(result.scores[key])}">${result.scores[key]}</div>
              <div class="score-bar-wrap">
                <div class="score-bar" style="width:${(result.scores[key]/9)*100}%; background:${bandColor(result.scores[key])}"></div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="score-labels">
          <span>TR: 任务完成</span><span>CC: 连贯衔接</span><span>LR: 词汇量</span><span>GRA: 语法</span>
        </div>

        <div class="score-wordcount">字数：${result.wordCount} 词 | ${currentTask === 'task1' ? '要求150+' : '要求250+'}</div>

        <div class="feedback-section">
          <div class="feedback-title">改进建议：</div>
          ${result.feedback.map(f => `<div class="feedback-item">${f}</div>`).join('')}
        </div>

        ${result.aiScored ? '' : renderBandDescriptors()}
      </div>
    `;
  }

  function renderBandDescriptors() {
    if (!currentQuestion?.bandDescriptors) return '';
    const bd = currentQuestion.bandDescriptors;
    return `
      <div class="band-descriptors">
        <div class="bd-title">雅思评分标准参考：</div>
        ${Object.entries(bd).map(([k, v]) => `
          <div class="bd-item"><span class="bd-key">${k.toUpperCase()}：</span>${v}</div>
        `).join('')}
      </div>
    `;
  }

  function renderHints(question) {
    if (!question) return '';
    const parts = [];

    if (question.keyFeatures) {
      parts.push(`<div class="hint-group"><div class="hint-label">Task1 关键特征：</div>${question.keyFeatures.map(f => `<div class="hint-item">• ${f}</div>`).join('')}</div>`);
    }
    if (question.keyArguments) {
      const ka = question.keyArguments;
      if (ka.for) parts.push(`<div class="hint-group"><div class="hint-label">支持观点：</div>${ka.for.map(f => `<div class="hint-item">• ${f}</div>`).join('')}</div>`);
      if (ka.against) parts.push(`<div class="hint-group"><div class="hint-label">反对观点：</div>${ka.against.map(f => `<div class="hint-item">• ${f}</div>`).join('')}</div>`);
      if (ka.causes) parts.push(`<div class="hint-group"><div class="hint-label">原因：</div>${ka.causes.map(f => `<div class="hint-item">• ${f}</div>`).join('')}</div>`);
      if (ka.solutions) {
        const sols = Array.isArray(ka.solutions) ? ka.solutions : [...(ka.solutions.government || []), ...(ka.solutions.individual || [])];
        parts.push(`<div class="hint-group"><div class="hint-label">解决方案：</div>${sols.map(f => `<div class="hint-item">• ${f}</div>`).join('')}</div>`);
      }
      if (ka.conclusion) parts.push(`<div class="hint-group"><div class="hint-label">结论建议：</div><div class="hint-item">${ka.conclusion}</div></div>`);
    }
    if (question.bandTips) {
      parts.push(`<div class="hint-group"><div class="hint-label">💡 评分技巧：</div><div class="hint-item">${question.bandTips}</div></div>`);
    }
    return parts.join('') || '暂无提示';
  }
};

function showToastWriting(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2500);
}
