#!/usr/bin/env sh
set -eu

REPO="https://github.com/eouzoe/algo-tutor"
DEST="${ALGO_TUTOR_DIR:-$HOME/algo-tutor}"

if ! command -v nix >/dev/null 2>&1; then
  echo "Installing Nix..."
  curl -fsSL https://install.determinate.systems/nix | sh -s -- install --no-confirm
  . /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh 2>/dev/null || true
fi

if ! command -v devenv >/dev/null 2>&1; then
  nix profile install nixpkgs#devenv
fi

if [ ! -d "$DEST" ]; then
  git clone "$REPO" "$DEST"
fi

cd "$DEST"
devenv allow
devenv shell
