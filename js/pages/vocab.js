window.IELTS = window.IELTS || {};
window.IELTS.pages = window.IELTS.pages || {};

async function fetchAndCachePhonetic(word) {
  const cached = IELTS.storage.getCachedPhonetic(word.id);
  if (cached !== null) return cached;
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.word)}`);
    if (!res.ok) { IELTS.storage.setCachedPhonetic(word.id, ''); return ''; }
    const data = await res.json();
    const phonetic = data[0]?.phonetics?.find(p => p.text)?.text || data[0]?.phonetic || '';
    IELTS.storage.setCachedPhonetic(word.id, phonetic);
    return phonetic;
  } catch {
    return '';
  }
}

function speakWord(word) {
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(word);
  utter.lang = 'en-US';
  utter.rate = 0.9;
  window.speechSynthesis.speak(utter);
}

async function prefetchExamples(word) {
  if (!word) return;
  const hasStatic = (word.examples && word.examples.length) || word.example;
  if (hasStatic) return;
  if (IELTS.storage.getCachedExamples(word.id)) return;
  await generateAndCacheExamples(word, null, null);
}

async function generateAndCacheExamples(word, backEl, renderFn) {
  const settings = IELTS.storage.getSettings();
  const provider = settings.aiProvider || 'anthropic';
  const hasKey = provider === 'deepseek' ? !!settings.deepseekKey
               : provider === 'bai'      ? !!settings.baiKey
               :                           !!settings.apiKey;
  if (!hasKey) {
    if (backEl) {
      const el = backEl.querySelector('.card-example-loading');
      if (el) el.textContent = '💡 在设置中添加 API Key 可自动生成例句';
    }
    return;
  }

  const prompt = `Give exactly 3 short example sentences for the English word "${word.word}" (${word.pos} ${word.def}). Each sentence should be simple, clear, and show natural usage. Return ONLY a JSON array of 3 strings, no other text. Example format: ["sentence1","sentence2","sentence3"]`;

  try {
    let content = '';

    if (provider === 'deepseek') {
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${settings.deepseekKey}` },
        body: JSON.stringify({ model: 'deepseek-chat', max_tokens: 300, messages: [{ role: 'user', content: prompt }] })
      });
      const data = await res.json();
      content = data.choices[0].message.content;
    } else if (provider === 'bai') {
      const res = await fetch('https://api.b.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${settings.baiKey}` },
        body: JSON.stringify({ model: 'gpt-5.4-nano', max_tokens: 300, temperature: 0.7, messages: [{ role: 'user', content: prompt }] })
      });
      const baiJson = await res.json();
      content = baiJson.choices?.[0]?.message?.content || JSON.stringify(baiJson).slice(0, 200);
    } else {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': settings.apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 300, messages: [{ role: 'user', content: prompt }] })
      });
      const data = await res.json();
      content = data.content[0].text;
    }

    const match = content.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('parse error');
    const examples = JSON.parse(match[0]);
    IELTS.storage.setCachedExamples(word.id, examples);

    if (backEl && renderFn) {
      const loading = backEl.querySelector('.card-example-loading');
      if (loading) loading.outerHTML = renderFn(examples);
    }
  } catch (e) {
    if (backEl) {
      const loading = backEl.querySelector('.card-example-loading');
      if (loading) loading.innerHTML = '例句生成失败 <button class="retry-examples-btn" style="margin-left:8px;background:rgba(255,255,255,0.25);border:none;border-radius:6px;color:inherit;padding:2px 8px;cursor:pointer;font-size:12px;">重试</button>';
      backEl.querySelector('.retry-examples-btn')?.addEventListener('click', (ev) => {
        ev.stopPropagation();
        if (loading) loading.innerHTML = '⏳ 正在生成例句…';
        generateAndCacheExamples(word, backEl, renderFn);
      });
    }
  }
}

