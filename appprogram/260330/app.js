// ===== 데이터 레이어 (LocalStorage) =====
const STORAGE_KEY = 'todos';

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function addTodo(text, category, priority, dueDate) {
  const todos = loadTodos();
  const item = {
    id: Date.now().toString(),
    text,
    category,
    priority: priority || '보통',
    dueDate: dueDate || null,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  todos.push(item);
  saveTodos(todos);
  return item;
}

function updateTodo(id, changes) {
  const todos = loadTodos().map(todo =>
    todo.id === id ? { ...todo, ...changes } : todo
  );
  saveTodos(todos);
}

function deleteTodo(id) {
  saveTodos(loadTodos().filter(todo => todo.id !== id));
}

function toggleTodo(id) {
  const todos = loadTodos().map(todo => {
    if (todo.id !== id) return todo;
    const completed = !todo.completed;
    return { ...todo, completed, completedAt: completed ? new Date().toISOString() : null };
  });
  saveTodos(todos);
}

// ===== 카테고리 관리 =====
const CATEGORY_KEY = 'todo_categories';

const COLOR_PALETTE = [
  { bg: '#dbeafe', text: '#1d4ed8' },
  { bg: '#dcfce7', text: '#15803d' },
  { bg: '#ffedd5', text: '#c2410c' },
  { bg: '#f3e8ff', text: '#7c3aed' },
  { bg: '#fce7f3', text: '#be185d' },
  { bg: '#ccfbf1', text: '#0f766e' },
  { bg: '#fef9c3', text: '#a16207' },
  { bg: '#fee2e2', text: '#dc2626' },
  { bg: '#e0e7ff', text: '#4338ca' },
  { bg: '#fdf4ff', text: '#a21caf' },
];

const DEFAULT_CATEGORIES = [
  { name: '업무', color: COLOR_PALETTE[0] },
  { name: '개인', color: COLOR_PALETTE[1] },
  { name: '공부', color: COLOR_PALETTE[2] },
  { name: '건강', color: COLOR_PALETTE[3] },
  { name: '쇼핑', color: COLOR_PALETTE[4] },
  { name: '집안일', color: COLOR_PALETTE[5] },
];

function loadCategories() {
  try {
    return JSON.parse(localStorage.getItem(CATEGORY_KEY)) || DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

function saveCategories(cats) {
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(cats));
}

function getCategoryColor(name) {
  const cat = loadCategories().find(c => c.name === name);
  return cat ? cat.color : { bg: '#e5e7eb', text: '#374151' };
}

function categoryBadge(name) {
  const { bg, text } = getCategoryColor(name);
  return `<span class="badge" style="background-color:${bg};color:${text}">${escapeHtml(name)}</span>`;
}

// ===== 대시보드 =====
function renderDashboard() {
  const todos = loadTodos();
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const remaining = total - completed;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-completed').textContent = completed;
  document.getElementById('stat-remaining').textContent = remaining;
  document.getElementById('progress-bar').style.width = pct + '%';

  document.getElementById('dashboard-categories').innerHTML = loadCategories()
    .map(cat => {
      const catTodos = todos.filter(t => t.category === cat.name);
      if (catTodos.length === 0) return '';
      const catDone = catTodos.filter(t => t.completed).length;
      return `
        <div class="cat-stat" style="background-color:${cat.color.bg};color:${cat.color.text}">
          <span class="cat-stat__name">${escapeHtml(cat.name)}</span>
          <span class="cat-stat__count">${catDone}/${catTodos.length} 완료</span>
        </div>`;
    }).join('');
}

// ===== 렌더링 =====
let activeFilter = '전체';

function renderTodos() {
  const list = document.getElementById('todo-list');
  const todos = loadTodos();
  const filtered = activeFilter === '전체'
    ? todos
    : todos.filter(t => t.category === activeFilter);

  renderDashboard();

  if (filtered.length === 0) {
    list.innerHTML = '<li class="todo-list__empty">할 일이 없습니다</li>';
    return;
  }

  list.innerHTML = filtered.map(todo => {
    const dueDateHtml = todo.dueDate
      ? `<span class="todo-item__due ${isDueOverdue(todo) ? 'todo-item__due--overdue' : ''}">${formatDueDate(todo.dueDate)}</span>`
      : '';
    return `
    <li class="todo-item ${todo.completed ? 'todo-item--done' : ''}" data-id="${todo.id}">
      <input type="checkbox" class="todo-item__checkbox" ${todo.completed ? 'checked' : ''} aria-label="완료 토글">
      ${categoryBadge(todo.category)}
      <span class="badge badge--priority--${todo.priority || '보통'}">${todo.priority || '보통'}</span>
      <div class="todo-item__body">
        <span class="todo-item__text">${escapeHtml(todo.text)}</span>
        ${dueDateHtml}
      </div>
      <button class="btn btn--edit" aria-label="수정">수정</button>
      <button class="btn btn--delete" aria-label="삭제">삭제</button>
    </li>`;
  }).join('');

  list.querySelectorAll('.todo-item__checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      toggleTodo(cb.closest('.todo-item').dataset.id);
      renderTodos();
    });
  });

  list.querySelectorAll('.btn--delete').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteTodo(btn.closest('.todo-item').dataset.id);
      renderTodos();
    });
  });

  list.querySelectorAll('.btn--edit').forEach(btn => {
    btn.addEventListener('click', () => {
      enterEditMode(btn.closest('.todo-item'));
    });
  });
}

