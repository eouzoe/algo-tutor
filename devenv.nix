{ pkgs, config, ... }: {
  packages = with pkgs; [
    # shell & core
    nushell just git jujutsu
    # search & find
    ripgrep fd broot bat fzf
    # HTTP & JSON
    xh jaq jc
    # compiler
    gcc gdb
    # JS/TS runtime
    bun
    # editor
    neovim
    # misc
    curl wget python3
    # formatter & linter
    astyle cppcheck
  ];

  dotenv.enable = false;

  scripts = {
    "check-env".exec = ''
      echo "bun:      $(bun --version 2>/dev/null || echo 'missing')"
      echo "just:     $(just --version 2>/dev/null || echo 'missing')"
      echo "nushell:  $(nu --version 2>/dev/null || echo 'missing')"
    '';
  };

  enterShell = ''
    echo "algo-tutor dev shell"
    echo "  bun:     $(bun --version 2>/dev/null || echo 'missing')"
    echo "  just:    $(just --version 2>/dev/null || echo 'missing')"
    echo "  nushell: $(nu --version 2>/dev/null || echo 'missing')"
    echo ""
    echo "  just mcp        start MCP server"
    echo "  just diagnostic syntax diagnostic"
    echo "  just today      daily dashboard"
    echo ""
    export PATH="$DEVENV_ROOT/.nu:$PATH"
  '';

  tasks."engine:test" = {
    exec = "cd packages/engine && bun test";
    before = ["devenv:enterShell"];
  };

  tasks."mcp:check" = {
    exec = "echo '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"server/discover\",\"params\":{}}' | timeout 5 bun run mcp/index.ts 2>/dev/null | grep -q algo-tutor";
    before = ["devenv:enterShell"];
  };

  enterTest = ''
    just engine:test
    just mcp:check
  '';
}
