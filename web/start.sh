#!/usr/bin/env bash
# Launch the slopify web UI. Run ./start.sh (or double-click it on most Linux
# desktops). It hands off to start.mjs, which does everything else.
cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo
  echo "  Node.js isn't installed (or isn't on your PATH)."
  echo "  Install it from https://nodejs.org, then run this again."
  echo
  read -r -p "  Press Enter to close…" _
  exit 1
fi

exec node start.mjs