function enterEditMode(li) {
  const id = li.dataset.id;
  const textSpan = li.querySelector('.todo-item__text');
  const editBtn = li.querySelector('.btn--edit');
  const currentText = textSpan.textContent;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'todo-item__edit-input';
  input.value = currentText;
  textSpan.replaceWith(input);
  input.focus();

  editBtn.textContent = '저장';
  editBtn.classList.replace('btn--edit', 'btn--save');

  function save() {
    const newText = input.value.trim();
    if (newText && newText !== currentText) updateTodo(id, { text: newText });
    renderTodos();
  }

  editBtn.addEventListener('click', save, { once: true });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') renderTodos();
  });
}

function formatDueDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const opts = isToday
    ? { hour: '2-digit', minute: '2-digit' }
    : { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return (isToday ? '오늘 ' : '') + d.toLocaleString('ko-KR', opts);
}

function isDueOverdue(todo) {
  if (!todo.dueDate || todo.completed) return false;
  return new Date(todo.dueDate) < new Date();
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ===== 주간 뷰 =====
let weekOffset = 0;
let selectedDayKey = toDateKey(new Date());
const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

function getWeekRange(offset) {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function groupByDay(todos, days) {
  const grouped = {};
  days.forEach(d => { grouped[toDateKey(d)] = []; });
  todos.forEach(todo => {
    const ref = todo.completedAt || todo.dueDate || todo.createdAt;
    const key = ref ? ref.slice(0, 10) : null;
    if (key && grouped[key] !== undefined) grouped[key].push(todo);
  });
  return grouped;
}

function renderWeeklyView() {
  const days = getWeekRange(weekOffset);
  const todayKey = toDateKey(new Date());
  const todos = loadTodos();
  const grouped = groupByDay(todos, days);

  const first = days[0], last = days[6];
  document.getElementById('week-label').textContent =
    `${first.getMonth() + 1}월 ${first.getDate()}일 – ${last.getMonth() + 1}월 ${last.getDate()}일`;

  if (!days.some(d => toDateKey(d) === selectedDayKey)) {
    selectedDayKey = days.some(d => toDateKey(d) === todayKey) ? todayKey : toDateKey(days[0]);
  }

  document.getElementById('weekly-days').innerHTML = days.map(d => {
    const key = toDateKey(d);
    const isToday = key === todayKey;
    const isSelected = key === selectedDayKey;
    const count = grouped[key].length;
    const done = grouped[key].filter(t => t.completed).length;
    const countHtml = count > 0
      ? `<span class="weekly-day-btn__count">${done}/${count}</span>`
      : `<span class="weekly-day-btn__count weekly-day-btn__count--empty">–</span>`;
    return `
      <button class="weekly-day-btn${isToday ? ' weekly-day-btn--today' : ''}${isSelected ? ' weekly-day-btn--selected' : ''}" data-key="${key}">
        <span class="weekly-day-btn__name">${DAY_NAMES[d.getDay()]}</span>
        <span class="weekly-day-btn__date">${d.getMonth() + 1}/${d.getDate()}</span>
        ${countHtml}
      </button>`;
  }).join('');

  document.getElementById('weekly-days').querySelectorAll('.weekly-day-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedDayKey = btn.dataset.key;
      renderWeeklyView();
    });
  });

  renderWeeklyDetail(grouped[selectedDayKey] || [], selectedDayKey);
}

