# Claude Code 단계별 프롬프트 — 할 일 관리 앱

PRD(`PRD.md`)를 기반으로 한 5단계 구현 프롬프트입니다.
각 단계를 순서대로 Claude Code에 붙여넣어 실행하세요.

---

## STEP 1 — 프로젝트 뼈대 & 데이터 레이어

```
PRD.md 파일을 읽고 아래 지시에 따라 프로젝트를 시작해줘.

[생성할 파일]
1. index.html
2. style.css  (빈 파일, 내용은 STEP 2에서 채울 것)
3. app.js

[index.html 요구사항]
- <!DOCTYPE html> 기반 한국어(lang="ko") 문서
- <head>에 charset UTF-8, viewport meta, style.css / app.js 링크
- <body> 구조만 잡기 (실제 콘텐츠는 app.js가 렌더링):
    #app 루트 div 안에
    .header, .progress-section, .input-section, .filter-section, .todo-list 영역 배치
- 타이틀: "할 일 관리"

[app.js 요구사항]
아래 섹션을 주석으로 구분하여 작성:

// ── STATE ──────────────────────────────────
// todos 배열 (단일 진실 공급원)
// currentFilter 변수 ('전체' | '업무' | '개인' | '공부')

// ── STORAGE ────────────────────────────────
// load()  : localStorage 'todo_app_data' 키에서 JSON 파싱 후 todos에 할당
// save()  : todos 배열을 JSON.stringify 하여 localStorage에 저장

// ── CRUD ───────────────────────────────────
// addTodo(text, category, priority)
//   - id: crypto.randomUUID()
//   - createdAt: Date.now()
//   - completed: false
// updateTodo(id, changes)  — Object.assign으로 해당 항목 갱신
// deleteTodo(id)
// toggleTodo(id)           — completed 반전

// ── HELPERS ────────────────────────────────
// getSortedFilteredTodos()
//   1) currentFilter !== '전체' 이면 해당 카테고리만 필터
//   2) 미완료 먼저, 완료 나중 정렬
//   3) 미완료 내에서 우선순위 높음→보통→낮음 정렬

// ── INIT ───────────────────────────────────
// DOMContentLoaded → load() 호출 후 render() 호출 (render는 STEP 3에서 구현)

모든 함수 구현 완료 후 console.log로 동작 확인 가능하도록 init 하단에
addTodo('테스트 할 일', '업무', '높음') 호출을 주석으로 남겨둬.
```

---

## STEP 2 — CSS 스타일 (레이아웃 & 컴포넌트)

```
style.css를 작성해줘. 외부 라이브러리 없이 순수 CSS만 사용.

[디자인 원칙]
- 컬러 팔레트는 CSS 변수로 정의 (--color-primary, --color-bg, --color-surface 등)
- 기본 폰트: system-ui, -apple-system, sans-serif
- 반응형: 모바일 375px ~ 데스크톱 1280px (max-width: 720px 중앙 정렬)

[섹션별 스타일 요구사항]

1. .header
   - 앱 제목 좌측 정렬, 오늘 날짜 우측 정렬 (날짜 표시는 STEP 3에서 JS로 삽입)

2. .progress-section
   - 전체 진행률 바: 큰 프로그레스 바 1개 + "X / Y 완료 (Z%)" 텍스트
   - 카테고리별 진행률: 3개를 가로로 나열, 각각 라벨 + 작은 프로그레스 바 + 퍼센트
   - 프로그레스 바는 <div class="progress-bar"><div class="progress-fill" style="width:X%"></div></div> 구조 사용
   - .progress-fill 색상: 전체(--color-primary), 업무(파랑), 개인(초록), 공부(보라)

3. .input-section
   - 텍스트 입력창, 카테고리 select, 우선순위 select, 추가 버튼을 한 줄로 배치
   - 모바일에서는 입력창이 전체 너비, 나머지는 두 번째 줄로 내려감

4. .filter-section
   - 필터 버튼 4개 (전체/업무/개인/공부) + 우측에 "완료 항목 삭제" 버튼
   - 활성 필터 버튼: .active 클래스로 강조

5. .todo-item
   - 체크박스, 우선순위 점(●), 텍스트, 카테고리 뱃지, 수정·삭제 버튼 한 줄 배치
   - completed 상태: 텍스트에 line-through + opacity 0.45
   - 우선순위 색상: 높음 #ef4444(빨강), 보통 #f59e0b(노랑), 낮음 #9ca3af(회색)
   - 카테고리 뱃지: 둥근 pill 모양, 업무(파랑), 개인(초록), 공부(보라)
   - 호버 시 배경색 살짝 변경, 수정·삭제 버튼은 호버 시에만 표시

6. .todo-item.editing
   - 편집 모드: 텍스트 자리에 input 표시, 카테고리·우선순위 select 표시
   - 저장·취소 버튼 표시
```

---

## STEP 3 — 렌더링 & 이벤트 핸들러

