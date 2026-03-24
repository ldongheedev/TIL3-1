<!-- Created: 2026-03-23 13:00 -->

# Claude Code 옵션 & Plan Mode 연구

> 수업 과제: Claude Code 주요 기능 조사 및 실습

---

## 과제 체크리스트

- [x] **조건 1** — 다양한 옵션 조사 (슬래시 명령어, 단축키, /btw 신규 기능 등)
- [x] **조건 2** — Plan Mode 실습 및 필요성 이해

---

## 파일 목차

| 파일 | 내용 |
|------|------|
| [01_slash_commands.md](01_slash_commands.md) | 전체 슬래시 명령어 카테고리별 정리 |
| [02_btw_command.md](02_btw_command.md) | 신규 추가된 `/btw` 명령어 상세 분석 |
| [03_plan_mode.md](03_plan_mode.md) | Plan Mode 개념, 필요성, 실습 워크플로우 |
| [04_keyboard_shortcuts.md](04_keyboard_shortcuts.md) | 전체 단축키 참조표 |

---

## 핵심 요약

### 가장 중요한 신규 기능: `/btw`
대화 히스토리를 오염시키지 않고 즉석 질문을 던지는 명령어.
작업 중 궁금한 점을 물어볼 때 사용하며 토큰 비용을 최대 50% 절감할 수 있다.

### Plan Mode가 필요한 이유
여러 파일에 걸친 수정이 필요할 때, 먼저 **읽기 전용**으로 코드베이스를 탐색하고
설계를 확정한 뒤 구현에 들어가는 안전한 워크플로우를 강제한다.
`Shift+Tab`으로 즉시 활성화 가능.
