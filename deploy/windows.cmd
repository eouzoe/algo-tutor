:: algo-tutor — Windows 空白機一行安裝（在「系統管理員」命令提示字元執行）
:: 步驟 1：裝 NixOS-WSL（會要求重開機一次的話，重開後再執行一次本行）
curl -L -o %TEMP%\nixos.wsl "https://github.com/nix-community/NixOS-WSL/releases/latest/download/nixos.wsl" && wsl --install --from-file %TEMP%\nixos.wsl

:: 步驟 2：進入 NixOS-WSL 終端後執行：
:: curl -fsSL https://raw.githubusercontent.com/eouzoe/algo-tutor/main/deploy/bootstrap.sh | sh
