import { CATEGORY_LABELS, DIFFICULTY_CONFIG } from './score.js';

export function buildShareText({ category, difficulty, score, grade, correct, total, maxCombo }) {
  const catLabel  = CATEGORY_LABELS[category]          ?? category;
  const diffLabel = DIFFICULTY_CONFIG[difficulty]?.label ?? difficulty;
  const pct       = Math.round((correct / total) * 100);

  return [
    '📝 상식 퀴즈 결과',
    `카테고리: ${catLabel} | 난이도: ${diffLabel}`,
    `점수: ${score}점 | 등급: ${grade}`,
    `정답률: ${correct}/${total} (${pct}%) | 최고 콤보: ${maxCombo}연속`,
    `#상식퀴즈 #${catLabel}`,
  ].join('\n');
}

export async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  // fallback
  const el = document.createElement('textarea');
  el.value = text;
  el.style.position = 'fixed';
  el.style.opacity  = '0';
  document.body.appendChild(el);
  el.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(el);
  return ok;
}
