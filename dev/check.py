#!/usr/bin/env python3
"""
Site checker: run before you push to catch broken links, missing images,
files that are too big for the web, and [placeholder] text still on the site.

    python3 dev/check.py          (Windows: python dev\\check.py)

Exit code 0 = no broken links. Warnings never fail the check.
Uses only Python's standard library.
"""
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent.parent
SKIP_DIRS = {".git", "dev", "node_modules", ".vscode"}
BIG_FILE = 500 * 1024          # bytes; larger files slow the site down
WIDE_IMAGE = 2400              # px; nothing on the site is shown wider than this
ASSET_DIRS = ("assets", "image_carousel", "journals/images")

problems, warnings, used, placeholders = [], [], set(), []
# [Text in square brackets] that isn't a Markdown link: a placeholder you haven't filled in.
PLACEHOLDER = re.compile(r"(?<![!\]\w])\[([^\]\n]{2,200})\](?![(\[:])")


def rel(p):
    return p.relative_to(ROOT).as_posix()


def files(*patterns):
    for pattern in patterns:
        for p in sorted(ROOT.rglob(pattern)):
            if p.is_file() and not (set(p.relative_to(ROOT).parts) & SKIP_DIRS):
                yield p


def strip_comments(text, kind):
    """Blank out comments (and Markdown code), keeping line numbers the same."""
    keep_lines = lambda m: "\n" * m.group(0).count("\n")
    if kind in ("html", "md"):
        text = re.sub(r"<!--.*?-->", keep_lines, text, flags=re.S)
    if kind == "md":
        text = re.sub(r"```.*?```", keep_lines, text, flags=re.S)  # code blocks are examples, not links
        text = re.sub(r"`[^`\n]*`", "", text)
    if kind in ("css", "js"):
        text = re.sub(r"/\*.*?\*/", keep_lines, text, flags=re.S)
    return text


def check(ref, source, base_dir, what="link", missing_is_warning=False):
    """Record a local reference; complain if the file doesn't exist."""
    ref = ref.strip().strip("\"'")
    if (not ref or ref.startswith(("#", "mailto:", "tel:", "data:", "javascript:", "//"))
            or re.match(r"^[a-z][a-z0-9+.-]*:", ref, re.I) or "${" in ref or "{{" in ref):
        return
    path = unquote(urlsplit(ref).path)
    if not path:
        return
    target = (ROOT / path.lstrip("/")) if path.startswith("/") else (base_dir / path)
    try:
        target = target.resolve()
    except OSError:
        pass
    if target.is_dir():
        target = target / "index.html"
    if target.exists():
        used.add(target)
    else:
        msg = f"{rel(source)}: {what} to missing file '{ref}'"
        if path.lower().endswith(".pdf"):               # e.g. the resume PDF you haven't added yet
            missing_is_warning = True
        (warnings if missing_is_warning else problems).append(msg)


def image_size(p):
    """Width/height of a PNG or JPEG without extra libraries (None if unknown)."""
    data = p.read_bytes()[:256 * 1024]
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return int.from_bytes(data[16:20], "big"), int.from_bytes(data[20:24], "big")
    if data[:2] == b"\xff\xd8":
        i = 2
        while i + 9 < len(data):
            if data[i] != 0xFF:
                i += 1
                continue
            marker = data[i + 1]
            length = int.from_bytes(data[i + 2:i + 4], "big")
            if marker in (0xC0, 0xC1, 0xC2):
                return int.from_bytes(data[i + 7:i + 9], "big"), int.from_bytes(data[i + 5:i + 7], "big")
            i += 2 + length
    return None


def find_placeholders(text, source):
    for i, line in enumerate(text.split("\n"), 1):
        for m in PLACEHOLDER.finditer(line):
            placeholders.append(f"{rel(source)}, line {i}: [{m.group(1)}]")


