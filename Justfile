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

# Zellij 工作區（重連舊 session 或由 layout 新建）
workspace:
    ^bash deploy/workspace.sh

# 對拍：just stress sol.cpp brute.cpp
stress sol brute *args:
    {{_forge}} stress {{sol}} {{brute}} {{args}}

# ═══════════════════════════════════════════════════════════
# MCP Server（LLM 介面）
# ═══════════════════════════════════════════════════════════

# 啟動 MCP server（stdio 模式，供 codex/Claude Desktop 連接）
mcp:
    bun run mcp/index.ts

# 啟動 MCP server（HTTP 模式，供遠端連接）
mcp-http port:
    bun run mcp/index.ts http {{port}}

# 驗證 MCP server 是否正常運作
mcp-check:
    ^bash -c 'echo "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"server/discover\",\"params\":{}}" | bun run mcp/index.ts 2>/dev/null | python3 scripts/mcp_info.py'
    echo '---'
    ^bash -c 'echo "{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"tools/list\",\"params\":{}}" | bun run mcp/index.ts 2>/dev/null | python3 scripts/mcp_info.py'

# ═══════════════════════════════════════════════════════════
# 訓練系統（Training System）
# ═══════════════════════════════════════════════════════════

# 訓練系統狀態
training:
    just mcp-check

# 列出所有訓練工具
training-tools:
    ^bash -c 'echo "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\",\"params\":{}}" | bun run mcp/index.ts 2>/dev/null | python3 scripts/mcp_info.py --training

# ═══════════════════════════════════════════════════════════
# IOI 語法診斷
# ═══════════════════════════════════════════════════════════

# 診斷系統狀態
diagnostic:
    ^bash -c 'echo "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"diagnostic_status\",\"arguments\":{}}}" | bun run mcp/index.ts 2>/dev/null | python3 -c "import sys,json; lines=sys.stdin.readlines(); [print(json.loads(l)[\"result\"][\"content\"][0][\"text\"]) for l in reversed(lines) if l.strip().startswith(\"{\")]"'

# 診斷：取得第 N 題
diagnostic-problem n:
    ^bash -c 'echo "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"diagnostic_problem\",\"arguments\":{\"index\":{{n}}}}}" | bun run mcp/index.ts 2>/dev/null | python3 -c "import sys,json; lines=sys.stdin.readlines(); [print(json.loads(l)[\"result\"][\"content\"][0][\"text\"]) for l in reversed(lines) if l.strip().startswith(\"{\")]"'

# 診斷：檢查學生代碼
diagnostic-check problem_id:
    ^bash -c 'echo "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"diagnostic_check\",\"arguments\":{\"problem_id\":\"{{problem_id}}\"}}}" | bun run mcp/index.ts 2>/dev/null | python3 -c "import sys,json; lines=sys.stdin.readlines(); [print(json.loads(l)[\"result\"][\"content\"][0][\"text\"]) for l in reversed(lines) if l.strip().startswith(\"{\")]"'
