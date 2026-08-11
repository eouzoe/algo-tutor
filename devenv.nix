{ pkgs, config, ... }: {
  packages = with pkgs; [
    just
    git
    gcc
    gdb
    bun
    astyle
    python3
  ];

  dotenv.enable = false;

  scripts = {
    "check-env".exec = ''
      echo "gcc:     $(gcc --version 2>/dev/null | head -1)"
      echo "just:    $(just --version 2>/dev/null || echo 'missing')"
      echo "bun:     $(bun --version 2>/dev/null || echo 'missing')"
      echo "python3: $(python3 --version 2>/dev/null || echo 'missing')"
    '';
  };

  enterShell = ''
    echo "algo-tutor student shell"
    echo "  gcc:     $(gcc --version 2>/dev/null | head -1)"
    echo "  just:    $(just --version 2>/dev/null || echo 'missing')"
    echo "  bun:     $(bun --version 2>/dev/null || echo 'missing')"
    echo "  python3: $(python3 --version 2>/dev/null || echo 'missing')"
    echo ""
    echo "  just mcp        start MCP server"
    echo "  just diagnostic syntax diagnostic"
    echo "  just today      daily dashboard"
    echo ""
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
