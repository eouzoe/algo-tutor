#!/usr/bin/env sh
# ioi-forge — one-command bootstrap（gstack 模式）
# 用法: curl -fsSL https://raw.githubusercontent.com/<owner>/ioi-forge/main/deploy/bootstrap.sh | sh
#
# Windows 使用者：先照 README 裝好 NixOS-WSL，在 WSL 終端內執行本腳本。
# 流程：Nix → devenv → clone repo → bun 依賴 → CF 題庫 → forge doctor 驗收
set -eu

REPO_OWNER="${REPO_OWNER:-eouzoe}"
REPO="https://github.com/${REPO_OWNER}/ioi-forge"
DEST="${IOI_FORGE_DIR:-$HOME/ioi-forge}"

command -v curl >/dev/null 2>&1 || { echo "error: 需要 curl"; exit 1; }

echo "==> 1/5 Nix"
if ! command -v nix >/dev/null 2>&1; then
  curl -fsSL https://install.determinate.systems/nix | sh -s -- install --no-confirm
  # shellcheck disable=SC1091
  . /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh
fi

echo "==> 2/5 devenv"
if ! command -v devenv >/dev/null 2>&1; then
  nix profile install nixpkgs#devenv --extra-experimental-features "nix-command flakes"
fi

echo "==> 3/5 取得 ioi-forge"
if [ -d "$DEST/.git" ]; then
  git -C "$DEST" pull --ff-only
else
  nix shell nixpkgs#git --extra-experimental-features "nix-command flakes" -c \
    git clone "$REPO" "$DEST"
fi

echo "==> 4/5 依賴（devenv shell 內：bun install + 題庫同步）"
cd "$DEST"
devenv shell -- nu -c 'cd mcp; bun install; cd ..; use .nu/forge.nu *; try { forge sync } catch { print "CF 題庫同步失敗（可稍後 just sync）" }'

echo "==> 5/5 驗收：forge doctor"
devenv shell -- nu -c 'use .nu/forge.nu *; forge doctor'

cat <<'EOF'

完成。下一步：
1. 安裝學生 harness：bun install -g @openai/codex && codex login
2. 註冊 MCP（~/.codex/config.toml）：
     [mcp_servers.ioi-forge]
     command = "bun"
     args = ["<DEST>/mcp/server.ts"]
3. 開始：對 codex 說「今天做什麼」
EOF
