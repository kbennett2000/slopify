#!/usr/bin/env bash
# macOS: double-click me in Finder to launch the slopify web UI.
# (Delegates to start.sh, which checks for Node and hands off to start.mjs.)
exec "$(dirname "$0")/start.sh"
