# PRD Step 1 — Streamlit 기반 웹 UI + 냉장고 재료 인식

## 개요
냉장고 사진을 업로드하면 AI(Google Gemma 3 27B-it)가 식재료를 자동 분석하여 목록으로 표시하는 Streamlit 웹 앱을 구축합니다.

## 기술 스택
- **언어**: Python 3.10+
- **프레임워크**: Streamlit
- **AI 모델**: google/gemma-3-27b-it:free (이미지 인식)
- **API**: OpenRouter
- **의존성**: streamlit, python-dotenv, requests

## 핵심 기능

### 1. 이미지 업로드 UI
- `st.file_uploader`로 냉장고 사진 업로드 (JPG, PNG, WEBP)
- 업로드한 이미지 미리보기 표시
- [재료 분석 시작] 버튼

### 2. AI 재료 인식
- 업로드한 이미지를 Base64로 인코딩
- OpenRouter API를 통해 Gemma 3 27B-it 모델에 전달
- 모델 폴백: gemma-3-27b-it → gemma-4-31b-it → nvidia/nemotron-nano-12b-v2-vl
- 응답을 JSON 파싱하여 재료 목록 추출

### 3. 재료 목록 표시
- 인식된 재료를 카드 형태로 표시
- 재료명, 수량, 상태(신선/보통/임박) 포함
- 재료 편집(이름/수량 수정) 및 삭제 기능
- 재료 직접 추가 기능

## 파일 구조
```
260413/
├── app.py          # 메인 Streamlit 앱
├── requirements.txt
├── .env            # OPENROUTER_API_KEY (비공개)
├── .env.example
└── .gitignore
```

## 구현 순서
1. `requirements.txt` 작성
2. `app.py` 생성 (Step 1 기능만)
3. `streamlit run app.py`로 실행
4. 브라우저 http://localhost:8501 에서 테스트

## 완료 기준
- [ ] 이미지 업로드 UI 정상 동작
- [ ] AI가 냉장고 사진에서 재료를 인식하여 목록 출력
- [ ] 재료 편집/삭제/추가 기능 동작
