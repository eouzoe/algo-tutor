{ pkgs, config, ... }: {
  packages = with pkgs; [
    # 核心工具
    nushell just ripgrep fd git jujutsu
    # 編譯器
    gcc gdb
    # JS/TS 運行時
    bun
    # 終端多開
    zellij
    # LLM harness
    codex
    # 編輯器
    neovim
    # 工具
    curl wget python3
  ];

  dotenv.enable = false;

  scripts = {
    "check-env".exec = ''
      echo "bun:      $(bun --version 2>/dev/null || echo 'missing')"
      echo "just:     $(just --version 2>/dev/null || echo 'missing')"
      echo "nushell:  $(nu --version 2>/dev/null || echo 'missing')"
      echo "codex:    $(codex --version 2>/dev/null || echo 'missing')"
      echo "bun:      $(bun --version 2>/dev/null || echo 'missing')"
    '';
  };

  enterShell = ''
    echo "┌─────────────────────────────────────────┐"
    echo "│  algo-tutor 個人算法學習系統              │"
    echo "│  bun:      $(bun --version 2>/dev/null || echo 'missing')"
    echo "│  just:     $(just --version 2>/dev/null || echo 'missing')"
    echo "│  nushell:  $(nu --version 2>/dev/null || echo 'missing')"
    echo "└─────────────────────────────────────────┘"
    echo ""
    echo "  just mcp        — 啟動 MCP server"
    echo "  just diagnostic — 語法診斷"
    echo "  just today      — 每日入口"
    echo ""
    export PATH="$DEVENV_ROOT/.nu:$PATH"
  '';
}
