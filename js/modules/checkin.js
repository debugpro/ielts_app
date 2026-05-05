window.IELTS = window.IELTS || {};

window.IELTS.checkinModule = (() => {
  const PHASES = [
    {
      id: 'foundation',
      name: '基础期',
      nameEn: 'Foundation',
      emoji: '🌱',
      days: 30,
      color: '#6BCB77',
      description: '建立学习习惯，掌握核心词汇和基础语法',
      target: '每天词汇20个 + 口语1题'
    },
    {
      id: 'breakthrough',
      name: '突破期',
      nameEn: 'Breakthrough',
      emoji: '🚀',
      days: 60,
      color: '#4F7FFF',
      description: '强化写作和口语，系统刷题，冲击6.5+',
      target: '每天词汇30个 + 口语2题 + 写作1篇'
    },
    {
      id: 'sprint',
      name: '冲刺期',
      nameEn: 'Sprint',
      emoji: '🏆',
      days: 90,
      color: '#FF6B6B',
      description: '全题型模拟训练，查漏补缺，冲刺7分',
      target: '每天完整模拟练习 + 错题复习'
    }
  ];

  const getPhaseInfo = (phaseId) => PHASES.find(p => p.id === phaseId) || PHASES[0];

  const getPhaseProgress = (totalDays) => {
    if (totalDays <= 30) {
      return {
        phase: PHASES[0],
        nextPhase: PHASES[1],
        daysInPhase: totalDays,
        phaseTotal: 30,
        progressPercent: Math.min(100, Math.round((totalDays / 30) * 100))
      };
    } else if (totalDays <= 60) {
      return {
        phase: PHASES[1],
        nextPhase: PHASES[2],
        daysInPhase: totalDays - 30,
        phaseTotal: 30,
        progressPercent: Math.min(100, Math.round(((totalDays - 30) / 30) * 100))
      };
    } else {
      return {
        phase: PHASES[2],
        nextPhase: null,
        daysInPhase: totalDays - 60,
        phaseTotal: 30,
        progressPercent: Math.min(100, Math.round(((totalDays - 60) / 30) * 100))
      };
    }
  };

  const getCalendarData = () => {
    const data = IELTS.storage.getCheckinData();
    const checkinSet = new Set(data.checkinDates);

    // Build last 30 days
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const dateStr = date.toDateString();
      days.push({
        date,
        dateStr,
        day: date.getDate(),
        month: date.getMonth(),
        checked: checkinSet.has(dateStr),
        isToday: i === 0
      });
    }
    return days;
  };

  const getStreakMessage = (streak) => {
    if (streak === 0) return '开始你的第一次打卡吧！';
    if (streak === 1) return '第一步是最重要的一步！';
    if (streak < 7) return `连续 ${streak} 天，势头正好！`;
    if (streak < 14) return `连续 ${streak} 天！习惯正在形成💪`;
    if (streak < 30) return `连续 ${streak} 天！你已经超越大多数考生！`;
    if (streak < 60) return `连续 ${streak} 天！惊人的坚持！你距离7分很近了🎯`;
    return `连续 ${streak} 天！你就是最强备考者！🏆`;
  };

  const doCheckin = () => IELTS.storage.doCheckin();
  const hasCheckedInToday = () => IELTS.storage.hasCheckedInToday();
  const getData = () => IELTS.storage.getCheckinData();

  return {
    PHASES,
    getPhaseInfo,
    getPhaseProgress,
    getCalendarData,
    getStreakMessage,
    doCheckin,
    hasCheckedInToday,
    getData
  };
})();
