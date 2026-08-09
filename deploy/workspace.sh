#!/usr/bin/env bash
set -e
cd "${ALGO_TUTOR_DIR:-$HOME/algo-tutor}"
SESSION="algo-tutor"
if devenv shell -- zellij list-sessions 2>/dev/null | grep -qF "$SESSION"; then
  exec devenv shell -- zellij attach "$SESSION"
else
  exec devenv shell -- zellij --new-session-with-layout deploy/workspace.kdl --session "$SESSION"
fi