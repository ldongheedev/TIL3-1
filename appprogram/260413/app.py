"""
냉장고를 부탁해 — FridgeChef
AI 기반 맞춤형 레시피 추천 시스템 (Streamlit + OpenRouter)
"""

import streamlit as st
import os
import json
import base64
import re
import requests
from datetime import datetime
from dotenv import load_dotenv

# ── 환경 설정 ─────────────────────────────────────────────
load_dotenv()
API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# 이미지 인식 모델 폴백 목록
VISION_MODELS = [
    "google/gemma-3-27b-it:free",
    "google/gemma-4-31b-it:free",
    "google/gemma-4-26b-a4b-it:free",
    "nvidia/nemotron-nano-12b-v2-vl:free",
    "google/gemma-3-12b-it:free",
]

# 텍스트 생성 모델 폴백 목록
TEXT_MODELS = [
    "qwen/qwen3.6-plus:free",
    "openai/gpt-oss-20b:free",
    "google/gemma-4-31b-it:free",
    "meta-llama/llama-3.3-70b-instruct:free",
]


# ── 공통 유틸 ─────────────────────────────────────────────
def call_with_fallback(models: list, messages: list) -> tuple[str, str]:
    """모델 폴백 포함 OpenRouter API 호출"""
    daily_limit_hit = False
    for model in models:
        try:
            res = requests.post(
                OPENROUTER_URL,
                headers={
                    "Authorization": f"Bearer {API_KEY}",
                    "Content-Type": "application/json",
                },
                json={"model": model, "messages": messages},
                timeout=90,
            )
            if res.status_code == 200:
                data = res.json()
                return data["choices"][0]["message"]["content"].strip(), model

            err = res.json().get("error", {})
            msg = err.get("message", "")
            st.caption(f"[skip] {model}: {msg[:80]}")
            if "free-models-per-day" in msg:
                daily_limit_hit = True

        except requests.exceptions.Timeout:
            st.caption(f"[skip] {model}: 응답 시간 초과")
        except Exception as e:
            st.caption(f"[skip] {model}: {e}")

    if daily_limit_hit:
        raise Exception(
            "오늘의 무료 호출 한도(200회)를 초과했습니다. "
            "내일 UTC 자정 이후에 다시 시도하거나 openrouter.ai에서 크레딧을 충전하세요."
        )
    raise Exception("모든 모델이 일시적으로 사용 불가합니다. 잠시 후 다시 시도해주세요.")


def extract_json(text: str):
    """마크다운 코드블록 포함 JSON 배열 추출"""
    stripped = re.sub(r"```(?:json)?\s*", "", text).replace("```", "").strip()
    for src in [text, stripped]:
        match = re.search(r"\[[\s\S]*\]", src)
        if match:
            try:
                return json.loads(match.group(0))
            except Exception:
                pass
    return None


# ── Step 1: 재료 인식 ─────────────────────────────────────
def recognize_ingredients(image_bytes: bytes, mime_type: str = "image/jpeg"):
    b64 = base64.b64encode(image_bytes).decode()
    data_url = f"data:{mime_type};base64,{b64}"

    prompt = (
        "이 냉장고 사진에서 보이는 식재료를 모두 파악해주세요.\n"
        "반드시 다음 JSON 배열 형식으로만 응답하세요. 설명이나 다른 텍스트 없이 JSON만 반환하세요:\n"
        '[{"name": "재료명", "quantity": "수량 또는 상태", "status": "신선 또는 보통 또는 임박"}]\n'
        "재료명은 한국어로, quantity는 \"2개\", \"조금\", \"반 병\" 처럼 간략하게 표현하세요."
    )

    text, model = call_with_fallback(VISION_MODELS, [
        {
            "role": "user",
            "content": [
                {"type": "image_url", "image_url": {"url": data_url}},
                {"type": "text", "text": prompt},
            ],
        }
    ])

    ingredients = extract_json(text)
    if not ingredients:
        # JSON 파싱 실패 시 텍스트 줄 단위로 파싱
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        ingredients = [
            {"name": re.sub(r"^[-•*\d.\s]+", "", l), "quantity": "", "status": "보통"}
            for l in lines if l
        ]
    return ingredients, model