function renderWeeklyDetail(dayTodos, key) {
  const d = new Date(key + 'T00:00:00');
  const done = dayTodos.filter(t => t.completed).length;
  const label = `${DAY_NAMES[d.getDay()]}요일 · ${d.getMonth() + 1}월 ${d.getDate()}일`
    + (dayTodos.length > 0 ? ` · ${done}/${dayTodos.length} 완료` : '');

  const itemsHtml = dayTodos.length === 0
    ? '<p class="weekly-detail__empty">이 날 등록된 할 일이 없습니다</p>'
    : `<ul class="weekly-detail__list">${dayTodos.map(t => `
        <li class="weekly-detail__item${t.completed ? ' weekly-detail__item--done' : ''}">
          <input type="checkbox" class="todo-item__checkbox" ${t.completed ? 'checked' : ''} data-id="${t.id}" aria-label="완료 토글">
          ${categoryBadge(t.category)}
          <span class="badge badge--priority--${t.priority || '보통'}">${t.priority || '보통'}</span>
          <span class="weekly-detail__text">${escapeHtml(t.text)}</span>
        </li>`).join('')}</ul>`;

  document.getElementById('weekly-detail').innerHTML = `
    <p class="weekly-detail__header">${label}</p>
    ${itemsHtml}
  `;

  document.getElementById('weekly-detail').querySelectorAll('.todo-item__checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      toggleTodo(cb.dataset.id);
      renderWeeklyView();
    });
  });
}

function initViewToggle() {
  const listBtn = document.getElementById('view-list');
  const weeklyBtn = document.getElementById('view-weekly');
  const listSection = document.getElementById('list-section');
  const weeklySection = document.getElementById('weekly-section');
  const filterTabs = document.getElementById('filter-tabs');

  listBtn.addEventListener('click', () => {
    listBtn.classList.add('view-btn--active');
    weeklyBtn.classList.remove('view-btn--active');
    listSection.style.display = '';
    weeklySection.style.display = 'none';
    filterTabs.style.display = '';
  });

  weeklyBtn.addEventListener('click', () => {
    weeklyBtn.classList.add('view-btn--active');
    listBtn.classList.remove('view-btn--active');
    listSection.style.display = 'none';
    weeklySection.style.display = '';
    filterTabs.style.display = 'none';
    weekOffset = 0;
    renderWeeklyView();
  });

  document.getElementById('week-prev').addEventListener('click', () => { weekOffset--; renderWeeklyView(); });
  document.getElementById('week-next').addEventListener('click', () => { weekOffset++; renderWeeklyView(); });
}

// ===== 필터 탭 (동적, 인라인 추가/삭제) =====
function renderFilterTabs() {
  const container = document.getElementById('filter-tabs');
  const cats = loadCategories();

  const allBtn = `<button class="filter-tab${activeFilter === '전체' ? ' filter-tab--active' : ''}" data-filter="전체">전체</button>`;

  const catBtns = cats.map(c => `
    <span class="filter-tab-group">
      <button class="filter-tab filter-tab--cat${activeFilter === c.name ? ' filter-tab--active' : ''}" data-filter="${escapeHtml(c.name)}">${escapeHtml(c.name)}</button><button class="filter-tab__del" data-cat="${escapeHtml(c.name)}" title="삭제">×</button>
    </span>`).join('');

  const addBtn = `<button class="filter-tab filter-tab--add" id="cat-inline-add">+</button>`;

  container.innerHTML = allBtn + catBtns + addBtn;

  container.querySelector('[data-filter="전체"]').addEventListener('click', () => {
    activeFilter = '전체';
    renderFilterTabs();
    renderTodos();
  });

  container.querySelectorAll('.filter-tab--cat').forEach(tab => {
    tab.addEventListener('click', () => {
      activeFilter = tab.dataset.filter;
      renderFilterTabs();
      renderTodos();
    });
  });

  container.querySelectorAll('.filter-tab__del').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.cat;
      if (activeFilter === name) activeFilter = '전체';
      saveCategories(loadCategories().filter(c => c.name !== name));
      refreshAll();
    });
  });

  document.getElementById('cat-inline-add').addEventListener('click', () => showCatInput(container));
}

