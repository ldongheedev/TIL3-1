import os
import re
import sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
from pypdf import PdfReader

base = "C:/Users/403_29/Desktop/새 폴더/"
output_path = base + "기출문제.md"

files = sorted(f for f in os.listdir(base) if f.endswith(".pdf"))

def clean(text):
    text = text.replace("\xa0", " ").replace("\x01", "")
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()

results = []

for filename in files:
    path = base + filename
    reader = PdfReader(path)
    full_text = "\n".join(page.extract_text() or "" for page in reader.pages)

    # 페이지 번호 단독 줄을 특수 토큰으로 교체 (나중에 활용)
    # \n9\n → \nPAGE:9\n
    normalized = re.sub(r"\n(\d{1,3})\n", r"\nPAGE:\1\n", full_text)

    # 셀프 체크 위치 파악: 메인 vs (계속)
    all_matches = list(re.finditer(r"셀프\s*체크[^\n]*", normalized))
    if not all_matches:
        print(f"[없음] {filename}")
        continue

    # 각 셀프 체크 구역 추출:
    # PAGE:숫자 뒤에 셀프 체크(계속)이 오면 → 이어지는 구역
    # PAGE:숫자 뒤에 다른 내용이 오면 → 구역 종료
    sections = []
    i = 0
    while i < len(all_matches):
        m = all_matches[i]
        header_line = m.group()

        # (계속)은 독립 처리하지 않고 앞 섹션에 병합
        if "계속" in header_line:
            i += 1
            continue

        # 이 섹션의 끝: 다음 메인 셀프 체크 시작 OR 문서 끝
        # (계속) 포함해서 다 가져오기
        start = m.start()

        # 다음 "메인" 셀프 체크(계속 아닌 것) 위치
        next_main_start = len(normalized)
        for j in range(i + 1, len(all_matches)):
            if "계속" not in all_matches[j].group():
                next_main_start = all_matches[j].start()
                break

        chunk = normalized[start:next_main_start]

        # PAGE 토큰 이후에 셀프 체크 (계속)이 오면 PAGE 토큰만 제거하고 이어붙임
        # PAGE 토큰 이후에 다른 내용이 오면 → 거기서 자름
        # 전략: PAGE:숫자\n셀프 체크 (계속) → 줄바꿈으로 대체
        #       PAGE:숫자\n기타내용 → 종료 (그 이전까지만)
        def stop_at_non_selfcheck_page(text):
            parts = re.split(r"\nPAGE:\d+\n", text)
            collected = parts[0]
            for part in parts[1:]:
                if re.match(r"\s*셀프\s*체크", part):
                    # (계속) 헤더 제거하고 내용 추가
                    body = re.sub(r"^[^\n]*\n", "", part, count=1)
                    collected += "\n" + body
                else:
                    # 실습/기타 섹션 시작 → 종료
                    break
            return collected

        content = stop_at_non_selfcheck_page(chunk)
        sections.append(clean(content))
        i += 1

    print(f"[찾음] {filename} - {len(sections)}개 섹션")
    results.append((filename, sections))

# 마크다운 작성
lines = ["# 셀프 체크 기출문제\n"]

for filename, sections in results:
    title = os.path.splitext(filename)[0]
    lines.append(f"\n## {title}\n")
    for section in sections:
        lines.append("\n---\n")
        lines.append(section)
        lines.append("\n")

with open(output_path, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

print(f"\n완료: {output_path}")
