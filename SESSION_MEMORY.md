# algo-tutor 會話脈絡交接檔

> 2026-07-27，由 opencode 整理，供新會話無縫承接。

---

## 一、專案定位

algo-tutor = 三年（2026.08 → 2029.08）IOI 金牌訓練系統。
對象：一名高一升高二、因霸凌休學自學的台灣學生。目標 IOI 2029 金牌 → MIT。
訓練量：5000–15000 小時（3 年，可每日 12h）。方法論已整合 Um_nik / Yoneda / Errichto / USACO Guide / 台灣選拔賽制。

---

## 二、Qoder 會話 5 個歷史記錄（gstack-toolchain 專案）

5 個 session 全在 `~/.qoder/projects/-home-eouzoe-src-active-gstack-toolchain/`。

### b43d153b — 規劃前導（Jul 26 20:06–20:28）
- 「設計 AI 驅動 IOI 金牌培訓體系」
- 開場提問與 022eef9d 相同，助理回「5000–10000 小時夠…需要你補充：學生畫像、國家、人力、產品優先級、題庫」
- 用戶補上學生背景（高一、休學、霸凌、MIT 目標、台灣地區）
- **這是 022eef9d 的前置規劃**

### 022eef9d — 主建造 session（Jul 26 20:34 → Jul 27 18:02, ~21h）
- 「IOI 金牌 AI 自學計畫」 — 最大 session（2.6MB, 801 events, 198 user turns, 466 assistant turns）
- 助理先回覆「不要先蓋系統」→ 但之後大量建造：Bash 73 / Edit 62 / Write 17 / TaskUpdate 10 / Read 7 / TaskCreate 6
- **實際搭建了 algo-tutor 全部 15 個 commit**（init → methodology → session 狀態機 → 選題引擎 → report/diagnose → 對拍 → 課綱 18 單元 → USACO Guide → MCP server → doctor/CI → 雙窗口工作流 → WSL CI）
- 結束於 `/export`（匯出 `26-07-27ioi.txt`，419KB）+ `/exit`
- 最後 commit `tmqmqnlr`（ci: wsl-bootstrap-windows 轉正式守門）

### 35457da7 — 工具設定除錯（Jul 26 19:48–20:05）
- 「Test input」— 測試「你是什麼模型」，fix NVIDIA/opencode config（`nvidia/z-ai/glm-5.2`）
- 金鑰外洩警告、設定 `$NVIDIA_API_KEY`
- **支線，與主建造平行**

### 71ce98a4 — 失敗（Jul 26 22:08）
- codesec_telemetry 觸發 → Qoder API FORBIDDEN（code 112，付費牆）
- **空殼，無對話**

### 47b29d49 — 空殼（Jul 27 07:30）
- 僅 `/commands` + `/resume`
- **瞬開瞬關**

---

## 三、algo-tutor 系統狀態

### 3.1 架構總覽

```
mcp/server.ts   — 薄封裝 → 呼叫 nu -c "use .nu/forge.nu *; forge <cmd>"
.nu/forge.nu    — 37KB 核心邏輯（27 個 export def）
data/curriculum.json — 18 單元課綱，每單元含 name/goals/tutor/problems/exit/usaco
docs/           — methodology.md, error-taxonomy.md, schema.md
log/            — session.json（暫態）, concepts.jsonl, (attempts.jsonl 尚未建立)
sols/           — 學生答案歸檔
deploy/         — bootstrap.sh, vimrc, windows.cmd
work/           — sol.cpp（當前草稿）
```

### 3.2 forge.nu 命令列表

