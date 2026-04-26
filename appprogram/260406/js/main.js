import { loadQuestions }                                      from './quiz.js';
import { Timer }                                              from './timer.js';
import {
  DIFFICULTY_CONFIG, CATEGORY_LABELS,
  getTimerBonus, getComboBonus, getComboBonusLabel,
  isCombomilestone, getGrade,
}                                                             from './score.js';
import { saveScore, loadScores }                              from './leaderboard.js';
import { buildShareText, copyToClipboard }                    from './share.js';

// ─── state ────────────────────────────────────────────────────────────────────
const state = {
  nickname:  '',
  category:  '',
  difficulty:'',
  questions: [],
  index:     0,
  score:     0,
  correct:   0,
  combo:     0,
  maxCombo:  0,
  lastRank:  -1,
  timer:     null,
  answered:  false,
};

// ─── helpers ──────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

const SCREENS = [
  'screen-start', 'screen-difficulty', 'screen-quiz',
  'screen-feedback', 'screen-result', 'screen-leaderboard',
];

function showScreen(id) {
  SCREENS.forEach(s => {
    document.getElementById(s).classList.toggle('hidden', s !== id);
  });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// ─── screen: START ────────────────────────────────────────────────────────────
$('btn-leaderboard').addEventListener('click', () => {
  renderLeaderboard();
  showScreen('screen-leaderboard');
});

document.querySelectorAll('.category-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const nick = $('nickname-input').value.trim();
    if (!nick) {
      $('nickname-error').classList.remove('hidden');
      $('nickname-input').focus();
      return;
    }
    $('nickname-error').classList.add('hidden');
    state.nickname = nick;
    state.category = btn.dataset.category;
    $('difficulty-category-name').textContent = CATEGORY_LABELS[state.category];
    showScreen('screen-difficulty');
  });
});

$('nickname-input').addEventListener('input', () => {
  if ($('nickname-input').value.trim()) {
    $('nickname-error').classList.add('hidden');
  }
});

// ─── screen: DIFFICULTY ───────────────────────────────────────────────────────
$('btn-back-to-start').addEventListener('click', () => showScreen('screen-start'));

document.querySelectorAll('.difficulty-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.difficulty = btn.dataset.difficulty;
    startGame();
  });
});

// ─── game flow ────────────────────────────────────────────────────────────────
function startGame() {
  // reset state
  Object.assign(state, {
    index: 0, score: 0, correct: 0,
    combo: 0, maxCombo: 0, answered: false,
  });

  try {
    state.questions = loadQuestions(state.category, state.difficulty);
  } catch (e) {
    alert('문제 데이터를 불러오는 중 오류가 발생했습니다.\n' + e.message);
    return;
  }

  showScreen('screen-quiz');
  renderQuestion();
}

function renderQuestion() {
  state.answered = false;
  const q    = state.questions[state.index];
  const cfg  = DIFFICULTY_CONFIG[state.difficulty];
  const catL = CATEGORY_LABELS[state.category];

  // header
  $('quiz-category-label').textContent = `${catL} · ${cfg.label}`;
  $('quiz-progress').textContent       = `${state.index + 1} / ${state.questions.length}`;
  $('quiz-score').textContent          = `${state.score}점`;
  updateComboDisplay();

  // question
  $('quiz-question').textContent = q.question;

  // options
  const grid = $('options-grid');
  grid.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className    = 'option-btn';
    btn.dataset.index = i;
    btn.innerHTML    = `<span class="option-num">${i + 1}</span><span class="option-text">${opt}</span>`;
    btn.addEventListener('click', () => onAnswer(i));
    grid.appendChild(btn);
  });

  // timer
  if (state.timer) state.timer.stop();
  const bar = $('timer-bar');
  bar.style.width           = '100%';
  bar.style.backgroundColor = '#3b82f6';

  state.timer = new Timer({
    duration: cfg.time,
    onTick(remaining, duration) {
      const ratio = remaining / duration;
      bar.style.width           = `${ratio * 100}%`;
      bar.style.backgroundColor = ratio <= (5 / duration) ? '#ef4444' : '#3b82f6';
    },
    onExpire() {
      onAnswer(-1); // -1 = timeout
    },
  });
  state.timer.start();
}

function updateComboDisplay() {
  const el = $('quiz-combo');
  if (state.combo >= 3) {
    el.textContent = `🔥 ${state.combo}콤보`;
    el.classList.remove('hidden');
  } else {
    el.classList.add('hidden');
  }
}

