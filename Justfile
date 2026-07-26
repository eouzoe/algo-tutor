# ioi-forge — just 包裝（shell 為 nushell）
set shell := ["nu", "-c"]
set quiet := true

_forge := "use .nu/forge.nu *; forge"

# 每日入口：今天該做什麼（預設命令）
today:
    {{_forge}} today

# 當前單元上課（LLM 家教）
learn *args:
    {{_forge}} learn {{args}}

# 通過當前單元
pass *args:
    {{_forge}} pass {{args}}

# 今日題單（--spoil 顯示 tags）
pick *args:
    {{_forge}} pick {{args}}

# 開始解題 session
start problem *args:
    {{_forge}} start {{problem}} {{args}}

# session 狀態與提示倒數
status:
    {{_forge}} status

# 申請下一級提示（-n "卡點"）
hint *args:
    {{_forge}} hint {{args}}

# 進入實作階段
code:
    {{_forge}} code

# 進入除錯階段
debug:
    {{_forge}} debug

# 收尾寫日誌：just finish ac
finish result *args:
    {{_forge}} finish {{result}} {{args}}

# 放棄 session
abort:
    {{_forge}} abort

# 今日到期複習
due:
    {{_forge}} due

# 記錄複習：just done <id> [--failed]
done id *args:
    {{_forge}} done {{id}} {{args}}

# 識別訓練記錄
rec *args:
    {{_forge}} rec {{args}}

# 近況統計
stats *args:
    {{_forge}} stats {{args}}

# 訓練週報
report *args:
    {{_forge}} report {{args}}

# LLM 教練診斷
diagnose *args:
    {{_forge}} diagnose {{args}}

# 匯出線索卡為 Anki TSV
anki *args:
    {{_forge}} anki {{args}}

# 環境與功能自檢
doctor:
    {{_forge}} doctor

# 編譯執行 work/sol.cpp：just run -i "3 4"
run *args:
    {{_forge}} run {{args}}

# 概念帳本：just concept fuzzy "名稱" / just concept ok "名稱" / just concept
concept *args:
    {{_forge}} concept {{args}}

# 首次安裝：mcp 依賴 + 題庫 + 自檢
setup:
    cd mcp; ^bun install; cd ..; {{_forge}} sync; {{_forge}} doctor

# 同步 CF 題庫
sync:
    {{_forge}} sync

# 設定/查看 rating：just profile -r 1500
profile *args:
    {{_forge}} profile {{args}}

# LLM 生成測資生成器：just gen "n 1..1e5，n 個整數 1..1e9"
gen constraints *args:
    {{_forge}} gen "{{constraints}}" {{args}}

# 對拍：just stress sol.cpp brute.cpp
stress sol brute *args:
    {{_forge}} stress {{sol}} {{brute}} {{args}}
