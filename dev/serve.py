#!/usr/bin/env python3
"""
Preview server for the site (dev/preview.command and dev/preview.bat run this).

Like `python3 -m http.server`, with two changes so the browser can never show
you an old version of a file after you edit it:
  - every response says "don't keep a copy" (Cache-Control: no-store)
  - in each page, links to .css and .js files get the file's last-saved time
    added (css/resume.css?v=1795228065), so an edited file has a new address
    and the browser has to download it, even if it kept an old copy before.
The live site gets the same treatment from .github/workflows/deploy.yml.

    python3 dev/serve.py          (port 8000)
    python3 dev/serve.py 8080     (another port)
"""
import functools
import http.server
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

# src="js/resume.js" / href="/css/style.css": local .css/.js files only (no "https:")
ASSET = re.compile(r'((?:src|href)=")([^":?#]+\.(?:css|js))(")')


class PreviewHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def guess_type(self, path):
        kind = super().guess_type(path)
        if kind.startswith("text/") or kind in ("application/javascript", "application/json"):
            kind += "; charset=utf-8"
        return kind

    def do_GET(self):
        path = Path(self.translate_path(self.path))
        if path.is_dir() and self.path.split("?")[0].endswith("/"):
            path = path / "index.html"
        if path.suffix != ".html" or not path.is_file():
            return super().do_GET()

        def stamp(m):
            ref = m.group(2)
            target = ROOT / ref.lstrip("/") if ref.startswith("/") else path.parent / ref
            try:
                version = int(os.stat(target).st_mtime)
            except OSError:
                return m.group(0)            # missing file: leave the link alone
            return f"{m.group(1)}{ref}?v={version}{m.group(3)}"

        body = ASSET.sub(stamp, path.read_text(encoding="utf-8")).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


handler = functools.partial(PreviewHandler, directory=str(ROOT))
try:
    server = http.server.ThreadingHTTPServer(("", PORT), handler)
except OSError:
    sys.exit(f"Port {PORT} is busy. Close the other preview window, or run: python3 dev/serve.py {PORT + 1}")
print(f"  Serving {ROOT}")
with server:
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
