const KEY = (category, difficulty) => `quiz_scores_${category}_${difficulty}`;

export function saveScore(entry) {
  const key = KEY(entry.category, entry.difficulty);
  try {
    const existing = loadScores(entry.category, entry.difficulty);
    existing.push(entry);
    existing.sort((a, b) => b.score - a.score);
    const top10 = existing.slice(0, 10);
    localStorage.setItem(key, JSON.stringify(top10));
    return top10.findIndex(
      e => e.nickname === entry.nickname &&
           e.score    === entry.score &&
           e.date     === entry.date
    );
  } catch {
    return -1;
  }
}

export function loadScores(category, difficulty) {
  try {
    const raw = localStorage.getItem(KEY(category, difficulty));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
