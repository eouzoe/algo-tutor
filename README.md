# algo-learn

個人算法學習輔助系統。LLM 驅動的對話式教學，搭配 MCP 工具與認知引擎。

## 快速開始

```bash
# 安裝依賴
cd mcp && bun install && cd ..

# 啟動 MCP server（stdio）
just mcp

# 啟動 MCP server（HTTP）
just mcp-http 3000
```

## 結構

```
mcp/                    MCP server（LLM 介面）
├── server.ts           核心 server（transport-agnostic）
├── tools/              工具註冊
├── transport/          傳輸層（stdio + HTTP）
└── forge.ts            CLI 橋接

packages/engine/        認知引擎（BKT / IRT / FSRS / KST）

data/
├── curriculum.json     課綱定義
├── beyond-ioi-toolkit/ 進階工具包
└── training/           訓練系統數據
    ├── schema/         Layer 1: 結構定義
    └── seeds/          Layer 2: 種子數據

.nu/forge.nu            CLI 核心邏輯
Justfile                指令包裝
```

## 兩個介面

**學生：LLM 對話（MCP）**
- 直接跟 LLM 對話，不打終端指令
- 工具呼叫、計時、日誌全在 server 端

**教練：終端（just）**
- `just today` / `log` / `stats` / `report` 等人類可讀視圖

## MCP 工具

| 類別 | 工具 |
|---|---|
| 訓練 | `training_pattern` `training_analysis` `training_check` `training_patterns` `training_stats` |
| 診斷 | `diagnostic_problem` `diagnostic_check` `diagnostic_result` `diagnostic_status` |
| 課綱 | `lesson` `pass_unit` `concept_index` `concept_show` `drill_concept` |
| 練習 | `start_problem` `hint` `finish_problem` `pick_problems` `reviews_due` |
| 引擎 | `engine_bkt_update` `engine_irt_estimate` `engine_fsrs_retrievability` `engine_kst_fringe` |
| 工具包 | `toolkit_list` `toolkit_show` `toolkit_lesson` |
| 代碼 | `read_code` `run_code` `benchmark_code` |

## 原則

- 日誌是地基
- 工具跟著需求長，不預先蓋系統
- 結構（schema）與數據（seeds）分離
