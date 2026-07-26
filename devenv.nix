{ pkgs, ... }: {
  packages = with pkgs; [
    nushell just ripgrep fd git jujutsu gcc gdb bun
  ];

  dotenv.enable = false;

  enterShell = ''
    export PATH="$DEVENV_ROOT/.nu:$PATH"
  '';
}