| 命令 | 說明 |
|------|------|
| `forge add` | 互動式補記解題 |
| `forge due` | 到期複習題 |
| `forge done` | 記錄複習結果 |
| `forge rec` | 識別訓練 |
| `forge stats` | 近況統計 |
| `forge start` | 開始解題（--mode speed 作了支援） |
| `forge status` | 狀態＋提示倒數 **已加 stale 偵測** |
| `forge hint` | 提示閘道（4 級階梯） |
| `forge code` | 進入實作階段 |
| `forge debug` | 進入除錯階段 |
| `forge finish` | 收尾寫日誌 **已加 --t-think/--t-code/--t-debug 覆寫** |
| `forge abort` | 放棄（不寫日誌） |
| `forge sync` | 同步 CF 題庫（~11k 題） |
| `forge profile` | 設定 rating |
| `forge pick` | 出題單（rating+200~400、排除已做、弱點加權） |
| `forge report` | 訓練週報 |
| `forge diagnose` | 診斷引導 |
| `forge gen` | LLM 生成對拍測資生成器 |
| `forge stress` | 對拍（正解 vs 暴力） |
| `forge learn` | 當前單元授課（接 USACO Guide） |
| `forge pass` | 通過單元推進課綱 |
| `forge anki` | 推線索卡到 Anki |
| `forge log` | 人類可讀解題日誌 |
| `forge concept` | 概念帳本操作 |
| `forge run` | 編譯執行 |
| `forge today` | 每日入口 |
| `forge fmt` | **教學安全化**（預設只 diff 不改原檔，--apply 才改） |
| `forge doctor` | 環境自檢 |

### 3.3 MCP 工具（mcp/server.ts，Typescript/Bun）

目前已暴露給 LLM harness（學生對話介面）：
today, lesson, pass_unit, start_problem, session_status, hint,
mark_coding, mark_debugging, finish_problem, abort_problem,
reviews_due, record_review, pick_problems, record_recognition,
stats, weekly_report, training_log, push_anki, read_code, run_code,
flag_concept, resolve_concept, list_concepts

**尚未暴露**：format_code, gen_tests, stress_test, forge vim 相關

---

## 四、本會話完成的工作（變更摘要）

### 4.1 已寫入 .nu/forge.nu

1. **forge fmt 教學安全化** — 預設 `--apply` 為 false，只 diff temp copy 不改原檔，確保 LLM 家教安全呼叫
2. **forge finish --t-think/--t-code/--t-debug** — stale session 補登用時間覆寫（避免卡 12h 的 session 算出荒謬的 t_think=720min）
3. **forge status stale 偵測** — 最後事件離現在 >= 4h 時印 ⚠ 警告，並提示 `just finish --t-think` 補登

### 4.2 已寫入 .gitignore

```
sols/*
!sols/*.cpp
!sols/*.h
!sols/README.md
*.swp
*.swo
```

### 4.3 二進位 + swap 已手動清除

- `rm sols/a001`（16KB binary，學生重編後又出現）
- `rm sols/.a001.cpp.swp`（vim swap）

### 4.4 vim 整合設計（尚未寫入 curriculum.json，規劃完成）

每單元 vim 漸進課程設計完成（共 18 單元），從 hjkl/模式概念一路到 vim 流體：
- U1: 四模式、hjkl、i/Esc、:wq、uu、存活卡
- U2: w/b/e/0/$/%、dd/yy/p、o/O、/pattern
- U3: v/V/Ctrl+v、yank/put 進階、:s/old/new
- U4: Ctrl+w s/v、:e/:b、ma/'a
- U5: netrw、gf、:find
- U6: qa...q/@a、"."重複
- U7: ""/"a-z registers、Ctrl+a/x
- U8: :make/quickfix、:cn/:cp
- U9: za/zo/zc/vimdiff
- U10: :r/:!、:!grep、filter through cmd
- U11: :s 正則、:normal
- U12: nnoremap 自訂、競程工作流 map
- U13: :mksession、session persistence
- U14: :!git diff/add、:Gdiff
- U15: ctags/Ctrl+]/Ctrl+o
- U16: vim as IDE、:make + errorformat
- U17: :bufdo/:argdo、vimdiff for contest debugging
- U18: 完全 vim 主義者 — 速度目標 20% 提升、vim 是第二語言

設計原則：
- 第 1 課就強制全 vim，不准開別的文字編輯器
- deploy/vimrc 逐行解說
- forge fmt 的 diff = vim 縮進教材
- 鞏固 vim 肌肉記憶等同於鞏固 C++ 肌肉記憶

---

## 五、場上真實狗食狀態（最優先處理）

### 5.1 Stuck session.json

```json
{
  "problem": "zj/a001",
  "started": "2026-07-27T06:23:43+08:00",
  "phase": "code",
  "events": [{ "kind": "start" }, { "kind": "code", "at": "06:32" }],
  "hints": [], "denied": 0
}
```