# ── Step 2: 레시피 생성 ───────────────────────────────────
def generate_recipes(ingredients: list, filters: list = None):
    ingredient_text = "\n".join(
        f"- {i['name']}{' (' + i['quantity'] + ')' if i.get('quantity') else ''}"
        for i in ingredients
    )
    filter_text = f"\n식단 제한: {', '.join(filters)}" if filters else ""
    total = len(ingredients)

    prompt = (
        f"당신은 요리 전문가입니다. 아래 재료로 만들 수 있는 레시피 3개를 추천해주세요.{filter_text}\n\n"
        f"재료 목록 (총 {total}개):\n{ingredient_text}\n\n"
        "다음 JSON 형식으로만 응답하세요. 설명 없이 JSON 배열만 반환하세요:\n"
        "[\n"
        "  {\n"
        '    "name": "요리명",\n'
        '    "difficulty": "쉬움 또는 보통 또는 어려움",\n'
        '    "time": "조리시간(예: 20분)",\n'
        '    "calories": "칼로리(예: 350kcal)",\n'
        '    "ingredients": ["사용재료1", "사용재료2"],\n'
        '    "steps": ["1단계 설명", "2단계 설명", "3단계 설명"]\n'
        "  }\n"
        "]"
    )

    text, model = call_with_fallback(TEXT_MODELS, [
        {"role": "user", "content": prompt}
    ])

    recipes = extract_json(text) or []
    return recipes, model


# ── 세션 초기화 ────────────────────────────────────────────
def init_session():
    defaults = {
        "ingredients": [],
        "recipes": [],
        "users": {
            "demo": {
                "password": "demo123",
                "saved_recipes": [],
                "cook_count": 0,
            }
        },
        "logged_in": None,
    }
    for key, val in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = val


# ── 페이지 1: 재료 인식 ───────────────────────────────────
def page_recognize():
    st.header("🔍 냉장고 재료 인식")
    st.caption("냉장고 사진을 업로드하면 AI가 식재료를 자동으로 분석합니다.")

    uploaded = st.file_uploader(
        "냉장고 사진 업로드",
        type=["jpg", "jpeg", "png", "webp"],
        help="JPG, PNG, WEBP 형식 지원 | 최대 20MB",
    )

    if uploaded:
        col_img, col_btn = st.columns([1, 1])
        with col_img:
            st.image(uploaded, caption="업로드된 사진", use_container_width=True)
        with col_btn:
            st.write("")
            st.write("")
            if st.button("🤖 재료 분석 시작", type="primary", use_container_width=True):
                with st.spinner("AI가 재료를 분석 중입니다... (최대 30초)"):
                    try:
                        mime = "image/png" if uploaded.type == "image/png" else "image/jpeg"
                        ingredients, model = recognize_ingredients(uploaded.read(), mime)
                        st.session_state.ingredients = ingredients
                        st.success(f"✅ {len(ingredients)}개 재료 인식 완료")
                        st.caption(f"사용 모델: `{model}`")
                    except Exception as e:
                        st.error(str(e))

    # 재료 목록
    if st.session_state.ingredients:
        st.divider()
        st.subheader(f"인식된 재료 ({len(st.session_state.ingredients)}개)")
        st.caption("재료명과 수량을 직접 수정할 수 있습니다.")

        cols_header = st.columns([3, 2, 1])
        cols_header[0].markdown("**재료명**")
        cols_header[1].markdown("**수량**")
        cols_header[2].markdown("")

        to_delete = []
        edited = []
        for i, item in enumerate(st.session_state.ingredients):
            cols = st.columns([3, 2, 1])
            with cols[0]:
                name = st.text_input(
                    "재료명", value=item.get("name", ""),
                    key=f"name_{i}", label_visibility="collapsed"
                )
            with cols[1]:
                qty = st.text_input(
                    "수량", value=item.get("quantity", ""),
                    key=f"qty_{i}", label_visibility="collapsed"
                )
            with cols[2]:
                if st.button("삭제", key=f"del_{i}", use_container_width=True):
                    to_delete.append(i)
                    continue
            edited.append({"name": name, "quantity": qty, "status": item.get("status", "보통")})

        if to_delete:
            st.session_state.ingredients = edited
            st.rerun()
        else:
            st.session_state.ingredients = edited

        # 재료 직접 추가
        with st.expander("➕ 재료 직접 추가"):
            c1, c2, c3 = st.columns([3, 2, 1])
            with c1:
                new_name = st.text_input("재료명", key="add_name")
            with c2:
                new_qty = st.text_input("수량", key="add_qty")
            with c3:
                st.write("")
                st.write("")
                if st.button("추가", use_container_width=True):
                    if new_name.strip():
                        st.session_state.ingredients.append(
                            {"name": new_name.strip(), "quantity": new_qty.strip(), "status": "보통"}
                        )
                        st.rerun()

        st.info("💡 재료 확인 후 사이드바의 [🍳 레시피 생성]으로 이동하세요.")


