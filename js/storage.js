window.IELTS = window.IELTS || {};

window.IELTS.storage = (() => {
  const PREFIX = 'ielts_';

  const get = (key, fallback = null) => {
    try {
      const val = localStorage.getItem(PREFIX + key);
      return val !== null ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  };

  const set = (key, value) => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  };

  const remove = (key) => {
    localStorage.removeItem(PREFIX + key);
  };

  // ── Vocabulary progress ─────────────────────────────────────────
  const getVocabProgress = () => get('vocab_progress', {
    known: [],        // word ids marked as known
    unknown: [],      // word ids marked as unknown
    seenToday: [],    // word ids seen in current session
    lastStudyDate: null,
    todayCount: 0,
    totalSessions: 0
  });

  const saveVocabProgress = (progress) => set('vocab_progress', progress);

  const markWord = (wordId, status) => {
    const p = getVocabProgress();
    const knownSet = new Set(p.known);
    const unknownSet = new Set(p.unknown);

    if (status === 'known') {
      knownSet.add(wordId);
      unknownSet.delete(wordId);
    } else {
      unknownSet.add(wordId);
      knownSet.delete(wordId);
    }

    p.known = [...knownSet];
    p.unknown = [...unknownSet];

    if (!p.seenToday.includes(wordId)) {
      p.seenToday.push(wordId);
      p.todayCount = p.seenToday.length;
    }

    saveVocabProgress(p);
    return p;
  };

  const resetDailyVocab = () => {
    const p = getVocabProgress();
    const today = new Date().toDateString();
    if (p.lastStudyDate !== today) {
      p.seenToday = [];
      p.todayCount = 0;
      p.lastStudyDate = today;
      p.totalSessions += 1;
      saveVocabProgress(p);
    }
    return p;
  };

  // ── Speaking history ────────────────────────────────────────────
  const getSpeakingHistory = () => get('speaking_history', {
    practiced: {},   // questionId -> {times, lastDate}
    totalSessions: 0
  });

  const recordSpeakingSession = (questionId) => {
    const h = getSpeakingHistory();
    if (!h.practiced[questionId]) {
      h.practiced[questionId] = { times: 0, lastDate: null };
    }
    h.practiced[questionId].times += 1;
    h.practiced[questionId].lastDate = new Date().toISOString();
    h.totalSessions += 1;
    set('speaking_history', h);
  };

  // ── Writing history ─────────────────────────────────────────────
  const getWritingHistory = () => get('writing_history', {
    attempts: [],    // {id, questionId, text, score, date}
    totalAttempts: 0
  });

  const saveWritingAttempt = (questionId, text, score) => {
    const h = getWritingHistory();
    h.attempts.unshift({
      id: Date.now(),
      questionId,
      text: text.substring(0, 500),  // store preview only
      score,
      date: new Date().toISOString()
    });
    h.attempts = h.attempts.slice(0, 20); // keep last 20
    h.totalAttempts += 1;
    set('writing_history', h);
  };

  // ── Check-in / Streak ───────────────────────────────────────────
  const getCheckinData = () => get('checkin', {
    streak: 0,
    lastCheckinDate: null,
    totalDays: 0,
    checkinDates: [],
    phase: 'foundation',  // foundation | breakthrough | sprint
    startDate: null
  });

  const doCheckin = () => {
    const data = getCheckinData();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (data.lastCheckinDate === today) {
      return { ...data, alreadyChecked: true };
    }

    if (data.lastCheckinDate === yesterday) {
      data.streak += 1;
    } else {
      data.streak = 1;
    }

    if (!data.startDate) data.startDate = new Date().toISOString();

    data.lastCheckinDate = today;
    data.totalDays += 1;
    data.checkinDates.push(today);

    // Phase logic: 1-30 days = foundation, 31-60 = breakthrough, 61+ = sprint
    if (data.totalDays <= 30) data.phase = 'foundation';
    else if (data.totalDays <= 60) data.phase = 'breakthrough';
    else data.phase = 'sprint';

    set('checkin', data);
    return { ...data, alreadyChecked: false };
  };

  const hasCheckedInToday = () => {
    const data = getCheckinData();
    return data.lastCheckinDate === new Date().toDateString();
  };

  // ── Settings ────────────────────────────────────────────────────
  const getSettings = () => get('settings', {
    apiKey: '',
    dailyVocabTarget: 20,
    reminderEnabled: false
  });

  const saveSettings = (settings) => set('settings', settings);

  // ── Overall stats ───────────────────────────────────────────────
  const getStats = () => {
    const vocab = getVocabProgress();
    const speaking = getSpeakingHistory();
    const writing = getWritingHistory();
    const checkin = getCheckinData();
    return { vocab, speaking, writing, checkin };
  };

  return {
    get, set, remove,
    getVocabProgress, saveVocabProgress, markWord, resetDailyVocab,
    getSpeakingHistory, recordSpeakingSession,
    getWritingHistory, saveWritingAttempt,
    getCheckinData, doCheckin, hasCheckedInToday,
    getSettings, saveSettings,
    getStats
  };
})();
