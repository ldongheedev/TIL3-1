import sys
from pathlib import Path
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("pdf-to-txt")


@mcp.tool()
def pdf_to_txt(file_path: str) -> str:
    """PDF 파일을 텍스트로 변환합니다."""
    from pypdf import PdfReader

    path = Path(file_path)
    if not path.exists():
        return f"오류: 파일을 찾을 수 없습니다 — {file_path}"
    if path.suffix.lower() != ".pdf":
        return f"오류: PDF 파일이 아닙니다 — {file_path}"

    reader = PdfReader(str(path))
    pages = [page.extract_text() or "" for page in reader.pages]
    text = "\n\n".join(pages).strip()

    if not text:
        return "텍스트를 추출할 수 없습니다 (스캔된 이미지 PDF일 수 있습니다)."
    return text


if __name__ == "__main__":
    mcp.run(transport="stdio")
