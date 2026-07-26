# 日誌 schema

全部 JSONL、append-only。每行一個 JSON object，`kind` 區分類型。
ISO 日期字串（YYYY-MM-DD），可直接字典序比較。

## log/attempts.jsonl

### kind: "attempt" — 一次解題

| 欄位 | 型別 | 說明 |
|---|---|---|
| id | string | `YYYYMMDDHHMMSS`，由工具生成 |
| date | string | 解題日期 |
| problem | string | 題目座標，如 `cf/1850C`、`cses/1640`、`ioi/2023/soccer`，或 URL |
| rating | int\|null | 難度（CF rating 或換算） |
| topics | string[] | 主題標籤，小寫，如 `["dp", "tree"]` |
| mode | string | `solve`（深度練習）/ `speed` / `virtual` / `contest` / `upsolve` |
| result | string | `ac`（獨立一次過）/ `ac_hint`（靠提示 AC）/ `partial` / `fail` |
| score | int\|null | OI 部分分（0–100），僅 partial |
| hint_level | int | 0 無 / 1 方向 / 2 關鍵觀察 / 3 引理 / 4 題解 |
| t_think | int | 思考分鐘 |
| t_code | int | 實作分鐘 |
| t_debug | int | 除錯分鐘 |
| error_primary | string\|null | 主因：R/K/P/M/I/B/E/T（見 error-taxonomy.md），乾淨 AC 為 null |
| error_secondary | string\|null | 次因，可空 |
| summary | string | 費曼式解法摘要（≤3 句） |
| cue | string | 線索卡：「下次遇到 __ 就 __」——間隔重複的卡片 |
| needs_review | bool | 進複習排程：result 非乾淨 ac、或 hint>0、或主因 ∈ {K,P,M} |
| hints | array | 提示使用軌跡 `[{level, at}]`（session 工具寫入；`forge add` 手記可缺） |
| hint_denied | int | 閘道拒絕次數——提前要提示的審計痕跡，複盤時看自律 |

### kind: "review" — 一次空白重推複習

| 欄位 | 型別 | 說明 |
|---|---|---|
| ref | string | 對應 attempt 的 id |
| date | string | 複習日期 |
| recalled | bool | 是否成功從空白重推出解法 |

複習排程由工具推算，不存狀態：間隔 `[7, 30, 90]` 天，基準 = 最近一次成功複習日（無則 attempt 日），成功次數即當前階段，滿 3 次畢業。失敗不進階、立即重新到期。

## log/recognition.jsonl — 識別訓練

| 欄位 | 型別 | 說明 |
|---|---|---|
| date | string | 日期 |
| problem | string | 題目座標 |
| topic | string | 正解主題 |
| guess | string | 學生 5 分鐘內口述的方向 |
| correct | bool | 方向是否正確 |
| sec | int | 用時秒數 |

## log/session.json — 進行中的 session（暫態）

session 狀態機的工作檔，`forge finish/abort` 後即刪除，不進版本控制歷史分析。
欄位：problem/rating/topics/mode/stuck_min/started/phase(`think`→`code`→`debug`)/events[]/hints[]/denied。
時間全部由事件時間戳推算：t_think = start→code、t_code = code→debug、t_debug = debug→finish。

## 設計原則

- append-only：不改舊行，狀態全部由讀取時推算，天然可 diff、可 jj 追蹤
- 欄位寧缺勿濫：分析需要新維度時再加欄位，舊行缺欄位視為 null
- 這份 schema 是選題引擎與 LLM 診斷的唯一資料介面
