"""Guard: the site must never contain an em dash again (client instruction, 2026-10).

Covers the literal character, the escaped \\u2014 form and the HTML entities.
Run with: python -m pytest tests/test_no_em_dashes.py
"""
import pathlib

import pytest

ROOT = pathlib.Path(__file__).resolve().parents[2]
TARGETS = [ROOT / "frontend" / "src", ROOT / "frontend" / "public", ROOT / "frontend" / "scripts",
           ROOT / "backend"]
SUFFIXES = {".js", ".mjs", ".jsx", ".ts", ".tsx", ".json", ".html", ".txt", ".xml", ".py", ".md", ".css"}
SKIP_DIRS = {"node_modules", "build", "__pycache__", ".git", "venv"}
FORBIDDEN = ("\u2014", "\\u2014", "&mdash;", "&#8212;", "&#x2014;")


def _files():
    for target in TARGETS:
        if not target.exists():
            continue
        for path in target.rglob("*"):
            if path.suffix.lower() not in SUFFIXES:
                continue
            if any(part in SKIP_DIRS for part in path.parts):
                continue
            if path.name == "test_no_em_dashes.py":
                continue
            yield path


@pytest.mark.parametrize("token", FORBIDDEN)
def test_no_em_dashes_anywhere(token):
    offenders = []
    for path in _files():
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for number, line in enumerate(text.splitlines(), 1):
            if token in line:
                offenders.append(f"{path.relative_to(ROOT)}:{number}: {line.strip()[:110]}")
    assert not offenders, (
        f"Em dash ({token}) found. The client requires none, now or ever. Use a comma, "
        "colon, period or parentheses instead:\n" + "\n".join(offenders[:25])
    )
