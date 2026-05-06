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
        <button class="part-tab" data-part="reading">跟读<br><small>范文朗读</small></button>
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
      if (currentPart === 'reading') {
        renderReadingContent();
      } else {
        renderPartContent(currentPart);
      }
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

  let currentPassageIndex = 0;

  function renderReadingContent() {
    const contentDiv = document.getElementById('speaking-content');
    if (!contentDiv) return;

    const passages = window.IELTS.speakingPassages || [];
    if (!passages.length) return;

    const passage = passages[currentPassageIndex];
    const recentTopics = IELTS.storage.getCustomPassages().slice(0, 3).map(p => p.topic);

    contentDiv.innerHTML = `
      <div class="passage-nav card">
        <div class="passage-nav-info">
          <span class="passage-topic-badge">${passage.topic}</span>
          <span class="passage-level level-${passage.level}">${passage.level}</span>
          <span class="passage-duration">⏱ ${passage.duration}</span>
        </div>
        <div class="passage-nav-title">${passage.topicEn}</div>
        <div class="passage-counter">${currentPassageIndex + 1} / ${passages.length}</div>
      </div>

      <div class="passage-legend">
        <span class="legend-vocab">加粗蓝色</span> 词汇表单词 &nbsp;
        <span class="legend-phrase">黄色背景</span> 高频短语
      </div>

      <div class="passage-card card">
        <div class="passage-text" id="passage-text">${highlightPassage(passage)}</div>
      </div>

      <div class="passage-actions">
        <button class="btn btn-outline" id="btn-tts">🔊 朗读范文</button>
        <button class="btn btn-secondary" id="btn-prev-passage" ${currentPassageIndex === 0 ? 'disabled' : ''}>← 上一篇</button>
        <button class="btn btn-primary" id="btn-next-passage" ${currentPassageIndex === passages.length - 1 ? 'disabled' : ''}>下一篇 →</button>
      </div>

      <div class="passage-phrases card">
        <div class="phrases-title">📌 本文高频短语</div>
        ${passage.keyPhrases.map(p => `<div class="phrase-item">"${p}"</div>`).join('')}
      </div>

      <div class="custom-gen-section card">
        <div class="custom-gen-title">✨ AI生成段落</div>
        <div class="custom-gen-sub">输入任意话题，让AI生成专属口语范文</div>
        <div class="custom-gen-row">
          <input type="text" id="custom-topic-input" class="custom-gen-input"
                 placeholder="如：climate change, family, travel..." maxlength="60">
          <button class="btn btn-primary" id="btn-gen-passage">生成</button>
        </div>
        ${recentTopics.length ? `
          <div class="custom-recent">
            ${recentTopics.map(t => `<button class="custom-chip" data-topic="${t}">${t}</button>`).join('')}
          </div>
        ` : ''}
        <div id="custom-gen-result"></div>
      </div>
    `;

    let ttsActive = false;
    document.getElementById('btn-tts')?.addEventListener('click', () => {
      if (ttsActive) {
        window.speechSynthesis.cancel();
        ttsActive = false;
        document.getElementById('btn-tts').textContent = '🔊 朗读范文';
      } else {
        const utter = new SpeechSynthesisUtterance(passage.text);
        utter.lang = 'en-US';
        utter.rate = 0.9;
        utter.onend = () => {
          ttsActive = false;
          const btn = document.getElementById('btn-tts');
          if (btn) btn.textContent = '🔊 朗读范文';
        };
        window.speechSynthesis.speak(utter);
        ttsActive = true;
        document.getElementById('btn-tts').textContent = '⏹ 停止朗读';
      }
    });

    document.getElementById('btn-prev-passage')?.addEventListener('click', () => {
      window.speechSynthesis.cancel();
      currentPassageIndex--;
      renderReadingContent();
    });

    document.getElementById('btn-next-passage')?.addEventListener('click', () => {
      window.speechSynthesis.cancel();
      currentPassageIndex++;
      renderReadingContent();
    });

    document.getElementById('btn-gen-passage')?.addEventListener('click', async () => {
      const input = document.getElementById('custom-topic-input');
      const topic = input?.value.trim();
      if (!topic) { input?.focus(); return; }

      const resultDiv = document.getElementById('custom-gen-result');
      const btn = document.getElementById('btn-gen-passage');
      btn.disabled = true;
      btn.textContent = '生成中...';
      resultDiv.innerHTML = '<div class="custom-gen-loading">🤖 AI生成中，请稍候...</div>';

      try {
        const generated = await generateCustomPassage(topic);
        renderCustomPassageResult(generated, resultDiv);
        input.value = '';
      } catch (e) {
        resultDiv.innerHTML = `<div class="custom-gen-error">⚠️ ${e.message}</div>`;
      } finally {
        btn.disabled = false;
        btn.textContent = '生成';
      }
    });

    contentDiv.querySelectorAll('.custom-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const input = document.getElementById('custom-topic-input');
        if (input) { input.value = chip.dataset.topic; input.focus(); }
      });
    });
  }

  function highlightPassage(passage) {
    let text = passage.text;

    // Escape HTML
    text = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    // Highlight key phrases (yellow bg) — longest first to avoid partial overlaps
    const sortedPhrases = [...passage.keyPhrases].sort((a,b) => b.length - a.length);
    sortedPhrases.forEach(phrase => {
      const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      text = text.replace(new RegExp(escaped, 'gi'),
        m => `<mark class="highlight-phrase">${m}</mark>`);
    });

    // Highlight vocab words (bold blue) — skip if already inside a mark
    const sortedVocab = [...passage.vocabWords].sort((a,b) => b.length - a.length);
    sortedVocab.forEach(word => {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      text = text.replace(new RegExp(`(?<![a-zA-Z])(${escaped})(?![a-zA-Z])`, 'gi'),
        m => `<strong class="highlight-vocab">${m}</strong>`);
    });

    return text;
  }

