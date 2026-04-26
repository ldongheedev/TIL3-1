import { QUESTIONS } from './questions-data.js';

/** Fisher-Yates shuffle (in-place) */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Shuffle the options of a question while keeping answer/option_explanations in sync.
 * Returns a new question object.
 */
function shuffleOptions(q) {
  const indices = shuffle([0, 1, 2, 3]);
  return {
    ...q,
    options:             indices.map(i => q.options[i]),
    option_explanations: indices.map(i => q.option_explanations[i]),
    answer:              indices.indexOf(q.answer),
  };
}

/**
 * Load questions for the given category + difficulty from embedded data,
 * shuffle the question list and each question's options,
 * then return the first 10.
 */
export function loadQuestions(category, difficulty) {
  const key  = `${category}_${difficulty}`;
  const pool = QUESTIONS[key];
  if (!pool || pool.length === 0) {
    throw new Error(`문제 데이터를 찾을 수 없습니다: ${key}`);
  }
  return shuffle([...pool]).slice(0, 10).map(shuffleOptions);
}