# ---------- HTML pages ----------
for page in files("*.html"):
    text = strip_comments(page.read_text(encoding="utf-8", errors="replace"), "html")
    if not page.name.startswith("_"):            # _template.html is meant to have placeholders
        visible = re.sub(r"<(script|style|template)\b.*?</\1>", lambda m: "\n" * m.group(0).count("\n"), text, flags=re.S | re.I)
        find_placeholders(re.sub(r"<[^>]+>", " ", visible), page)
    for ref in re.findall(r'(?:src|href)\s*=\s*"([^"]*)"', text):
        check(ref, page, page.parent)
    # journal.html lists entries by file name inside <template>
    for block in re.findall(r"data-journal-index[^>]*>\s*<template>(.*?)</template>", text, flags=re.S):
        for name in block.split():
            check("journals/" + name.split("/")[-1], page, ROOT, what="journal entry")

# ---------- CSS ----------
for sheet in files("*.css"):
    text = strip_comments(sheet.read_text(encoding="utf-8", errors="replace"), "css")
    for ref in re.findall(r"url\(\s*([^)]+?)\s*\)", text):
        if not ref.strip("\"'").startswith("#"):
            check(ref, sheet, sheet.parent, what="image")

# ---------- JavaScript: data files it loads ----------
for script in files("*.js"):
    if "vendor" in script.parts:
        continue
    text = strip_comments(script.read_text(encoding="utf-8", errors="replace"), "js")
    for ref in re.findall(r'"((?:content|journals)/[\w./-]+\.md)"', text):
        check(ref, script, ROOT, what="data file")

# ---------- Markdown ----------
for doc in files("*.md"):
    if doc.parent == ROOT:                       # README.md etc. aren't shown on the site
        continue
    raw = doc.read_text(encoding="utf-8", errors="replace")
    text = strip_comments(raw, "md")
    find_placeholders(text, doc)
    in_content = doc.parts[-2] == "content"      # content/*.md: paths are from the site root
    base = ROOT if in_content else doc.parent    # journals/*.md: paths are from the .md file
    for key, ref in re.findall(r"^(logo|image|pdf)\s*:\s*(\S+)\s*$", text, flags=re.M | re.I):
        if ref.lower() != "none":
            # a missing PDF just hides the Download button, so it's only a warning
            check(ref, doc, ROOT, what=key.lower(), missing_is_warning=key.lower() == "pdf")
    for ref in re.findall(r"!?\[[^\]]*\]\(([^)\s]+)", text):
        check(ref, doc, base)

# ---------- File sizes and image dimensions ----------
for f in files("*"):
    size = f.stat().st_size
    if f.suffix.lower() in (".jpg", ".jpeg", ".png"):
        dims = image_size(f)
        if dims and dims[0] > WIDE_IMAGE:
            warnings.append(f"{rel(f)}: {dims[0]}x{dims[1]} px; resize to {WIDE_IMAGE} px wide or less")
    if size > BIG_FILE and f.suffix.lower() not in (".pdf",):
        warnings.append(f"{rel(f)}: {size // 1024} KB; aim for under {BIG_FILE // 1024} KB")
    if size > 95 * 1024 * 1024:
        problems.append(f"{rel(f)}: {size // (1024 * 1024)} MB; GitHub rejects files over 100 MB")

# ---------- Unused images (safe to delete) ----------
unused = []
for d in ASSET_DIRS:
    for f in files(d + "/**/*"):
        if f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".pdf") and f.resolve() not in used:
            unused.append(rel(f))

# ---------- Site setup ----------
if not (ROOT / ".github" / "workflows" / "deploy.yml").exists():
    warnings.append(".github/workflows/deploy.yml is missing: pushing won't publish the site")

# ---------- Report ----------
print(f"Checked {ROOT.name}/")
for title, items in (("Broken", problems), ("Warnings", warnings),
                     ("Placeholders still on the site (fill in or delete)", placeholders),
                     ("Not used anywhere (safe to delete?)", unused)):
    if items:
        print(f"\n{title}:")
        for item in items:
            print("  - " + item)
print("\n" + ("All links OK." if not problems else f"{len(problems)} broken link(s). Fix these before pushing."))
sys.exit(1 if problems else 0)