# ── 페이지 2: 레시피 생성 ─────────────────────────────────
def page_recipe():
    st.header("🍳 레시피 생성")

    if not st.session_state.ingredients:
        st.warning("먼저 사이드바의 [🔍 재료 인식]에서 재료를 인식해주세요.")
        return

    # 현재 재료 요약
    with st.expander(f"현재 재료 목록 ({len(st.session_state.ingredients)}개)", expanded=False):
        cols = st.columns(4)
        for i, item in enumerate(st.session_state.ingredients):
            with cols[i % 4]:
                qty = f" ({item['quantity']})" if item.get("quantity") else ""
                st.markdown(f"• **{item['name']}**{qty}")

    # 식단 필터
    st.subheader("식단 필터 (선택)")
    filters = st.multiselect(
        "적용할 식단 조건을 선택하세요",
        ["채식", "비건", "글루텐 프리", "저염식", "저칼로리", "고단백"],
        label_visibility="collapsed",
    )

    if st.button("🤖 레시피 생성", type="primary", use_container_width=True):
        with st.spinner("AI가 레시피를 생성 중입니다... (최대 30초)"):
            try:
                recipes, model = generate_recipes(st.session_state.ingredients, filters)
                st.session_state.recipes = recipes
                if recipes:
                    st.success(f"✅ {len(recipes)}개 레시피 생성 완료")
                    st.caption(f"사용 모델: `{model}`")
                else:
                    st.error("레시피 파싱에 실패했습니다. 다시 시도해주세요.")
            except Exception as e:
                st.error(str(e))

    # 레시피 카드
    if st.session_state.recipes:
        st.divider()
        st.subheader(f"추천 레시피 ({len(st.session_state.recipes)}개)")

        for idx, recipe in enumerate(st.session_state.recipes):
            with st.container(border=True):
                st.markdown(f"### 🍽️ {recipe.get('name', f'레시피 {idx + 1}')}")

                m1, m2, m3 = st.columns(3)
                m1.metric("난이도", recipe.get("difficulty", "-"))
                m2.metric("조리시간", recipe.get("time", "-"))
                m3.metric("칼로리", recipe.get("calories", "-"))

                col_l, col_r = st.columns(2)
                with col_l:
                    st.markdown("**필요 재료**")
                    for ing in recipe.get("ingredients", []):
                        st.markdown(f"- {ing}")
                with col_r:
                    st.markdown("**조리 순서**")
                    for step_i, step in enumerate(recipe.get("steps", []), 1):
                        st.markdown(f"{step_i}. {step}")

                # 저장 버튼
                if st.session_state.logged_in:
                    if st.button(f"💾 저장", key=f"save_{idx}", use_container_width=True):
                        user = st.session_state.logged_in
                        to_save = dict(recipe)
                        to_save["saved_at"] = datetime.now().strftime("%Y-%m-%d %H:%M")
                        st.session_state.users[user]["saved_recipes"].append(to_save)
                        st.session_state.users[user]["cook_count"] += 1
                        st.success("✅ 레시피가 저장되었습니다!")
                else:
                    st.info("💡 레시피를 저장하려면 [👤 나의 레시피] 탭에서 로그인하세요.")


