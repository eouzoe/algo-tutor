#!/usr/bin/env sh
# algo-tutor — one-command bootstrap for Ubuntu / NixOS / WSL
# Usage: curl -fsSL https://raw.githubusercontent.com/eouzoe/algo-tutor/main/deploy/bootstrap.sh | sh
set -eu

REPO="https://github.com/eouzoe/algo-tutor"
DEST="${ALGO_TUTOR_DIR:-$HOME/algo-tutor}"
REPO_DIR="$DEST"

echo "==> 1/5 檢查 Nix"
if ! command -v nix >/dev/null 2>&1; then
  echo "  安裝 Nix (Determinate Systems)..."
  curl -fsSL https://install.determinate.systems/nix | sh -s -- install --no-confirm
  # shellcheck disable=SC1091
  if [ -f /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh ]; then
    . /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh
  elif [ -f ~/.nix-profile/etc/profile.d/nix.sh ]; then
    . ~/.nix-profile/etc/profile.d/nix.sh
  fi
fi
echo "  Nix OK ($(nix --version))"

echo "==> 2/5 檢查 devenv"
if ! command -v devenv >/dev/null 2>&1; then
  echo "  安裝 devenv..."
  nix profile install nixpkgs#devenv
fi
echo "  devenv OK ($(devenv --version))"

echo "==> 3/5 下載 algo-tutor"
if [ ! -d "$REPO_DIR" ]; then
  echo "  克隆 $REPO..."
  git clone "$REPO" "$REPO_DIR"
else
  echo "  已存在，pull 最新"
  cd "$REPO_DIR" && git pull --ff-only
fi

echo "==> 4/5 進入 devenv 環境"
cd "$REPO_DIR"

echo "==> 5/5 驗證"
devenv shell -- just check-env

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  安裝完成！"
echo ""
echo "  進入環境："
echo "    cd $REPO_DIR && devenv shell"
echo ""
echo "  啟動 MCP server："
echo "    just mcp"
echo ""
echo "  開始診斷（初學者入口）："
echo "    just diagnostic"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