function showCatInput(container) {
  container.querySelector('#cat-inline-add').style.display = 'none';

  const wrap = document.createElement('span');
  wrap.className = 'filter-tab-input-wrap';
  wrap.innerHTML = `
    <input class="filter-tab-input" id="cat-inline-input" placeholder="카테고리명" maxlength="10" autocomplete="off">
    <button class="filter-tab filter-tab--confirm" id="cat-inline-confirm">확인</button>
    <button class="filter-tab filter-tab--cancel" id="cat-inline-cancel">✕</button>`;
  container.appendChild(wrap);

  const input = wrap.querySelector('#cat-inline-input');
  input.focus();

  function confirm() {
    const name = input.value.trim();
    if (!name) { input.focus(); return; }
    const cats = loadCategories();
    if (cats.some(c => c.name === name)) {
      input.select();
      return;
    }
    saveCategories([...cats, { name, color: COLOR_PALETTE[cats.length % COLOR_PALETTE.length] }]);
    refreshAll();
  }

  wrap.querySelector('#cat-inline-confirm').addEventListener('click', confirm);
  wrap.querySelector('#cat-inline-cancel').addEventListener('click', () => renderFilterTabs());
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') confirm();
    if (e.key === 'Escape') renderFilterTabs();
  });
}

// ===== 카테고리 셀렉트 (동적) =====
function renderCategorySelect() {
  const select = document.getElementById('category-select');
  const current = select.value;
  const cats = loadCategories();
  select.innerHTML = cats.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('');
  if (cats.some(c => c.name === current)) select.value = current;
}

// ===== 전체 새로고침 =====
function refreshAll() {
  renderCategorySelect();
  renderFilterTabs();
  renderTodos();
}


// ===== 입력 폼 이벤트 =====
function initForm() {
  const input = document.getElementById('todo-input');
  const select = document.getElementById('category-select');
  const prioritySelect = document.getElementById('priority-select');
  const dueInput = document.getElementById('due-input');
  const addBtn = document.getElementById('add-btn');

  function handleAdd() {
    const text = input.value.trim();
    if (!text) { input.focus(); return; }
    addTodo(text, select.value, prioritySelect.value, dueInput.value || null);
    input.value = '';
    dueInput.value = '';
    input.focus();
    renderTodos();
  }

  addBtn.addEventListener('click', handleAdd);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') handleAdd(); });
}

// ===== 내보내기 / 가져오기 =====
function initExportImport() {
  document.getElementById('export-btn').addEventListener('click', () => {
    const todos = loadTodos();
    if (todos.length === 0) { alert('내보낼 할 일이 없습니다.'); return; }
    const json = JSON.stringify(todos, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todos_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('import-input').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!Array.isArray(parsed)) throw new Error('배열 형식이 아닙니다.');
        const valid = parsed.every(item =>
          typeof item.id === 'string' &&
          typeof item.text === 'string' &&
          typeof item.category === 'string' && item.category.length > 0 &&
          typeof item.completed === 'boolean'
        );
        if (!valid) throw new Error('올바른 할 일 형식이 아닙니다.');
        const existing = loadTodos();
        const existingIds = new Set(existing.map(t => t.id));
        const newItems = parsed.filter(t => !existingIds.has(t.id));
        saveTodos([...existing, ...newItems]);
        renderTodos();
        alert(`${newItems.length}개 항목을 가져왔습니다. (중복 ${parsed.length - newItems.length}개 제외)`);
      } catch (err) {
        alert(`가져오기 실패: ${err.message}`);
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  });
}

// ===== 다크모드 =====
function initTheme() {
  const btn = document.getElementById('theme-toggle');
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    btn.textContent = '☀️';
  }
  btn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      btn.textContent = '🌙';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      btn.textContent = '☀️';
    }
  });
}

// ===== 날짜 표시 =====
function renderDate() {
  document.getElementById('today-date').textContent =
    new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
}

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initExportImport();
  initViewToggle();
  renderDate();
  renderCategorySelect();
  renderFilterTabs();
  initForm();
  renderTodos();
});