# ── 페이지 3: 나의 레시피 (사용자 프로필) ────────────────
def page_profile():
    st.header("👤 나의 레시피")

    if not st.session_state.logged_in:
        tab_login, tab_signup = st.tabs(["🔑 로그인", "📝 회원가입"])

        with tab_login:
            st.subheader("로그인")
            username = st.text_input("아이디", key="login_user")
            password = st.text_input("비밀번호", type="password", key="login_pass")
            if st.button("로그인", type="primary", use_container_width=True):
                users = st.session_state.users
                if username in users and users[username]["password"] == password:
                    st.session_state.logged_in = username
                    st.success(f"환영합니다, {username}님!")
                    st.rerun()
                else:
                    st.error("아이디 또는 비밀번호가 올바르지 않습니다.")
            st.caption("테스트 계정: **demo** / **demo123**")

        with tab_signup:
            st.subheader("회원가입")
            new_user = st.text_input("아이디", key="reg_user")
            new_pass = st.text_input("비밀번호", type="password", key="reg_pass")
            new_pass2 = st.text_input("비밀번호 확인", type="password", key="reg_pass2")
            if st.button("회원가입", type="primary", use_container_width=True):
                if not new_user.strip() or not new_pass:
                    st.error("아이디와 비밀번호를 입력해주세요.")
                elif new_user in st.session_state.users:
                    st.error("이미 사용 중인 아이디입니다.")
                elif new_pass != new_pass2:
                    st.error("비밀번호가 일치하지 않습니다.")
                elif len(new_pass) < 4:
                    st.error("비밀번호는 4자 이상이어야 합니다.")
                else:
                    st.session_state.users[new_user] = {
                        "password": new_pass,
                        "saved_recipes": [],
                        "cook_count": 0,
                    }
                    st.success("✅ 회원가입 성공! 로그인 탭에서 로그인하세요.")

    else:
        user = st.session_state.logged_in
        user_data = st.session_state.users[user]

        col_title, col_logout = st.columns([4, 1])
        with col_title:
            st.subheader(f"안녕하세요, **{user}**님!")
        with col_logout:
            if st.button("로그아웃", use_container_width=True):
                st.session_state.logged_in = None
                st.rerun()

        # 대시보드 통계
        st.divider()
        st.subheader("대시보드")
        c1, c2, c3 = st.columns(3)
        c1.metric("저장된 레시피", len(user_data["saved_recipes"]), "개")
        c2.metric("요리 횟수", user_data["cook_count"], "회")
        c3.metric("즐겨찾기", len(user_data["saved_recipes"]), "개")

        st.divider()

        # 저장된 레시피 목록
        if user_data["saved_recipes"]:
            st.subheader(f"저장된 레시피 ({len(user_data['saved_recipes'])}개)")
            to_delete_idx = None
            for idx, recipe in enumerate(user_data["saved_recipes"]):
                with st.container(border=True):
                    col_name, col_del = st.columns([5, 1])
                    with col_name:
                        st.markdown(f"### 🍽️ {recipe.get('name', f'레시피 {idx+1}')}")
                        st.caption(f"저장일시: {recipe.get('saved_at', '-')}")
                    with col_del:
                        if st.button("삭제", key=f"del_saved_{idx}", use_container_width=True):
                            to_delete_idx = idx

                    m1, m2, m3 = st.columns(3)
                    m1.metric("난이도", recipe.get("difficulty", "-"))
                    m2.metric("조리시간", recipe.get("time", "-"))
                    m3.metric("칼로리", recipe.get("calories", "-"))

                    with st.expander("조리 순서 보기"):
                        for step_i, step in enumerate(recipe.get("steps", []), 1):
                            st.markdown(f"{step_i}. {step}")

            if to_delete_idx is not None:
                user_data["saved_recipes"].pop(to_delete_idx)
                st.rerun()
        else:
            st.info(
                "아직 저장된 레시피가 없습니다. "
                "[🍳 레시피 생성] 탭에서 레시피를 만들고 저장해보세요."
            )


# ── 메인 앱 ───────────────────────────────────────────────
def main():
    st.set_page_config(
        page_title="냉장고를 부탁해",
        page_icon="🧊",
        layout="wide",
        initial_sidebar_state="expanded",
    )

    # API 키 확인
    if not API_KEY:
        st.error(
            "❌ OPENROUTER_API_KEY가 설정되지 않았습니다.\n\n"
            ".env 파일에 `OPENROUTER_API_KEY=sk-or-v1-...` 형식으로 저장했는지 확인해주세요."
        )
        st.stop()

    init_session()

    # 사이드바
    with st.sidebar:
        st.title("🧊 냉장고를 부탁해")
        st.caption("FridgeChef — AI 맞춤형 레시피 추천")
        st.divider()

        page = st.radio(
            "메뉴 선택",
            ["🔍 재료 인식", "🍳 레시피 생성", "👤 나의 레시피"],
            label_visibility="collapsed",
        )

        st.divider()

        # 로그인 상태
        if st.session_state.logged_in:
            st.success(f"✅ {st.session_state.logged_in} 로그인 중")
        else:
            st.info("로그인하면 레시피를 저장할 수 있습니다.")

        # 현재 상태 요약
        if st.session_state.ingredients:
            st.caption(f"📋 인식된 재료: {len(st.session_state.ingredients)}개")
        if st.session_state.recipes:
            st.caption(f"🍽️ 생성된 레시피: {len(st.session_state.recipes)}개")

    # 페이지 라우팅
    if page == "🔍 재료 인식":
        page_recognize()
    elif page == "🍳 레시피 생성":
        page_recipe()
    elif page == "👤 나의 레시피":
        page_profile()


if __name__ == "__main__":
    main()