function onAnswer(selectedIndex) {
  if (state.answered) return;
  state.answered = true;
  state.timer.stop();

  const q          = state.questions[state.index];
  const isCorrect  = selectedIndex === q.answer;
  const isTimeout  = selectedIndex === -1;
  const remainRatio = state.timer.getRemainingRatio();

  // score calculation
  let gained = 0;
  let timerBonus = 0;
  let comboBonus = 0;
  let comboLabel = null;

  if (isCorrect) {
    const cfg  = DIFFICULTY_CONFIG[state.difficulty];
    timerBonus = getTimerBonus(remainRatio);
    gained     = cfg.baseScore + timerBonus;
    state.combo++;
    state.maxCombo = Math.max(state.maxCombo, state.combo);

    if (isCombomilestone(state.combo)) {
      comboBonus = getComboBonus(state.combo);
      comboLabel = getComboBonusLabel(state.combo);
      gained    += comboBonus;
    }

    state.score  += gained;
    state.correct++;
  } else {
    state.combo = 0;
  }

  $('quiz-score').textContent = `${state.score}점`;
  updateComboDisplay();

  // build feedback and switch screen
  renderFeedback({
    q, isCorrect, isTimeout,
    selectedIndex, gained, timerBonus, comboBonus, comboLabel,
  });
  showScreen('screen-feedback');
}

// ─── screen: FEEDBACK ─────────────────────────────────────────────────────────
function renderFeedback({ q, isCorrect, isTimeout, selectedIndex, gained, timerBonus, comboBonus, comboLabel }) {
  // banner
  const banner = $('feedback-result-banner');
  if (isTimeout) {
    banner.textContent  = '⏰ 시간 초과!';
    banner.className    = 'feedback-banner timeout';
  } else if (isCorrect) {
    banner.textContent  = '✅ 정답입니다!';
    banner.className    = 'feedback-banner correct';
  } else {
    banner.textContent  = '❌ 오답입니다!';
    banner.className    = 'feedback-banner wrong';
  }

  // score info
  const scoreEl = $('feedback-score-info');
  if (isCorrect) {
    let html = `<div class="score-gained">+${gained}점`;
    if (timerBonus > 0) html += ` <span class="bonus-tag">타이머 +${timerBonus}</span>`;
    if (comboBonus > 0) html += ` <span class="bonus-tag combo-tag">${comboLabel} +${comboBonus}</span>`;
    html += `</div>`;
    scoreEl.innerHTML = html;
  } else {
    scoreEl.innerHTML = isTimeout
      ? '<div class="score-gained timeout-msg">시간 안에 답하지 못했습니다.</div>'
      : '<div class="score-gained wrong-msg">+0점</div>';
  }

  // options list with explanations
  const list = $('feedback-options-list');
  list.innerHTML = '';

  q.options.forEach((opt, i) => {
    const div = document.createElement('div');
    let cls   = 'feedback-option';
    if (i === q.answer)       cls += ' opt-correct';
    if (i === selectedIndex && i !== q.answer) cls += ' opt-wrong';
    div.className = cls;

    const icon = i === q.answer ? '✓' : (i === selectedIndex ? '✗' : '');
    div.innerHTML = `
      <div class="opt-row">
        <span class="opt-icon">${icon}</span>
        <span class="opt-label">${i + 1}. ${opt}</span>
      </div>
      <div class="opt-explanation">${q.option_explanations[i]}</div>
    `;
    list.appendChild(div);
  });

  // combo popup
  const popup = $('feedback-combo-popup');
  if (comboLabel) {
    popup.textContent = comboLabel;
    popup.classList.remove('hidden');
    setTimeout(() => popup.classList.add('hidden'), 2000);
  } else {
    popup.classList.add('hidden');
  }
}

$('btn-next-question').addEventListener('click', () => {
  state.index++;
  if (state.index < state.questions.length) {
    showScreen('screen-quiz');
    renderQuestion();
  } else {
    renderResult();
    showScreen('screen-result');
  }
});

// ─── screen: RESULT ───────────────────────────────────────────────────────────
function renderResult() {
  const grade = getGrade(state.correct, state.questions.length);
  const pct   = Math.round((state.correct / state.questions.length) * 100);

  $('result-grade').textContent   = grade;
  $('result-grade').className     = `result-grade grade-${grade}`;
  $('result-score').textContent   = `${state.score}점`;
  $('result-correct').textContent = `${state.correct} / ${state.questions.length} (${pct}%)`;
  $('result-combo').textContent   = `${state.maxCombo}연속`;
  $('result-nickname').textContent= state.nickname;

  // auto-save
  const entry = {
    nickname:  state.nickname,
    score:     state.score,
    grade,
    correct:   state.correct,
    total:     state.questions.length,
    maxCombo:  state.maxCombo,
    category:  state.category,
    difficulty:state.difficulty,
    date:      today(),
  };
  state.lastRank = saveScore(entry);

  const savedMsg = $('result-saved-msg');
  if (state.lastRank >= 0) {
    savedMsg.textContent = `🏆 ${state.lastRank + 1}위로 저장되었습니다!`;
    savedMsg.classList.remove('hidden');
  } else {
    savedMsg.classList.add('hidden');
  }
}

