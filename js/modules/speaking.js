window.IELTS = window.IELTS || {};

window.IELTS.speakingModule = (() => {
  let timerInterval = null;
  let timerCallback = null;
  let secondsRemaining = 0;

  const getRandomQuestion = (part) => {
    const questions = IELTS.speakingQuestions[part];
    const history = IELTS.storage.getSpeakingHistory();
    const practiced = history.practiced;

    // Prefer less-practiced questions
    const withCount = questions.map(q => ({
      ...q,
      times: practiced[q.id]?.times || 0
    }));
    withCount.sort((a, b) => a.times - b.times);

    // Pick from least-practiced quarter
    const pool = withCount.slice(0, Math.max(1, Math.ceil(withCount.length / 4)));
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const getAllQuestions = (part) => IELTS.speakingQuestions[part];

  // Timer functions for Part 2
  const startTimer = (seconds, onTick, onComplete) => {
    stopTimer();
    secondsRemaining = seconds;
    timerCallback = onComplete;

    onTick(secondsRemaining);
    timerInterval = setInterval(() => {
      secondsRemaining -= 1;
      onTick(secondsRemaining);
      if (secondsRemaining <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        if (timerCallback) timerCallback();
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    secondsRemaining = 0;
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const recordSession = (questionId) => {
    IELTS.storage.recordSpeakingSession(questionId);
  };

  const getStats = () => {
    const h = IELTS.storage.getSpeakingHistory();
    const practicedCount = Object.keys(h.practiced).length;
    const totalQuestions = IELTS.speakingQuestions.part1.length +
                           IELTS.speakingQuestions.part2.length +
                           IELTS.speakingQuestions.part3.length;
    return {
      totalSessions: h.totalSessions,
      practicedCount,
      totalQuestions,
      coverage: Math.round((practicedCount / totalQuestions) * 100)
    };
  };

  return { getRandomQuestion, getAllQuestions, startTimer, stopTimer, formatTime, recordSession, getStats };
})();