```
app.js에 렌더링 함수와 이벤트 핸들러를 추가해줘.
기존 STATE / STORAGE / CRUD / HELPERS 코드는 건드리지 말고,
아래 섹션을 이어서 작성해.

// ── RENDER ─────────────────────────────────

[renderProgress()]
- .progress-section DOM을 innerHTML로 교체
- 전체 완료율 계산 후 큰 프로그레스 바 렌더링
- 카테고리별(업무/개인/공부) 완료율 계산
  - 해당 카테고리 항목이 0개이면 해당 카테고리 블록을 렌더링하지 않음
- 오늘 날짜를 .header 날짜 영역에 "YYYY년 M월 D일 (요일)" 형식으로 표시

[renderTodos()]
- getSortedFilteredTodos()로 목록 가져오기
- 항목이 0개면 "할 일이 없습니다" 빈 상태 메시지 표시
- 각 항목을 .todo-item div로 렌더링
  - data-id 속성에 todo.id 저장
  - 완료 시 .completed 클래스 추가
  - 편집 중인 항목(editingId 상태변수)은 .editing 클래스 + 편집 폼 렌더링

[render()]
- renderProgress() + renderTodos() 동시 호출

// ── EVENTS ─────────────────────────────────

이벤트 위임 방식(event delegation)으로 .todo-list에 click 이벤트 1개만 등록:
- 체크박스 클릭 → toggleTodo(id) → save() → render()
- 수정 버튼 클릭 → editingId = id → render()
- 저장 버튼 클릭 → updateTodo(id, {text, category, priority}) → editingId = null → save() → render()
- 취소 버튼 클릭 → editingId = null → render()
- 삭제 버튼 클릭 → deleteTodo(id) → save() → render()

편집 모드 input에서 Enter → 저장, Esc → 취소 (keydown 이벤트)

추가 폼:
- [추가] 버튼 클릭 또는 텍스트 입력창 Enter → addTodo() → save() → render() → 입력창 초기화

필터 버튼:
- 클릭 시 currentFilter 변경 → 모든 필터 버튼 .active 클래스 갱신 → renderTodos()

완료 항목 삭제 버튼:
- todos에서 completed === true 항목 제거 → save() → render()
```

---

## STEP 4 — 통합 검증 & 엣지 케이스 처리

```
현재 구현된 index.html / style.css / app.js 파일을 모두 읽고
아래 체크리스트를 순서대로 확인한 뒤, 문제가 있는 항목만 수정해줘.
수정이 필요 없는 항목은 "✅ 이상 없음"으로 표시해.

[기능 체크리스트]
1. localStorage 저장·복원
   - 빈 배열일 때 load()가 에러 없이 빈 배열 반환하는가?
   - JSON.parse 실패 시 try/catch로 빈 배열 반환하는가?

2. 입력 유효성
   - 빈 문자열 trim() 후 addTodo 호출 차단하는가?

3. 정렬
   - 미완료(우선순위 높→보→낮) → 완료 순서가 실제로 동작하는가?

4. 진행률
   - 할 일이 0개일 때 진행률 0% 표시 (0으로 나누기 방지)하는가?
   - 카테고리 항목이 0개이면 해당 카테고리 블록이 숨겨지는가?

5. 편집 모드
   - 수정 중 다른 항목의 수정 버튼을 누르면 이전 편집이 취소되는가?
   - Enter/Esc 키 처리가 올바르게 동작하는가?

6. 반응형
   - 모바일 375px 뷰포트에서 입력 섹션이 두 줄로 깨지지 않고 표시되는가?

7. 접근성
   - 체크박스에 aria-label 또는 연결된 <label>이 있는가?
   - 버튼에 의미 있는 텍스트 또는 aria-label이 있는가?

문제를 수정한 경우 각 항목 옆에 "🔧 수정함 — [수정 내용 한 줄 요약]"으로 표시해줘.
```

---

## STEP 5 — 마무리 polish & 사용성 개선

```
현재 완성된 앱을 열어보고, 아래 UX 개선 사항을 적용해줘.

[필수 적용]
1. 빈 상태(todo가 0개)일 때 일러스트 대신 안내 문구 표시
   "아직 할 일이 없어요. 첫 번째 할 일을 추가해보세요! 📝"

2. 할 일 추가 성공 시 피드백
   - 텍스트 입력창 아래에 "추가되었습니다!" 문구를 1.5초간 표시 후 자동 제거
   - CSS transition으로 fadeIn/fadeOut 처리

3. 완료 항목 삭제 버튼
   - 완료 항목이 0개일 때 버튼을 비활성화(disabled + 흐리게) 처리

4. 필터 활성 상태
   - 페이지 첫 로드 시 "전체" 필터 버튼에 .active 클래스가 적용되어 있어야 함

5. 숫자 뱃지
   - 각 필터 버튼에 해당 카테고리의 미완료 개수를 뱃지로 표시
     예: [업무 (3)] [개인 (1)] [공부 (5)]
   - 미완료가 0이면 뱃지 숨김

[확인 후 README.md 생성]
위 항목 적용이 완료되면, 아래 내용을 담은 README.md를 생성해줘:
- 앱 소개 1~2줄
- 실행 방법: "index.html을 브라우저에서 열면 바로 실행됩니다."
- 주요 기능 목록 (bullet)
- 데이터 저장 방식 (localStorage)
- 파일 구조 설명
```

---

## 단계별 실행 순서 요약

| 단계 | 핵심 작업 | 산출물 |
|------|-----------|--------|
| STEP 1 | 파일 생성 + 데이터 레이어 | `index.html`, `app.js`(State/Storage/CRUD) |
| STEP 2 | 전체 스타일링 | `style.css` 완성 |
| STEP 3 | 렌더링 + 이벤트 연결 | `app.js` 완성 → 동작하는 앱 |
| STEP 4 | 버그 검증 + 엣지 케이스 수정 | 안정적인 앱 |
| STEP 5 | UX polish + README | 배포 가능한 완성본 |