window.IELTS.pages.vocabulary = (container) => {
  const progress = IELTS.vocabModule.getDailyProgress();

  container.innerHTML = `
    <div class="page vocab-page">
      <div class="page-header">
        <div class="page-title">📚 词汇练习</div>
        <div class="vocab-progress-text">${progress.todayCount}/${progress.target} 今日</div>
      </div>

      <!-- Progress bar -->
      <div class="progress-track">
        <div class="progress-fill" style="width:${progress.percentage}%"></div>
      </div>

      <!-- Stats row -->
      <div class="vocab-stats-row">
        <div class="vs-item known">✓ ${progress.known}</div>
        <div class="vs-item unknown">✗ ${progress.unknown}</div>
        <div class="vs-item total">总 ${progress.total}</div>
        <button class="vs-btn" id="vocab-browse">浏览全部</button>
      </div>

      <!-- Flashcard area -->
      <div class="flashcard-container" id="flashcard-container">
        <div class="flashcard" id="flashcard">
          <div class="swipe-overlay swipe-overlay-right" id="swipe-hint-right">✓ 认识</div>
          <div class="swipe-overlay swipe-overlay-left" id="swipe-hint-left">✗ 不认识</div>
          <div class="flashcard-inner" id="flashcard-inner">
            <div class="flashcard-front" id="card-front">
              <div class="loading-card">加载中…</div>
            </div>
            <div class="flashcard-back" id="card-back"></div>
          </div>
        </div>
        <div class="tap-hint" id="tap-hint">点击翻转 · 左滑不认识 · 右滑认识</div>
      </div>

      <!-- Action buttons -->
      <div class="card-actions" id="card-actions" style="display:none">
        <button class="action-btn unknown-btn" id="btn-unknown">✗ 不认识</button>
        <button class="action-btn known-btn" id="btn-known">✓ 认识</button>
      </div>

      <div class="card-actions-placeholder" id="card-tap-hint">
        <p class="hint-text">点击卡片翻转</p>
      </div>
    </div>
  `;

  let currentWord = null;
  let isFlipped = false;

  const loadNextWord = () => {
    isFlipped = false;
    const card = document.getElementById('flashcard');
    const inner = document.getElementById('flashcard-inner');
    const actions = document.getElementById('card-actions');
    const tapHint = document.getElementById('tap-hint');
    const cardTapHint = document.getElementById('card-tap-hint');

    if (!card) return;

    inner.classList.remove('flipped');
    actions.style.display = 'none';
    if (tapHint) tapHint.style.display = 'block';
    if (cardTapHint) cardTapHint.style.display = 'block';

    currentWord = IELTS.vocabModule.getNextWord(currentWord?.id);
    if (!currentWord) return;

    const front = document.getElementById('card-front');
    const back = document.getElementById('card-back');

    const cachedPhonetic = currentWord.phonetic || IELTS.storage.getCachedPhonetic(currentWord.id) || '';

    front.innerHTML = `
      <div class="card-topic-badge">${getTopicLabel(currentWord.topic)}</div>
      <div class="card-word">${currentWord.word}</div>
      <div class="card-phonetic-row">
        <span class="card-phonetic" id="card-phonetic-text">${cachedPhonetic}</span>
        <button class="btn-speak-word" id="btn-speak-word">🔊</button>
      </div>
      <div class="card-pos">${currentWord.pos || ''}</div>
    `;

    document.getElementById('btn-speak-word')?.addEventListener('click', (e) => {
      e.stopPropagation();
      speakWord(currentWord.word);
    });

    if (!cachedPhonetic) {
      const capturedId = currentWord.id;
      fetchAndCachePhonetic(currentWord).then(p => {
        if (!p || currentWord?.id !== capturedId) return;
        const el = document.getElementById('card-phonetic-text');
        if (el) el.textContent = p;
      });
    }

    const staticExamples = currentWord.examples && currentWord.examples.length
      ? currentWord.examples
      : (currentWord.example ? [currentWord.example] : []);

    const cachedExamples = IELTS.storage.getCachedExamples(currentWord.id);
    // Treat empty-array cache same as no cache so static examples aren't discarded
    const examples = (cachedExamples && cachedExamples.length) ? cachedExamples : staticExamples;

    const renderExamplesList = (exArr) => exArr.length ? `
      <div class="card-example-label">例句</div>
      <div class="card-examples-list">
        ${exArr.map((ex, i) => `
          <div class="card-example-item">
            <span class="card-example-num">${exArr.length > 1 ? (i + 1) + '.' : ''}</span>
            <span class="card-example">"${ex}"</span>
          </div>
        `).join('')}
      </div>
    ` : '<div class="card-example-loading">⏳ 正在生成例句…</div>';

    back.innerHTML = `
      <div class="card-word-small">${currentWord.word}</div>
      <div class="card-def">${currentWord.def}</div>
      ${renderExamplesList(examples)}
    `;

    if (!examples.length) {
      generateAndCacheExamples(currentWord, back, renderExamplesList);
    }

    // 预取下一张卡片的例句
    const nextWord = IELTS.vocabModule.getNextWord(currentWord.id);
    if (nextWord) prefetchExamples(nextWord);
  };

  const flipCard = () => {
    const inner = document.getElementById('flashcard-inner');
    const actions = document.getElementById('card-actions');
    const tapHint = document.getElementById('tap-hint');
    const cardTapHint = document.getElementById('card-tap-hint');

    if (!inner) return;

    isFlipped = !isFlipped;
    inner.classList.toggle('flipped', isFlipped);

    if (isFlipped && currentWord) speakWord(currentWord.word); // 仅正→背时朗读

    if (isFlipped) {
      actions.style.display = 'flex';
      if (tapHint) tapHint.style.display = 'none';
      if (cardTapHint) cardTapHint.style.display = 'none';
    } else {
      actions.style.display = 'none';
      if (tapHint) tapHint.style.display = 'block';
      if (cardTapHint) cardTapHint.style.display = 'block';
    }
  };

  // ── Swipe gesture handling ────────────────────────────────────────
  const SWIPE_THRESHOLD = 70;
  let touchStartX = 0;
  let touchStartY = 0;
  let isDragging = false;
  let hasSwiped = false;

  const flashcard = document.getElementById('flashcard');
  const hintRight = document.getElementById('swipe-hint-right');
  const hintLeft = document.getElementById('swipe-hint-left');

  flashcard?.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isDragging = false;
    hasSwiped = false;
  }, { passive: true });

  flashcard?.addEventListener('touchmove', (e) => {
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;
    if (!isDragging && Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
    isDragging = true;

    const inner = document.getElementById('flashcard-inner');
    if (!inner) return;
    const rotate = dx * 0.08;
    inner.style.transform = inner.classList.contains('flipped')
      ? `rotateY(180deg) translateX(${-dx}px) rotate(${-rotate}deg)`
      : `translateX(${dx}px) rotate(${rotate}deg)`;
    inner.style.transition = 'none';

    const ratio = Math.min(Math.abs(dx) / SWIPE_THRESHOLD, 1);
    if (dx > 10) {
      if (hintRight) hintRight.style.opacity = ratio;
      if (hintLeft) hintLeft.style.opacity = 0;
    } else if (dx < -10) {
      if (hintLeft) hintLeft.style.opacity = ratio;
      if (hintRight) hintRight.style.opacity = 0;
    } else {
      if (hintRight) hintRight.style.opacity = 0;
      if (hintLeft) hintLeft.style.opacity = 0;
    }
  }, { passive: true });

  flashcard?.addEventListener('touchend', (e) => {
    // Button taps (speak, etc.) must not be intercepted — let click fire normally
    if (e.target.closest('button, a')) return;

    if (hintRight) hintRight.style.opacity = 0;
    if (hintLeft) hintLeft.style.opacity = 0;

    const inner = document.getElementById('flashcard-inner');
    if (inner) {
      inner.style.transition = '';
      inner.style.transform = inner.classList.contains('flipped') ? 'rotateY(180deg)' : '';
    }

    if (!isDragging) {
      // Tap: handle here and suppress the subsequent synthetic click event
      e.preventDefault();
      flipCard();
      return;
    }

    const dx = e.changedTouches[0].clientX - touchStartX;
    if (dx > SWIPE_THRESHOLD) {
      hasSwiped = true;
      e.preventDefault();
      if (currentWord) {
        IELTS.vocabModule.markKnown(currentWord.id);
        animateCard('right');
        setTimeout(() => { loadNextWord(); updateStats(); }, 400);
      }
    } else if (dx < -SWIPE_THRESHOLD) {
      hasSwiped = true;
      e.preventDefault();
      if (currentWord) {
        IELTS.vocabModule.markUnknown(currentWord.id);
        animateCard('left');
        setTimeout(() => { loadNextWord(); updateStats(); }, 400);
      }
    }
  }, { passive: false }); // non-passive so e.preventDefault() can suppress click

  flashcard?.addEventListener('click', (e) => {
    if (hasSwiped) { hasSwiped = false; return; }
    flipCard();
  });

  document.getElementById('btn-known')?.addEventListener('click', () => {
    if (!currentWord) return;
    IELTS.vocabModule.markKnown(currentWord.id);
    animateCard('right');
    setTimeout(() => { loadNextWord(); updateStats(); }, 400);
  });

  document.getElementById('btn-unknown')?.addEventListener('click', () => {
    if (!currentWord) return;
    IELTS.vocabModule.markUnknown(currentWord.id);
    animateCard('left');
    setTimeout(() => { loadNextWord(); updateStats(); }, 400);
  });

  document.getElementById('vocab-browse')?.addEventListener('click', () => {
    showWordBrowser(container);
  });

  function animateCard(direction) {
    const card = document.getElementById('flashcard');
    if (!card) return;
    card.classList.add(direction === 'right' ? 'swipe-right' : 'swipe-left');
    setTimeout(() => card.classList.remove('swipe-right', 'swipe-left'), 400);
  }

  function updateStats() {
    const p = IELTS.vocabModule.getDailyProgress();
    const fill = container.querySelector('.progress-fill');
    const text = container.querySelector('.vocab-progress-text');
    const vsItems = container.querySelectorAll('.vs-item');
    if (fill) fill.style.width = p.percentage + '%';
    if (text) text.textContent = `${p.todayCount}/${p.target} 今日`;
    if (vsItems[0]) vsItems[0].textContent = `✓ ${p.known}`;
    if (vsItems[1]) vsItems[1].textContent = `✗ ${p.unknown}`;
  }

  loadNextWord();
};

