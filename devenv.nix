{ pkgs, config, ... }: {
  packages = with pkgs; [
    nushell just ripgrep fd git jujutsu
    gcc gdb
    bun
    zellij
    codex
    neovim
    curl wget python3
  ];

  dotenv.enable = false;

  scripts = {
    "check-env".exec = ''
      echo "bun:      $(bun --version 2>/dev/null || echo 'missing')"
      echo "just:     $(just --version 2>/dev/null || echo 'missing')"
      echo "nushell:  $(nu --version 2>/dev/null || echo 'missing')"
      echo "codex:    $(codex --version 2>/dev/null || echo 'missing')"
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
}
