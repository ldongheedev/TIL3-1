export const DIFFICULTY_CONFIG = {
  easy:   { label: '쉬움',   time: 30, baseScore: 5  },
  normal: { label: '보통',   time: 20, baseScore: 10 },
  hard:   { label: '어려움', time: 15, baseScore: 15 },
};

export const CATEGORY_LABELS = {
  korean_history: '한국사',
  science:        '과학',
  geography:      '지리',
  general:        '일반상식',
};

export function getTimerBonus(remainRatio) {
  if (remainRatio >= 0.7) return 5;
  if (remainRatio >= 0.4) return 3;
  if (remainRatio >= 0.1) return 1;
  return 0;
}

export function getComboBonus(combo) {
  if (combo >= 10) return 20;
  if (combo >= 5)  return 10;
  if (combo >= 3)  return 5;
  return 0;
}

export function getComboBonusLabel(combo) {
  if (combo >= 10) return '10 COMBO!';
  if (combo >= 5)  return '5 COMBO!';
  if (combo >= 3)  return '3 COMBO!';
  return null;
}

export function isCombomilestone(combo) {
  return combo === 3 || combo === 5 || combo === 10;
}

export function getGrade(correct, total) {
  const r = correct / total;
  if (r >= 0.9) return 'S';
  if (r >= 0.75) return 'A';
  if (r >= 0.6)  return 'B';
  if (r >= 0.4)  return 'C';
  return 'D';
}
