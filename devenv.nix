{ pkgs, ... }: {
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

  enterShell = ''
    export PATH="$DEVENV_ROOT/.nu:$PATH"
    echo "algo-tutor 環境就緒"
    echo "  just mcp        — 啟動 MCP server"
    echo "  just diagnostic — 語法診斷"
    echo "  just today      — 每日入口"
  '';
}