- **根本原因**：學生寫完 sols/a001.cpp 後沒走 forge finish
- **實際工時**：思考 ~9min、coding ~5min（非 12h）
- **堵塞效果**：forge start 說「已有 session」擋下、forge pass 不認單元 1
- **解鎖方法**（新會話第一件事）：
  ```
  forge finish ac --t-think 9 --t-code 5 --err "" -s "EOF 多筆輸入 + hello world 模板。" -c "EOF 輸入模式用 while(cin>>)"
  ```

### 5.2 sols/a001.cpp 已存在（但未走 finish）

sols/a001.cpp 是 EOF string print 問題（ZeroJudge a001 哈囉）。
學生寫法 `cin >> s` 不對「可能含空白」但 test 涵蓋不到所以 AC（蠻過）。
模糊概念 `cin 與換行 - 以為要自己處理空白` 被記下但沒銷帳。

### 5.3 attempts.jsonl / recognition.jsonl 都不存在

Log 目錄只有 `concepts.jsonl`（1 筆）+ `session.json`（卡住）。
系統第一次真正解題還未完成。

### 5.4 curriculum.json 已修但未提交

Unit 1 tutor 改為強調「有概念≠有肌肉記憶、速練模式」

---

### 5.5 三階段學習模型、前置知識 DAG、檔案模板（2026-07-28 改造）

```json
# curriculum.json 新結構（每個單元新增）
{
  "prerequisites": [unit_id, ...],     # DAG
  "prerequisite_topics": [...],        # os-taxonomy 風格微知識點
  "phase_learn": {                     # 三階段的「學習」
    "topics": [{                       # 逐個語法點
      "id", "name", "description",
      "syntax_template", "vim_drills", "evidence"
    }],
    "follow_along": ["work/templates/uX_*.cpp"]
  },
  "phase_practice": {                  # 三階段的「練習」
    "syntax_ref_provided": false,
    "problems": [...]
  },
  "phase_exam": {                      # 三階段的「考試」
    "problems": [...]
  },
  "knowledge_map": [...]               # 單元內知識節點
}
```

**已改造單元**：1–4 完整新結構，5–18 加入 `prerequisites` + `prerequisite_topics`。

**forge.today 升級**：顯示當前階段（learn/practice/exam/complete）、前置未完成鏈、語法點清單。

**forge.start —phase 參數**：learn / practice / exam，影響 stuck_min（learn=無提示，practice=30, exam=60）。

**forge.learn 升級**：教 prompt 包含 phase_learn 的語法模板與跟打練習指引，LLM 家教須逐一教、學生跟著打。

