<!-- Created: 2026-03-23 13:00 -->

# Claude Code 슬래시 명령어 전체 정리

---

## 세션 관리

| 명령어 | 설명 |
|--------|------|
| `/clear` `/reset` `/new` | 대화 히스토리 초기화 (컨텍스트 해제) |
| `/resume [세션ID]` | 이전 대화 이어서 시작 |
| `/branch [name]` | 현재 대화에서 새 브랜치 생성 |
| `/rename [name]` | 현재 세션 이름 변경 |
| `/add-dir <경로>` | 작업 디렉토리 추가 |
| `/exit` `/quit` | Claude Code 종료 |

---

## 설정 & 환경

| 명령어 | 설명 |
|--------|------|
| `/model` | AI 모델 변경 |
| `/config` `/settings` | 설정 UI 열기 (테마, 모델, 출력 등) |
| `/theme` | 색상 테마 변경 (라이트/다크/색약) |
| `/effort [low\|medium\|high\|max]` | 모델 추론 깊이 설정 |
| `/vim` | Vim 편집 모드 토글 |
| `/keybindings` | 단축키 설정 파일 열기 |
| `/statusline` | 상태바 표시 설정 |
| `/terminal-setup` | 터미널 단축키 설정 (Shift+Enter 등) |

---

## 코드 & 프로젝트

| 명령어 | 설명 |
|--------|------|
| `/init` | 프로젝트 분석 후 CLAUDE.md 자동 생성 |
| `/diff` | 변경 파일 diff 뷰어 |
| `/rewind` `/checkpoint` | 이전 시점으로 대화·코드 되돌리기 |
| `/plan` | **Plan Mode 진입** (읽기 전용 설계 모드) |
| `/copy [N]` | 마지막 응답을 클립보드에 복사 |
| `/export [파일명]` | 대화를 텍스트로 내보내기 |

---

## AI 기능

| 명령어 | 설명 |
|--------|------|
| `/btw <질문>` | ⭐ **신규 (2026.03)** — 대화 흐름 유지하며 즉석 질문 |
| `/compact [지침]` | 대화 히스토리 압축 |
| `/cost` | 토큰 사용량 통계 |
| `/context` | 컨텍스트 사용 현황 시각화 |
| `/fast [on\|off]` | 빠른 모드 토글 |

---

## 통합 & 인증

| 명령어 | 설명 |
|--------|------|
| `/mcp` | MCP 서버 연결 관리 |
| `/permissions` | 허용 도구 확인·변경 |
| `/hooks` | 훅 설정 확인 |
| `/install-github-app` | GitHub Actions Claude 앱 설치 |
| `/pr-comments [PR]` | GitHub PR 댓글 불러오기 |
| `/ide` | IDE 통합 상태 관리 |
| `/login` / `/logout` | 계정 로그인/로그아웃 |

---

## 정보 & 지원

| 명령어 | 설명 |
|--------|------|
| `/help` | 도움말 및 전체 명령어 목록 |
| `/status` | 버전, 모델, 계정, 연결 상태 표시 |
| `/doctor` | 설치·설정 진단 |
| `/release-notes` | 전체 변경 이력 |
| `/feedback` `/bug` | 피드백·버그 제보 |
| `/insights` | 세션 분석 리포트 |
| `/stats` | 일별 사용량, 모델 선호도 시각화 |

---

## 번들 스킬 (Skills)

`/` 입력 시 아래 스킬도 함께 표시됨:

| 스킬 | 설명 |
|------|------|
| `/simplify` | 변경된 코드 품질·재사용성 검토 후 개선 |
| `/batch` | 대규모 변경을 5~30개 워크트리에 병렬 실행 |
| `/loop` | 명령어를 반복 실행 (예: `/loop 5m /foo`) |
| `/update-config` | settings.json 설정 변경 |
| `/debug` | 디버그 로깅 활성화 |

---

## CLI 실행 플래그 (주요)

```bash
claude -p "질문"              # 비대화형 실행 후 종료
claude -c                     # 가장 최근 대화 이어서 시작
claude --permission-mode plan # Plan Mode로 시작
claude --model opus           # 모델 지정
claude --effort high          # 추론 깊이 지정
claude --worktree <name>      # 격리된 git 워크트리에서 시작
```