function getTopicLabel(topic) {
  const map = {
    academic: '学术', environment: '环境', technology: '科技',
    health: '健康', society: '社会', economy: '经济', education: '教育',
    government: '政治', media: '媒体', transport: '交通', housing: '住房',
    energy: '能源', agriculture: '农业', immigration: '移民',
    arts: '艺术', science: '科学', writing: '写作', collocation: '搭配'
  };
  return map[topic] || topic;
}

function showWordBrowser(parentContainer) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';

  const progress = IELTS.storage.getVocabProgress();
  const knownSet = new Set(progress.known);
  const unknownSet = new Set(progress.unknown);

  const topics = ['all', ...new Set(IELTS.words.map(w => w.topic))];
  let currentTopic = 'all';
  let filterMode = 'all'; // all | known | unknown | unseen

  const renderList = () => {
    let words = currentTopic === 'all' ? IELTS.words : IELTS.words.filter(w => w.topic === currentTopic);
    if (filterMode === 'known') words = words.filter(w => knownSet.has(w.id));
    else if (filterMode === 'unknown') words = words.filter(w => unknownSet.has(w.id));
    else if (filterMode === 'unseen') words = words.filter(w => !knownSet.has(w.id) && !unknownSet.has(w.id));

    return words.map(w => `
      <div class="word-row ${knownSet.has(w.id) ? 'known' : unknownSet.has(w.id) ? 'unknown' : ''}">
        <div class="word-row-main">
          <span class="word-row-word">${w.word}</span>
          <span class="word-row-pos">${w.pos}</span>
        </div>
        <div class="word-row-def">${w.def}</div>
      </div>
    `).join('') || '<div class="empty-state">暂无词汇</div>';
  };

  modal.innerHTML = `
    <div class="modal-card modal-fullscreen">
      <div class="modal-header">
        <div class="modal-title">📖 词汇表（${IELTS.words.length}词）</div>
        <button class="modal-close" id="browser-close">✕</button>
      </div>
      <div class="filter-row">
        <select id="topic-select" class="filter-select">
          ${topics.map(t => `<option value="${t}">${t === 'all' ? '全部话题' : getTopicLabel(t)}</option>`).join('')}
        </select>
        <div class="filter-tabs">
          <button class="filter-tab active" data-mode="all">全部</button>
          <button class="filter-tab" data-mode="known">已知</button>
          <button class="filter-tab" data-mode="unknown">待复习</button>
          <button class="filter-tab" data-mode="unseen">未学</button>
        </div>
      </div>
      <div class="word-list" id="word-list">${renderList()}</div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('browser-close').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

  document.getElementById('topic-select').addEventListener('change', e => {
    currentTopic = e.target.value;
    document.getElementById('word-list').innerHTML = renderList();
  });

  modal.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterMode = btn.dataset.mode;
      document.getElementById('word-list').innerHTML = renderList();
    });
  });
}