**work/templates/** 建立：u1_skeleton.cpp, u1_hello.cpp, u2_if.cpp, u2_loop.cpp, u3_func.cpp, u4_array.cpp。

### 5.6 概念索引 + drill 結構化系統（2026-07-28 下午）

核心改造：把教學從 **prompt 驅動** 改為 **結構驅動**。

**data/concept-index.json** — 15 個概念（units 1-4），每個概念有：
- `syntax_template`：語法模板
- `prerequisites`：前置概念（DAG）
- `drills[]`：三種 drill 類型（learn=跟打 / fill=填空 / problem=題目）

**新增指令：**
- `forge concept index [-q <query>]` — 搜尋/列出所有可 drill 概念
- `forge concept show <id>` — 顯示語法模板 + drill 清單（取代直接回答語法問題）
- `forge drill <id> --mode learn|fill|problem [--problem <id>]` — 啟動 drill session

**鐵律 5 新增（MCP server instructions + forge.learn prompt）：**
> 學生問「某某語法是什麼/怎麼寫」時，不得直接回答。
> 用 concept_index 搜尋 → concept_show 顯示語法模板 → drill_concept 讓學生動手練。
> 回答語法問題永遠等於害他。

**工作檔案追蹤**：session.json 現在記錄 `active_file` 和 `session_phase`（learn/practice/exam）。
`work/templates/u1~u4` 共 6 個跟打模板。
**docs/methodology.md** 新增〈三階段學習模型〉與〈知識圖譜〉章節。

### 5.7 待完成（下一會話）

1. **擴充 concept-index.json 到 units 5-18** — 目前只有 1-4，5-18 仍無概念分解
2. **補練習題** — Unit 3（函式/遞迴）和 Unit 8（複雜度/對拍）完全無題
3. **forge drill —mode exam** — 自動開空白考試 session
4. **forge.route** — 當學生答錯時自動路由到對應 drill（RAG on error type）


### P0 — 解卡 session + 補登 zj/a001

1. 跑 `forge finish ac --t-think 9 --t-code 5 ...`
2. 跑 `forge list_concepts` 確認「cin 與空白」還在
3. LLM 引導銷帳：出「讀一整行含空白」微練習（getline），學生寫對 → resolve
4. 寫 sols/a001b.cpp 展示 getline 變體
5. 跑 `forge pass` → U1 通過，進入 U2

### P0 — curriculum.json 加 vim field（18 單元）

設計已完成（見第四節），需實際寫入 data/curriculum.json 每個單元的 `vim` 鍵（key 為 `vim`，value 為字串陣列）。

### P1 — forge learn 含 vim

forge learn 的 prompt 需加入 vim 區塊，輸出當單元的 vim 學習目標，讓 LLM 家教一併教。

### P1 — forge vim 指令

```nu
forge vim            # 印出目前單元 vim 目標
forge vim -u 5        # 指定單元 5
# 未來：forge vim --drill "hjkl" 出交互練習
```

### P2 — MCP 暴露工具

- `format_code` (wraps forge fmt)
- `gen_tests` (wraps forge gen)
- `stress_test` (wraps forge stress)
- `vim_lesson` (wraps forge vim)

### P2 — forge.nu 測試 + CI

- 對 hint 閘道、pass 認定、pick 排除已做、間隔重複排程加 bun test 與 CI 守門

### P3 — sols/ 治理

- sols/a001 binary 和 .swp 又自動出現 → 持續清理 + jj file untrack
- forge finish 自動拷 work/sol.cpp → sols/<problem>.cpp + 連 attempt id

---

## 七、關鍵設計決策

1. **forge fmt 非破壞性**：預設不寫入原檔，純 diff 當教材。`--apply` 才正式套用。
2. **forge finish T 覆寫**：stale session 補登時強制指定 `--t-think 9` 等，不從時間戳推荒謬值。
3. **forge status stale 門檻**：最後事件 ≥ 4h 前 → 印 ⚠ 警告，引導補登或 abort。
4. **學習優先於系統**（由 qoder session 的第一次助理回應確定）：不要先蓋系統，前 6 個月用現成 Judge + 手動記錄 + LLM 輔助跑通流程再自動化。
5. **雙窗口工作流**：vim 打 code + LLM 對話，AI 代跑編譯執行，學生永遠不打終端指令。
6. **vim 從 U1 就強制**：不管多慢第一週全部用 vim，不准開別的文字編輯器。

---

## 八、檔案路徑快查

| 路徑 | 用途 |
|------|------|
| `~/src/active/algo-tutor/.nu/forge.nu` | 核心邏輯（37KB） |
| `~/src/active/algo-tutor/mcp/server.ts` | MCP server（151 行） |
| `~/src/active/algo-tutor/data/curriculum.json` | 18 單元課綱（vim field 待加） |
| `~/src/active/algo-tutor/log/session.json` | 卡住的 session |
| `~/src/active/algo-tutor/log/concepts.jsonl` | 模糊概念帳本（1 筆） |
| `~/src/active/algo-tutor/sols/a001.cpp` | 學生第一題答案 |
| `~/src/active/algo-tutor/docs/methodology.md` | 完整訓練方法論 |
| `~/src/active/algo-tutor/docs/error-taxonomy.md` | 錯誤分類 R/K/P/M/I/B/E/T |
| `~/src/active/algo-tutor/docs/schema.md` | 日誌 JSONL schema |
| `~/src/active/algo-tutor/deploy/vimrc` | 學生 vim 設定（已 deploy） |
| `~/src/active/algo-tutor/deploy/bootstrap.sh` | 一行安裝腳本 |
| `~/.qoder/projects/-home-eouzoe-src-active-gstack-toolchain/*.jsonl` | 5 個歷史會話原文 |
| `~/src/active/gstack-toolchain/26-07-27ioi.txt` | 主會話 TUI 渲染傾印（419KB） |