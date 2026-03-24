<!-- Created: 2026-03-23 12:30 -->

# CLAUDE.md & AGENTS.md 연구 보고서

---

## 1. CLAUDE.md란?

Claude Code가 **매 대화 시작 시 자동으로 읽는** 마크다운 설정 파일.
프로젝트 규칙, 명령어, 코딩 스타일, 페르소나 등을 영구적으로 기억시키는 역할.

> README는 사람을 위한 문서, CLAUDE.md는 Claude를 위한 문서

---

## 2. CLAUDE.md 배치 위치 (계층 구조)

| 위치 | 경로 | 범위 |
|------|------|------|
| **조직(전역)** | `/etc/claude-code/CLAUDE.md` (Linux)<br>`C:\Program Files\ClaudeCode\CLAUDE.md` (Windows) | 모든 사용자·프로젝트 |
| **개인(사용자)** | `~/.claude/CLAUDE.md` | 내 모든 프로젝트 |
| **프로젝트** | `./CLAUDE.md` 또는 `./.claude/CLAUDE.md` | 해당 프로젝트 팀 공유 |
| **하위 폴더** | `./web_version/CLAUDE.md` 등 | 해당 폴더 접근 시 on-demand 로드 |

**우선순위 (높음 → 낮음):**
조직 정책 > 하위폴더 CLAUDE.md > 프로젝트 CLAUDE.md > 사용자 CLAUDE.md

**파일 가져오기(import):** `@path/to/file` 문법으로 다른 파일 내용 삽입 가능 (최대 5단계)

---

## 3. CLAUDE.md에 넣을 수 있는 정책 유형

### 3-1. 프로젝트 설명 (Project Description)
```markdown
## Project
This is a handwritten digit recognition app using MNIST + scikit-learn MLP.
Python 3.11, tkinter GUI, Flask web backend.
TensorFlow is NOT available (CPU lacks AVX2).
```

### 3-2. 실행·빌드 명령어 (Commands)
```markdown
## Commands
- Run desktop: `pythonw digit_recognizer.py`
- Run web:     `python web_version/app.py`  → http://localhost:5000
- Install:     `pip install scikit-learn numpy Pillow flask`
```

### 3-3. 코딩 스타일 (Code Style)
```markdown
## Code Style
- All code and comments must be written in English
- Add creation date/time comment at the top of every new file
- Use type hints for all function signatures
- Max line length: 100 characters
```

### 3-4. 대화 정책 (Conversation Policy)
```markdown
## Conversation Policy
- Always respond in Korean regardless of input language
- Keep responses concise — lead with the answer, then explain
- Do not summarize completed work at the end of every response
- Never use emoji unless explicitly requested
```

### 3-5. 페르소나 (Persona)
```markdown
## Persona
You are a senior ML engineer specializing in computer vision.
When explaining preprocessing steps, relate them to MNIST conventions.
Assume the user is a CS student who knows Python but is new to ML.
```

### 3-6. 금지 사항 (Restrictions)
```markdown
## Restrictions
- Never install tensorflow or torch — AVX2 not supported on this machine
- Never use async/await in Flask routes (sync only)
- Do not modify mnist_mlp.pkl directly; retrain by deleting the file
```

### 3-7. Git 워크플로우
```markdown
## Git Workflow
- Commit messages format: `type(scope): description` (Conventional Commits)
- Always create feature branches; never commit directly to main
- Run tests before committing
```

### 3-8. 경로 규칙 (`.claude/rules/` 활용)
```yaml
# .claude/rules/python_rules.md
---
paths:
  - "**/*.py"
---
Always add type hints. Never use `print()` for debugging — use `logging` module.
```
> 경로 패턴과 매칭되는 파일을 읽을 때만 해당 규칙이 로드됨.

---

## 4. 정책 동작 확인 방법

| 정책 종류 | 확인 방법 |
|-----------|-----------|
| 언어 정책 | 영어로 질문했을 때 한국어로 답변하는지 확인 |
| 페르소나 | 설명 방식이 정의한 전문가 관점에서 나오는지 확인 |
| 코딩 스타일 | 새 파일 생성 시 날짜 주석 자동 포함 여부 확인 |
| 금지 사항 | tensorflow 설치 요청 시 거부하는지 확인 |
| 명령어 | `/help`나 실행 방법 질문 시 정확한 명령어 제시 여부 |

