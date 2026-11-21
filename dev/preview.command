#!/bin/sh
# Mac: double-click this file to preview the site in your browser.
# Close the Terminal window (or press Ctrl+C) to stop.
cd "$(dirname "$0")/.." || exit 1
PORT=8000
echo ""
echo "  Previewing $(pwd)"
echo "  http://localhost:$PORT   (close this window to stop)"
echo ""
( sleep 1; open "http://localhost:$PORT/" ) &
exec python3 dev/serve.py "$PORT"
