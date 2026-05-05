window.IELTS = window.IELTS || {};
window.IELTS.pages = window.IELTS.pages || {};

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
          <div class="flashcard-inner" id="flashcard-inner">
            <div class="flashcard-front" id="card-front">
              <div class="loading-card">加载中…</div>
            </div>
            <div class="flashcard-back" id="card-back"></div>
          </div>
        </div>
        <div class="tap-hint" id="tap-hint">点击卡片查看释义</div>
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

    front.innerHTML = `
      <div class="card-topic-badge">${getTopicLabel(currentWord.topic)}</div>
      <div class="card-word">${currentWord.word}</div>
      <div class="card-phonetic">${currentWord.phonetic || ''}</div>
      <div class="card-pos">${currentWord.pos || ''}</div>
    `;

    back.innerHTML = `
      <div class="card-word-small">${currentWord.word}</div>
      <div class="card-def">${currentWord.def}</div>
      <div class="card-example">"${currentWord.example}"</div>
      <div class="card-example-label">例句</div>
    `;
  };

  const flipCard = () => {
    const inner = document.getElementById('flashcard-inner');
    const actions = document.getElementById('card-actions');
    const tapHint = document.getElementById('tap-hint');
    const cardTapHint = document.getElementById('card-tap-hint');

    if (!inner) return;

    isFlipped = !isFlipped;
    inner.classList.toggle('flipped', isFlipped);

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

  document.getElementById('flashcard')?.addEventListener('click', flipCard);

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