### 실제 테스트 예시 (이 프로젝트에서 확인한 것)
- ✅ "앞으로 만드는 모든 파일은 날짜와 시간을 주석으로 표시해 줘" → 이후 생성한 모든 파일 상단에 `# Created: 2026-03-23 12:05` 자동 포함
- ✅ CLAUDE.md에 TensorFlow 불가 명시 → scikit-learn 대안 자동 선택

---

## 5. AGENTS.md란?

**어떤 AI 도구에서도 동작하는** 범용 에이전트 지침 파일.
형식은 CLAUDE.md와 동일한 Markdown이지만, **특정 도구에 종속되지 않는 오픈 표준**.

- 공식 사이트: agents.md
- 라이선스: MIT
- 거버넌스: Linux Foundation 산하 Agentic AI Foundation
- GitHub: 19,300+ ⭐, 60,000+ 저장소 채택

---

## 6. CLAUDE.md vs AGENTS.md 비교

| 항목 | CLAUDE.md | AGENTS.md |
|------|-----------|-----------|
| **만든 곳** | Anthropic | 오픈 커뮤니티 (OpenAI·Google·Cursor 협업) |
| **사용 도구** | Claude Code 전용 | 30+ 도구 (Cursor, Copilot, Codex, Gemini CLI, Devin 등) |
| **로드 방식** | 매 세션 자동 로드 | 에이전트가 프로젝트 탐색 시 발견 |
| **우선순위** | AGENTS.md보다 높음 (Claude Code에서) | 도구 전용 파일보다 낮음 |
| **지속성** | 세션 간 영구 유지 | 에이전트 실행 시마다 참조 |
| **특화 기능** | 경로 규칙, import, 자동 메모리 연동 | 단순·범용 |

---

## 7. AGENTS.md 지원 도구 목록

| 분류 | 도구 |
|------|------|
| 클라우드 | Google Jules, Gemini CLI, Amazon CodeWhisperer |
| 에디터 | Cursor, VS Code, Zed, Windsurf |
| CLI | Aider, goose, OpenAI Codex, GitHub Copilot |
| AI 엔지니어 | Devin, Factory |

---

## 8. AGENTS.md 작성 예시

```markdown
# AGENTS.md

## Project
Handwritten digit recognition — Python 3.11, scikit-learn MLP, Flask + tkinter.

## Setup
pip install scikit-learn numpy Pillow flask

## Run
- Desktop: pythonw desktop_version/digit_recognizer.py
- Web:     python web_version/app.py  (http://localhost:5000)

## Key Conventions
- All code and comments in English
- New files must include creation date/time comment at top
- Do NOT install tensorflow — CPU lacks AVX2

## Architecture
- model.py: MNIST loader + MLP training + preprocess_canvas()
- preprocess_canvas(): bbox crop → 20px resize → 28×28 CoM centering
- Model saved to mnist_mlp.pkl (hidden_layer_sizes=(512,256))
```

---

## 9. 모범 사례 (Best Practices)

### CLAUDE.md
1. **200줄 이하** 유지 — 길수록 준수율 저하
2. **구체적으로** 작성: "코드를 정리해라" ✗ → "들여쓰기는 4칸 공백" ✓
3. **`/init` 명령어**로 초안 자동 생성 후 팀 상황에 맞게 수정
4. 대규모 지침은 `@import` 또는 `.claude/rules/` 로 분리
5. 충돌하는 규칙이 없도록 주기적으로 정리

### AGENTS.md
1. 사람이 읽는 README와 내용 중복 최소화 — 에이전트 전용 정보만
2. 빌드·테스트·스타일 명령을 명확히 포함
3. 모노레포에서는 각 하위 폴더에 별도 AGENTS.md 작성

### 함께 쓰는 전략
- **AGENTS.md**: 모든 도구에서 동작하는 기본 지침
- **CLAUDE.md**: Claude Code 전용 고급 최적화 (페르소나, 경로 규칙, 대화 정책 등)
- 내용이 겹치면 `AGENTS.md`를 `CLAUDE.md`에서 `@AGENTS.md`로 import

---

## 10. 참고 자료

- [Anthropic 공식 - Claude Code Memory](https://code.claude.com/docs/en/memory)
- [Anthropic 블로그 - Using CLAUDE.md files](https://claude.com/blog/using-claude-md-files)
- [AGENTS.md 공식 사이트](https://agents.md/)
- [AGENTS.md GitHub](https://github.com/agentsmd/agents.md)
- [HumanLayer - Writing a good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- [InfoQ - AGENTS.md Emerges as Open Standard](https://www.infoq.com/news/2025/08/agents-md/)
