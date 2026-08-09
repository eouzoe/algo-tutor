#!/usr/bin/env sh
# algo-tutor — one-command bootstrap for NixOS
# 用法: curl -fsSL https://raw.githubusercontent.com/eouzoe/algo-tutor/main/deploy/bootstrap.sh | sh
set -eu

REPO="https://github.com/eouzoe/algo-tutor"
DEST="${ALGO_TUTOR_DIR:-$HOME/algo-tutor}"

echo "==> 1/4 檢查 Nix"
if ! command -v nix >/dev/null 2>&1; then
  echo "安裝 Nix..."
  curl -fsSL https://install.determinate.systems/nix | sh -s -- install --no-confirm
  . /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh
fi

echo "==> 2/4 安裝 devenv"
if ! command -v devenv >/dev/null 2>&1; then
  nix profile install nixpkgs#devenv
fi

echo "==> 3/4 下載 algo-tutor"
if [ ! -d "$DEST" ]; then
  git clone "$REPO" "$DEST"
fi
cd "$DEST"

echo "==> 4/4 建構環境（devenv 會處理所有依賴）"
devenv shell -- echo "環境就緒"

echo ""
echo "完成！進入環境："
echo "  cd $DEST && devenv shell"
echo ""
echo "啟動 MCP server："
echo "  just mcp"