$('btn-share').addEventListener('click', async () => {
  const grade = getGrade(state.correct, state.questions.length);
  const text  = buildShareText({
    category:  state.category,
    difficulty: state.difficulty,
    score:     state.score,
    grade,
    correct:   state.correct,
    total:     state.questions.length,
    maxCombo:  state.maxCombo,
  });
  const btn = $('btn-share');
  try {
    await copyToClipboard(text);
    btn.textContent = '복사됨!';
    setTimeout(() => { btn.textContent = '결과 공유'; }, 2000);
  } catch {
    alert('클립보드 복사에 실패했습니다.');
  }
});

$('btn-retry').addEventListener('click', () => showScreen('screen-start'));

$('btn-to-leaderboard').addEventListener('click', () => {
  renderLeaderboard(state.category, state.difficulty);
  showScreen('screen-leaderboard');
});

// ─── screen: LEADERBOARD ─────────────────────────────────────────────────────
const LB_CATEGORIES   = Object.keys(CATEGORY_LABELS);
const LB_DIFFICULTIES = Object.keys(DIFFICULTY_CONFIG);

let lbCategory   = LB_CATEGORIES[0];
let lbDifficulty = LB_DIFFICULTIES[0];

function renderLeaderboard(cat, diff) {
  if (cat)  lbCategory   = cat;
  if (diff) lbDifficulty = diff;

  // category tabs
  const catTabs = $('lb-category-tabs');
  catTabs.innerHTML = '';
  LB_CATEGORIES.forEach(c => {
    const btn = document.createElement('button');
    btn.textContent = CATEGORY_LABELS[c];
    btn.className   = 'lb-tab' + (c === lbCategory ? ' active' : '');
    btn.addEventListener('click', () => {
      lbCategory = c;
      renderLeaderboard();
    });
    catTabs.appendChild(btn);
  });

  // difficulty tabs
  const diffTabs = $('lb-difficulty-tabs');
  diffTabs.innerHTML = '';
  LB_DIFFICULTIES.forEach(d => {
    const btn = document.createElement('button');
    btn.textContent = DIFFICULTY_CONFIG[d].label;
    btn.className   = 'lb-tab' + (d === lbDifficulty ? ' active' : '');
    btn.addEventListener('click', () => {
      lbDifficulty = d;
      renderLeaderboard();
    });
    diffTabs.appendChild(btn);
  });

  // table
  const scores = loadScores(lbCategory, lbDifficulty);
  const tbody  = $('lb-tbody');
  tbody.innerHTML = '';

  if (scores.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="lb-empty">기록이 없습니다.</td></tr>';
    return;
  }

  scores.forEach((entry, i) => {
    const isCurrentGame =
      state.score    === entry.score &&
      state.nickname === entry.nickname &&
      today()        === entry.date &&
      lbCategory     === state.category &&
      lbDifficulty   === state.difficulty;

    const tr  = document.createElement('tr');
    if (isCurrentGame) tr.classList.add('lb-highlight');
    const pct = Math.round((entry.correct / entry.total) * 100);
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${entry.nickname}</td>
      <td>${entry.score}점</td>
      <td class="grade-cell grade-${entry.grade}">${entry.grade}</td>
      <td>${entry.correct}/${entry.total} (${pct}%)</td>
      <td>${entry.maxCombo}연속</td>
      <td>${entry.date}</td>
    `;
    tbody.appendChild(tr);
  });
}

$('btn-back-from-lb').addEventListener('click', () => showScreen('screen-start'));

// ─── keyboard shortcuts ────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  const screen = SCREENS.find(s => !document.getElementById(s).classList.contains('hidden'));

  if (screen === 'screen-quiz' && !state.answered) {
    const map = { '1': 0, '2': 1, '3': 2, '4': 3 };
    if (map[e.key] !== undefined) onAnswer(map[e.key]);
  }

  if (screen === 'screen-feedback' && e.key === 'Enter') {
    $('btn-next-question').click();
  }
});
