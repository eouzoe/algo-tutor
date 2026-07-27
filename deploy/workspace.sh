#!/usr/bin/env bash
set -e
cd /home/eouzoe/src/active/ioi-forge
if devenv shell -- zellij list-sessions 2>/dev/null | grep -qF "ioi-forge"; then
  exec devenv shell -- zellij attach ioi-forge
else
  exec devenv shell -- zellij --new-session-with-layout deploy/workspace.kdl --session ioi-forge
fi