async function generateCustomPassage(topic) {
  const settings = IELTS.storage.getSettings();
  const provider = settings.aiProvider || 'anthropic';
  const hasKey = provider === 'deepseek' ? !!settings.deepseekKey
               : provider === 'bai'      ? !!settings.baiKey
               :                           !!settings.apiKey;
  if (!hasKey) throw new Error('请先在首页设置 API Key');

  const prompt = `Write a high-quality IELTS speaking practice passage about "${topic}".

Requirements:
- 200-250 words of natural spoken English
- Suitable for IELTS Band 7-8 model answer
- Varied vocabulary and complex sentence structures
- Natural discourse markers and linking expressions

Return ONLY valid JSON (no markdown, no other text):
{
  "topicEn": "Topic Name in English",
  "text": "The full passage text...",
  "keyPhrases": ["phrase 1", "phrase 2", "phrase 3", "phrase 4", "phrase 5"],
  "vocabWords": ["word1", "word2", "word3", "word4", "word5", "word6", "word7", "word8"]
}

keyPhrases: 4-6 multi-word expressions (2+ words) that appear verbatim in the text
vocabWords: 6-10 individual IELTS-level words (single words) that appear in the text`;

  let content;
  if (provider === 'deepseek') {
    const r = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${settings.deepseekKey}` },
      body: JSON.stringify({ model: 'deepseek-chat', max_tokens: 1024, messages: [{ role: 'user', content: prompt }] })
    });
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error?.message || `DeepSeek error ${r.status}`); }
    content = (await r.json()).choices[0].message.content;
  } else if (provider === 'bai') {
    const r = await fetch('https://api.b.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${settings.baiKey}` },
      body: JSON.stringify({ model: 'gpt-5.4-nano', max_tokens: 1024, temperature: 0.7, response_format: { type: 'json_object' }, messages: [{ role: 'user', content: prompt }] })
    });
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error?.message || `B.ai error ${r.status}`); }
    const baiData = await r.json();
    content = baiData.choices?.[0]?.message?.content || '';
    if (!content) throw new Error(`B.ai响应为空: ${JSON.stringify(baiData).slice(0,200)}`);
  } else {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1024, messages: [{ role: 'user', content: prompt }] })
    });
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error?.message || `Claude error ${r.status}`); }
    content = (await r.json()).content[0].text;
  }

  const start = content.indexOf('{');
  const end = content.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error(`AI返回格式错误: ${content.slice(0, 150)}`);

  const generated = JSON.parse(content.slice(start, end + 1));
  if (!generated.text || !generated.topicEn) throw new Error('AI返回数据不完整，请重试');

  generated.id = 'custom_' + Date.now();
  generated.topic = topic;
  generated.level = '自定义';
  generated.duration = '约1.5分钟';
  generated.keyPhrases = generated.keyPhrases || [];
  generated.vocabWords = generated.vocabWords || [];

  IELTS.storage.saveCustomPassage(generated);
  return generated;
}

function renderCustomPassageResult(passage, container) {
  container.innerHTML = `
    <div class="custom-result-card">
      <div class="custom-result-meta">
        <span class="passage-topic-badge">${passage.topicEn}</span>
        <span class="passage-level level-自定义">AI生成</span>
      </div>
      <div class="passage-text" style="margin:12px 0">${highlightPassage(passage)}</div>
      <div style="display:flex;gap:8px;margin:10px 0">
        <button class="btn btn-outline btn-sm" id="btn-tts-custom">🔊 朗读</button>
      </div>
      ${passage.keyPhrases.length ? `
        <div class="phrases-title" style="margin-top:8px">📌 高频短语</div>
        ${passage.keyPhrases.map(p => `<div class="phrase-item">"${p}"</div>`).join('')}
      ` : ''}
    </div>
  `;

  let ttsActive = false;
  document.getElementById('btn-tts-custom')?.addEventListener('click', () => {
    if (ttsActive) {
      window.speechSynthesis.cancel();
      ttsActive = false;
      const b = document.getElementById('btn-tts-custom');
      if (b) b.textContent = '🔊 朗读';
    } else {
      const utter = new SpeechSynthesisUtterance(passage.text);
      utter.lang = 'en-US';
      utter.rate = 0.9;
      utter.onend = () => {
        ttsActive = false;
        const b = document.getElementById('btn-tts-custom');
        if (b) b.textContent = '🔊 朗读';
      };
      window.speechSynthesis.speak(utter);
      ttsActive = true;
      document.getElementById('btn-tts-custom').textContent = '⏹ 停止';
    }
  });
}

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
