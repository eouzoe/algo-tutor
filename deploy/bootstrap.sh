#!/usr/bin/env sh
# algo-tutor — one-command bootstrap for NixOS / NixOS-WSL
# 用法: curl -fsSL https://raw.githubusercontent.com/eouzoe/algo-tutor/main/deploy/bootstrap.sh | sh
set -eu

REPO="https://github.com/eouzoe/algo-tutor"
DEST="${ALGO_TUTOR_DIR:-$HOME/algo-tutor}"
REPO_DIR="$DEST"

echo "==> 1/5 檢查 Nix"
if ! command -v nix >/dev/null 2>&1; then
  echo "安裝 Nix..."
  curl -fsSL https://install.determinate.systems/nix | sh -s -- install --no-confirm
  # shellcheck disable=SC1091
  . /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh
fi
echo "  Nix OK"

echo "==> 2/5 檢查 devenv"
if ! command -v devenv >/dev/null 2>&1; then
  nix profile install nixpkgs#devenv
fi
echo "  devenv OK"

echo "==> 3/5 下載 algo-tutor"
if [ ! -d "$REPO_DIR" ]; then
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
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
