# algo-tutor

LLM 驅動的競程教練。學生在 vim 寫 code，LLM 透過 MCP 教學、出題、改題。

## 安裝

```bash
curl -fsSL https://raw.githubusercontent.com/eouzoe/algo-tutor/main/deploy/bootstrap.sh | sh
cd ~/algo-tutor && devenv shell
```

## 啟動

```bash
just mcp              # stdio 模式（連 Claude Code / Codex）
just mcp-http 3000    # HTTP 模式（遠端連接）
```

## 怎麼用

1. 学生在 vim 打開 `work/sol.cpp`
2. `:vert term` 打開終端，啟動 AI 工具（Claude Code / Codex）
3. 跟 LLM 對話，它會透過 MCP 工具教你、出題、改題

## 架構

```
mcp/              MCP server（LLM 介面，50 個工具）
packages/engine/   認知引擎（BKT / IRT / FSRS / KST）
data/             課綱、概念索引、工具包、訓練數據
deploy/           一鍵安裝腳本
```

## 要求

- Python 3.11+ 或 Node.js 20+
- Bun 1.3+
- Nix + devenv（推薦，一句指令搞定環境）
