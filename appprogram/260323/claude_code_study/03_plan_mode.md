<!-- Created: 2026-03-23 13:00 -->

# Plan Mode

---

## Plan Mode란?

코드를 **전혀 수정하지 않고** 탐색·분석·설계만 수행하는 **읽기 전용 모드**.
Claude가 파일을 마음대로 변경하는 것을 막고, 먼저 계획을 세운 뒤 사용자 승인을 받아 실행한다.

---

## Plan Mode가 왜 필요한가?

### 문제 상황: Plan 없이 바로 작업하면

```
사용자: "웹 버전에 오답 저장 기능 추가해줘"

Claude: (즉시 시작)
  → app.py 수정  ← API 설계 없이 바로 코딩
  → model.py 수정 ← app.py 와 데이터 형식 불일치
  → index.html 수정 ← JS 와 API 응답 구조 어긋남
  → app.js 수정  ← 이미 3개 파일이 서로 다른 방향

결과: 파일들이 서로 맞지 않아 전부 다시 작성
```

### Plan Mode를 쓰면

```
사용자: "웹 버전에 오답 저장 기능 추가해줘"

1. [Plan Mode] 코드베이스 탐색
   → app.py /predict 구조 확인
   → model.py preprocess_canvas 시그니처 확인
   → app.js fetch 방식 확인

2. [Plan Mode] 전체 데이터 흐름 설계
   → POST /save_sample: {image, label} → user_samples.npz
   → model.py: save_user_sample(), retrain_with_user_samples()
   → index.html: 정답 입력 UI 추가
   → app.js: lastImageData 저장, 저장 버튼 핸들러

3. [사용자 승인]

4. [일반 모드] 설계대로 4개 파일 일관성 있게 구현
```

---

## 차단되는 작업 vs 허용되는 작업

| 허용 (읽기 전용) | 차단 (쓰기 작업) |
|-----------------|-----------------|
| 파일 읽기 | 파일 생성·수정 |
| 코드 검색 | 셸 명령 실행 |
| 사용자에게 질문 | git 커밋·푸시 |
| 계획 파일 작성 | 패키지 설치 |

> 유일한 예외: `~/.claude/plans/` 안의 계획 파일은 수정 가능

---

## 활성화 방법

### 1. 단축키 (가장 빠름)
```
Shift+Tab  →  Normal → Plan Mode → Auto-Accept 순으로 순환
```
화면 하단에 `⏸ plan mode on` 표시됨

### 2. 슬래시 명령어
```
/plan
```

### 3. 시작 시 플래그
```bash
claude --permission-mode plan
```

### 4. 기본값으로 설정
```json
// .claude/settings.json
{
  "permissions": {
    "defaultMode": "plan"
  }
}
```

---

## Plan Mode 실습 워크플로우 (이 수업에서 진행한 것)

```
1단계: Plan Mode 진입
  /plan  또는  Shift+Tab

2단계: Explore 에이전트로 코드 탐색 (읽기만)
  → app.py, model.py, index.html, app.js 분석
  → /predict API 입출력 구조 파악
  → preprocess_canvas 시그니처 확인

3단계: 계획 파일 작성
  → ~/.claude/plans/xxx.md 에 구현 계획 정리
  → 수정할 파일 목록, 함수 시그니처, 데이터 형식

4단계: ExitPlanMode 호출
  → 사용자에게 계획 표시
  → 승인하면 일반 모드로 복귀

5단계: 구현 시작
  → 계획 파일을 참조하며 일관성 있게 코딩
```

---

## Plan Mode가 특히 유용한 상황

| 상황 | 이유 |
|------|------|
| 여러 파일에 걸친 기능 추가 | 파일 간 인터페이스 사전 정의 필요 |
| 처음 보는 코드베이스 탐색 | 잘못된 위치에 코드 삽입 방지 |
| 대규모 리팩터링 | 영향 범위 파악 후 순서 결정 |
| 팀 코드 리뷰 전 분석 | 실수 없이 안전하게 검토 |
| 복잡한 버그 원인 분석 | 코드를 건드리지 않고 추적 |

---

## 이 프로젝트에서 실습한 예시

**목표**: 웹 버전에 "오답 수집 & 모델 재훈련" 기능 추가 계획

**Plan Mode에서 탐색한 내용**:
- `app.py` → `/predict` 라우트 입출력 구조
- `model.py` → `preprocess_canvas()` 반환값 `(arr_flat, frame28)`
- `app.js` → `fetch('/predict', ...)` 호출 방식
- `index.html` → 기존 버튼·캔버스 ID

**결과로 나온 설계**:
```
POST /save_sample  ← 새 라우트 (app.py)
POST /retrain      ← 새 라우트 (app.py)
save_user_sample() ← 새 함수 (model.py)
retrain_with_user_samples() ← 새 함수 (model.py)
정답 입력 UI       ← 새 HTML (index.html)
저장 버튼 핸들러   ← 새 JS (app.js)
```

Plan 없이 진행했다면 4개 파일이 서로 다른 API 구조를 가정하고 충돌했을 것.
