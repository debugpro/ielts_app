window.IELTS = window.IELTS || {};

window.IELTS.vocabModule = (() => {
  const DAILY_TARGET = 20;

  // Get next word to show, prioritising unknown words
  const getNextWord = (excludeId = null) => {
    const storage = IELTS.storage;
    const progress = storage.resetDailyVocab();
    const allWords = IELTS.words;

    const knownSet = new Set(progress.known);
    const seenToday = new Set(progress.seenToday);

    // Shuffle helper
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // Priority 1: unknown words not seen today (fully random across all)
    const unknownUnseen = allWords.filter(w =>
      !knownSet.has(w.id) && !seenToday.has(w.id) && w.id !== excludeId
    );
    if (unknownUnseen.length > 0) return pick(unknownUnseen);

    // Priority 2: any word not seen today
    const unseen = allWords.filter(w => !seenToday.has(w.id) && w.id !== excludeId);
    if (unseen.length > 0) return pick(unseen);

    // Priority 3: unknown words (all, reset daily seen)
    const unknown = allWords.filter(w => !knownSet.has(w.id) && w.id !== excludeId);
    if (unknown.length > 0) return pick(unknown);

    // All known — cycle through all randomly
    const others = allWords.filter(w => w.id !== excludeId);
    return pick(others);
  };

  const markKnown = (wordId) => IELTS.storage.markWord(wordId, 'known');
  const markUnknown = (wordId) => IELTS.storage.markWord(wordId, 'unknown');

  const getDailyProgress = () => {
    const p = IELTS.storage.getVocabProgress();
    return {
      todayCount: p.todayCount || 0,
      target: DAILY_TARGET,
      percentage: Math.min(100, Math.round(((p.todayCount || 0) / DAILY_TARGET) * 100)),
      known: p.known.length,
      unknown: p.unknown.length,
      total: IELTS.words.length
    };
  };

  const getTopicFilter = () => {
    const topics = [...new Set(IELTS.words.map(w => w.topic))];
    return topics;
  };

  const getWordsByTopic = (topic) => {
    if (!topic || topic === 'all') return IELTS.words;
    return IELTS.words.filter(w => w.topic === topic);
  };

  return { getNextWord, markKnown, markUnknown, getDailyProgress, getTopicFilter, getWordsByTopic };
})();
