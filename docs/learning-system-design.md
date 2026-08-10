# IOI Forge 學習系統設計方案 v2

## 總綱

本系統以「刻意練習 + 遺忘曲線 + 知識圖譜」為三大支柱，目標不是教會演算法，
**是在 IOI 國手選拔之前來得及把正確的程式直覺刻進神經裡。**

---

## 1. 核心資料結構 — 五層疊加模型

學習系統本質上在做一件事：**在不確定性之下估計學生的狀態，並決定下一步做什麼最有效率。**
每一層處理一個不同的不確定性來源。

### 層 1 — 知識概念圖（typed graph，取代純 DAG）

#### 節點

每個知識點是一個節點。粒度：可大可小（「整數加法」到「線段樹 lazy propagation」）。

```json
{
  "concepts": {
    "recursion": {
      "prerequisites": [
        {"group": "AND", "concepts": ["function-call", "return-value"]},
        {"group": "OR", "concepts": ["mathematical-induction", "call-stack"]}
      ],
      "reinforces": ["divide-and-conquer"],
      "generalizes-to": ["dynamic-programming"],
      "analogous-to": ["mathematical-induction"],
      "common_misconceptions": [
        {"id": "misconception-recursion-basecase-direction",
         "description": "base case 方向搞反",
         "confuses_with": ["iteration"]},
        {"id": "misconception-recursion-state-sharing",
         "description": "誤以為遞迴呼叫自動共享變數"]
      }
    }
  }
}
```

#### 邊類型

| 類型 | 意義 | 範例 |
|------|------|------|
| `prerequisites` | 前置條件 AND/OR 群組 | 見上 |
| `reinforces` | A 學好會讓 B 更穩 | 遞迴 → 分治 |
| `generalizes-to` | A 是 B 的特例 | 整數加法 → 多項式加法 |
| `analogous-to` | 結構相似，可類比 | 組合數 → DP |
| `confuses-with` | 常見混淆點 | `==` vs `=` |

**prerequisites 允許 AND/OR 群組** — 這解決了你說的「遞迴可以從數學歸納法或 call stack 兩條路通過去，不需要兩條都走完」。

#### DAG 保證

prerequisites 邊不可有環。non-prerequisite 邊（reinforces、analogous-to）不要求無環。

---

### 層 2 — BKT 機率掌握度（取代二元 locked/unlocked/mastered）

每個概念對每個學生存一組 BKT 參數（Corbett & Anderson 1995）。

#### 四參數 HMM

```
P(L₀) = 初始會的概率
P(T)  = 每次練習的學習轉移率
P(G)  = 不會但猜對的概率
P(S)  = 會但失手的概率
```

#### 更新規則（Bayesian）

```
先驗: P(Lₙ) = P(Lₙ₋₁) + (1 − P(Lₙ₋₁)) × P(T)
後驗: P(Lₙ | obs) = P(obs | Lₙ) × P(Lₙ) / P(obs)

其中 P(correct | mastered) = 1 − P(S)
     P(correct | not)      = P(G)
     P(wrong | mastered)   = P(S)
     P(wrong | not)        = 1 − P(G)
```

#### 掌握閾值（連續量表，不是三態跳躍）

| P 值區間 | 系統行為 |
|----------|----------|
| < 0.60 | 鎖住，不可進入 |
| 0.60–0.79 | learn phase（給語法提示） |
| 0.80–0.89 | practice phase（無提示） |
| 0.90–0.99 | exam phase（獨立解題） |
| ≥ 0.99 | mastered，可解鎖後續節點 |

**「猜對」跟「粗心錯」被 P(G) 和 P(S) 明確區分**，不會因為一次 AC 就當作 mastered，也不會因為一次 WA 就歸零。

#### 從 IRT 補充：Elbo / θ 能力值

BKT 只估計「這個概念會不會」，IRT 估計「學生整體能力 θ」跟「題目難度 b、鑑別度 a、猜對率 c」。

```python
P_correct(θ) = c + (1-c) / (1 + exp(-a(θ - b)))
```

兩者互補：BKT 給 per-concept 微觀掌握度，IRT 給跨概念巨觀能力值。跳級判斷用 IRT θ，補救判斷用 BKT P(L)。

---

### 層 3 — LLM-as-Judge 思考過程分析（從二元→多維證據）

#### 為什麼需要

BKT 只吃 correct/incorrect 二元訊號。思考過程能把這個升格成連續多維證據：

| 學生答對時的行為 | BKT 看到的 | LLM 看到的 |
|------------------|-----------|-----------|
| 直接說出正確判斷，邏輯乾淨 | correct | mastered (高信心) |
| 說出答案但繞了一大圈 | correct | 部分掌握，不穩定 |
| 直接說答案，無推導過程 | correct | 高度懷疑背過/矇到 |

#### LLM 判官設計原則

1. **只輸出 sub-skill 層級判斷**，不輸出 holistic mastery
   - 對 `recursion` 不問「懂不懂遞迴」
   - 改問「有沒有正確說出 base case」「有沒有正確描述呼叫如何縮小規模」
   - 每項對應到 concept graph 一個具體點或 common_pitfalls 裡一項

2. **原子級判斷項目**
   ```
   subskill: "recursion-basecase-identification"
   prompt: "學生是否有明確指出 'if (n == 0) return 1' 這樣的 base case？"
   output: probability [0.0, 1.0]
   ```

3. **LLM 本身需要校準**
   - 建立 500+ 案 human-labeled calibration set
   - 計算 Spearman ρ 與 human rater 的相關性（目標 ρ > 0.8）
   - 定期重新校準（換模型 / 換 prompt 時）
   - 用後續實際 exam 表現反過來檢驗判官當初的判斷

4. **判官 bias correction 層**
   - 記錄判官對每段思考的判斷
   - 累積追蹤判官是否系統性高估/低估某類學生
   - 在 feed BKT 之前先校正 bias

#### 邊界案例

**不是每次都有思考過程。** LLM 判斷只用於有 verbal trace 的 occasion。沒有 trace 時退回 BKT 純二元觀察值。LLM 判官是 bonus signal，不是 mandatory。

---

### 層 4 — FSRS 記憶排程（遺忘曲線）

#### 卡片粒度

系統中有四類卡片，各自獨立追蹤 DSR：

| 卡片類型 | 內容 | 何時建立 | 複習方式 | 生命週期 |
|---------|------|---------|---------|---------|
| 概念卡 concept card | 概念名稱 + 一句摘要 + 關鍵模板 | concept 首次 unlocked | 回憶：說出該概念的核心思路 | 長期（數年） |
| Drill 卡 drill card | drill 模板 + 正確答案 | drill 首次答錯或 phase 轉移時 | 重做該 drill 的變體 | 中期（至 concept mastered） |
| Problem 卡 problem card | 題號 + 自己寫的 solution 摘要 | 每次 exam 階段 AC 後 | 口述解法思路（不用重寫 code） | 長期 |
| Debug 卡 debug card | misconception 描述 + near-miss 範例 | misconception 首次觸發時 | 辨識 bug + 說出修正方法 | 至 misconception resolved |

每個 concept 對應 **至少 1 張概念卡 + N 張 drill 卡 + M 張 problem 卡**。FSRS 的 D/S/R 是 per-card，複習時從該 concept 關聯的卡片中選 R 最低的一張。

#### DSR 模型

```
D (Difficulty): 1–10，卡片固有難度（初始來自 IRT item difficulty 映射）
S (Stability):   記憶穩定度（天數）
R (Retrievability): 現在還能回憶的概率

遺忘曲線：R(t) = 1 / (1 + (t/S)^DECAY)
```

#### 整合思考過程品質

FSRS 原本只吃 recall success/fail + 自評 grade。加入 **verbal reasoning quality** 後：

- 學生複習時講得又快又乾淨 → R 其實比表面高 → S 可以設更大（下次更晚）
- 答對但猶豫、繞彎 → 記憶脆弱 → S 設小一點（下次更近）

#### 與 Anki 雙向同步

已有 `push_anki` tool。未來補 `pull_anki`（從 Anki 拉複習紀錄回 algo 模型）。

---

### 層 5 — KST Fringe Adaptive Assessment

基於 Knowledge Space Theory 的 fringe theorem（Doignon & Falmagne, Eppstein 2008）：

- **inner fringe**：學生剛掌握的概念（P 剛跨過 0.99 閾值的概念集合的最大元素）
- **outer fringe**：學生現在能學的概念（所有 prerequisites 已 mastered，但自己還未 mastered 的最小元素集合）

#### 出題演算法

```
1. 從 outer fringe 選出題候選
2. 對每個候選計算「資訊量」：I = |P(mastered) − 0.5|
   （越接近 0.5 越不確定，越有資訊量）
3. 從資訊量最大的概念中，選 IRT 鑑別度最高的題目
4. 連續正確題數作為 confidence-breadth 輔助訊號
   - 主線：BKT Bayesian update 是 P(L) 的唯一主要驅動
   - 輔助：連續 3+ 題答對且思考過程乾淨 → 可略為放大 P(L) update step（+10-20%）
   - 輔助：連續 5+ 題答對 → 可提前接觸下一 phase 的最後一級（不是直接跳 phase）
   - 永不反過來：不可因連續答錯就加速 P(L) 下降
5. 若答錯 → 診斷是 P(G) 猜錯還是 P(S) 粗心還是真不會
   （用 LLM 思考過程判斷）
```

#### 跳級判定

```
跳級條件：
  1. IRT θ 比該節點 standard threshold 高 2σ 以上
  2. 該節點的 AND-prerequisites 全部 mastered
  3. 至少跳過一個 intermediate node
  
不是靠「感覺他可以」，是靠數據。
```

---

### 五層資料流摘要

```
學生答題
  │
  ├─→ 觀察值：correct / incorrect ──→ BKT 更新 P(L) per concept
  │                                     │
  │                                     ├─→ 判定到哪個 phase（learn/practice/exam）
  │                                     └─→ 判定 prerequisites 是否解鎖
  │
  ├─→ IRT 更新 θ & 題目參數校準 ──→ 跳級判定 / 路線調整
  │
  ├─→ (optional) 思考過程 ──→ LLM 判官 sub-skill analysis
  │                           ├─→ BKT soft evidence
  │                           ├─→ misconception 節點觸發
  │                           └─→ FSRS 品質調節
  │
  └─→ FSRS 更新 D/S/R ──→ 安排未來複習時間
                            └─→ Anki 雙向同步
```

---

### 用這個架構回答你的具體問題

**Q: 判斷學生弱點依據什麼？**
A: 階層式往下鑽。先看 IRT θ 偏低 → 看哪個概念的 BKT P(L) 偏低 → 看 LLM 判官標記的哪個 misconception 節點活躍 → 看 FSRS 哪些卡的 R 下降最快。

**Q: 判斷能否跳級？**
A: IRT θ 比目標節點的 standard threshold 高 2σ + AND-prerequisites 已 mastered。

**Q: 學生狀態（疲勞/專注）如何量化？**
A: 透過 proxy signal：
- 連續 WA 但 LLM 判斷思考過程是對的 → 推測疲勞（P(S) 升高）
- 解題時間比平常長 2σ + 思考過程跳躍 → 推測狀態差
- 答題間隔過短、連續 easy 題答錯 → 推測疲勞
- 狀態差時自動降低建議難度、縮短 session、提示休息

**Q: 學生為什麼要先有前置知識？**
A: Ausubel 的 obliterative subsumption：沒有錨點的新知識會被異常快速地遺忘。跳節點真正的代價不是當下挫折，是「教了等於白教」。

---

### 研究參考

- Doignon & Falmagne (1985). Knowledge spaces. *Int. J. Man-Machine Studies*.
- Doignon & Falmagne (1999). *Knowledge Spaces.* Springer.
- Falmagne & Doignon (2011). *Learning Spaces.* Springer.
- Eppstein (2008). Learning sequences. arXiv:0803.4030.
- Corbett & Anderson (1995). Knowledge tracing. *User Modeling and User-Adapted Interaction*.
- Birnbaum (1968). 3PL in Lord & Novick. *Statistical Theories of Mental Test Scores*.
- Ye et al. (2022). FSRS. *ACM KDD*.
- Ye et al. (2023). FSRS optimization. *IEEE TKDE*.
- Ausubel (1960). The use of advance organizers. *J. Educational Psychology*.
- Ausubel (1968). *Educational Psychology: A Cognitive View.*
- Cheng et al. (2025). KnowLP: GraphRAG-Induced Dual Knowledge Structure Graphs. *AAAI 2025*.
- Falmagne et al. (2006). ALEKS: Assessment and LEarning in Knowledge Spaces.
- Baker et al. (2008). Context-aware BKT.
- Piech et al. (2015). Deep Knowledge Tracing. *NeurIPS*.
- Woolf et al. (2009). Affect-aware tutors. *Int. J. Learning Technology*.
- Burton (1981). Diagnosing bugs in a simple procedural skill.
- Fiedler (2026). Bias and Uncertainty in LLM-as-a-Judge Estimation.
- SURE: Self-Consistency and Selective Human Review for LLM grading (2026). *MDPI MAKE*.

---

---

## 2. 三階段教學引擎（Learn → Practice → Exam）

### 2.1 理論基礎

**Learn phase = worked example + self-explanation（Sweller CLT + Chen 2025）**

新手在「看範例」時學得比「自己解題」更好。因為解題時的 means-ends analysis 會佔滿工作記憶，沒空間建立 schema；看範例則能專注理解結構。加入引導式自解釋問題（不是「你懂了嗎」而是「這段 code 為什麼要檢查 n == 0？」）能顯著提升後續的 transfer 表現。

**Practice phase = fading + retrieval（Renkl & Atkinson + Bjork）**

當學生有一定基礎後，同一個 worked example 從「幫助」變成「干擾」（Kalyuga 的 expertise reversal effect）。這時要逐步移除 scaffolding（backward fading），讓學生越來越多的部分自己完成。同時引入 retrieval practice（不給 syntax 參考自己回憶）、少量變體（variation），製造 desirable difficulties。

**Exam phase = far transfer（Barnett & Ceci + Bjork）**

完全獨立，不給提示。題目結構與 learn phase 不同（不只換數字，換情境），測試學生是否真能辨識模式並調用工具。

**三階段對應 ICAP 框架（Chi）：**

（各理論的完整論述與文獻引用見 `cogsci-foundations.md`，含建構主義、ZPD、必要難度、認知負荷、遠遷移、SDT、DMN、自我效能、雙重編碼等 13 個基礎主題。）

| 階段 | ICAP | 學生行為 |
|------|------|---------|
| Learn | Passive → Constructive | 看範例 + 自解釋 |
| Practice | Active → Constructive | 逐步接手解題 |
| Exam | Interactive | 獨立應對新題 |

### 2.2 Learn Phase 結構

一個 concept 的 learn phase 由這幾步組成：

```
Step 0: Advance Organizer（Ausubel）
  └─ 一句話定位：「while 迴圈是『不確定跑幾次』時用的，
      跟 for 的差別在於 for 適合『知道跑幾次』。」

Step 1: Worked Example
  └─ 展示完整程式碼，逐行解釋
  └─ 穿插 self-explanation prompt：「你覺得為什麼這邊用 while 不用 for？」

Step 2: Syntax Template（跟打）
  └─ 給骨架，學生在 vim 照打
  └─ 例如 cses-1068.cpp 的註解骨架

Step 3: Mini Drill
  └─ 填空題：給 partially blank code，補齊
  └─ 或：修改一行 code 改變行為（預測輸出 → 執行程式驗證）
  └─ 3-5 題，即時回饋（F8 bench / run_code）
```

**Mini drill 的認知負荷設計：**
- 一次只改一個變數（不是整個 function 重寫）
- 範例 → 填空 → 自己寫的梯度
- 每個 drill 對應一個具體的 common_pitfall（如 `==` vs `=`）
- 若答錯，自動觸發 misconception node 的補救 drill

### 2.3 Practice Phase（Fading + Retrieval）

**Backward Fading 原則（Renkl & Atkinson 2003）：**

給一個完整問題，但有些步驟隱藏、有些展示。展示的步驟從「最後步驟先移除」——因為最後步驟通常最低 cognitive load，學生最應該先能自己完成。

```
Stage 1: 展示全部步驟（等同 learn phase 尾聲）
Stage 2: 隱藏最後 1 步
Stage 3: 隱藏最後 2 步
Stage 4: 只展示第 1 步（問題分析方向）
Stage 5: 完全空白（= exam phase）
```

**Fading trigger（Salden 2010）：**

前進：連續 2 題該隱藏步驟正確 → 前進一級
退回：該步驟答錯 → 退回一級（不回到起點）
Expertise reversal checkpoint：若學生明顯無聊／超前（解題時間 < 預期 50%）→ 直接跳過 2 級

**Self-explanation quality modifier：** Learn phase（Step 1）的自解釋品質（SS08 score）影響 fading speed。
- SS08 > 0.8（學生能 articulate 結構理解）→ advance 條件降為「連續 1 題正確」
- SS08 < 0.4（自解釋表面或錯誤）→ insert 一次 re-explanation prompt，未改善前不 advance
- 0.4 ≤ SS08 ≤ 0.8 → 無 modifier（使用預設 2 題條件）

**Retrieval Design：**
- 不給 syntax template（learn phase 才給）
- 不給常見錯誤提示
- 可以查自己的筆記（但系統不主動提供）

### 2.4 Exam Phase

- 完全空白 vim
- 不給任何提示（L0 hint 在 stuck_min 後才解鎖，通常 30-60min）
- 題目是變體：不只換數字/輸入，改變問題結構
  - 例如 Collatz → 不是給 n 求序列，而是給序列長度求 n
- 時間壓力：建議設 soft time limit（1.5x 預期解題時間）
- 通過條件：AC + 沒有超過 soft limit

### 2.5 Debug/Patch Drill（第四種內容類型）

不是所有學習都需要三階段。當 misconception 被觸發時，需要的是**對比修復**，不是完整教學。

#### 觸發條件

- LLM 判官在思考過程中偵測到某個 `common_misconception` 的活躍跡象
- 或：同一類型錯誤出現在 ≥ 2 題連續作答中（純 BKT 退行）

#### 結構

```
Step 0: 對比提示
  └─ 「你寫了 `if (n = 0)`，但這裡要的是 `==`。== 是比較，= 是賦值。
      看這兩個有什麼不同：」
  └─ 展示正確 vs 錯誤的並排對照

Step 1: Debug（識別錯誤）
  └─ 給一段含該 misconception 的 buggy code（近身錯例）
  └─ 問題：「哪裡錯了？」
  └─ 學生標出錯誤行 + 說明原因
  └─ 正確與否由 LLM 判官即時判斷

Step 2: Patch（修復錯誤）
  └─ 同一段 code，修正它
  └─ 編譯 + 跑通過才算 patch 成功

Step 3: Near-miss 變體（預防重複）
  └─ 同一個 misconception 的不同變形（2-3 題）
  └─ 例如：`if (n = 0)` → `while (i = 0)` → `for (int i = 0; i = n; i++)`
  └─ 全部 AC 才算 drill 完成
```

#### 與三階段的關係

- Debug/Patch drill **不取代**三階段，它是三階段的輔助介入
- 觸發後暫停當前 phase → 執行 drill → 回到中斷點
- BKT 更新時，drill 的答對視為 0.5 次 normal practice（權重減半，因為 drill 是近身提示下的表現）
- misconception 節點本身不參與 phase 系統（沒有 learn/practice/exam），只有 activated/resolved 兩種狀態

#### 設計原理

近身錯例（near-miss buggy code）的辨識和修復需要學生**主動對比**正確與錯誤的心智模型。這比單純「再看一次正確範例」產生更強烈的 schema 差異訊號（引導式發現的 desirable difficulty），同時因為 code 與學生自己剛寫的錯誤結構高度相似，修正後的遷移效果最佳（context-dependent memory 效應）。

### 2.6 Phase Transition Matrix

| 目前 | BKT P(L) < 0.6 | P(L) 0.6-0.79 | P(L) 0.8-0.89 | P(L) ≥ 0.9 | P(L) ≥ 0.99 + exam pass |
|------|----------------|---------------|---------------|------------|------------------------|
| Locked | — | → learn | → learn | → practice | → mastered |
| Learn | → locked | — | → practice | → practice | → mastered |
| Practice | → learn | → learn | — | → exam | → mastered |
| Exam | → practice | → practice | → review¹ | — | → mastered² |
| Mastered | — | — | — | — | 解鎖後續節點 |

**退回不是懲罰，是適應性決策。** 當 BKT P(L) 掉到下一區間，系統自動調整 phase，不靠學生自評也不靠感覺。

> **¹ review sub-phase**：Exam 階段的輕量補救。當 exam phase 學生 P(L) 從 ≥ 0.9 掉到 0.8-0.89 時，不退回完整 practice phase，改進入 review sub-phase：自動安排 3-5 題針對性 drill（Section 3.6 情境 D），打完 drill 後重新評估 P(L)。若 P(L) 回升 ≥ 0.9 → 回到 exam。若仍 < 0.9 → 退回 practice。review 沒有自己的 fading stage，直接使用上次 practice 的 stage 或 stage-1。
>
> **² mastered 判定**：exam pass 不直接設 P(L)=0.99。通過一題 exam variant 後，以 1.5× 權重執行 BKT update（無 scaffolding 的證據強度），後驗 P(L) ≥ 0.99 才判定 mastered。若後驗仍 < 0.99，留在 exam phase 做下一題變體。

#### P(L) 循環熔斷機制

同一概念在兩個 phase 之間反覆來回 ≥ 3 次（如 Practice → Learn → Practice → Learn），表示問題可能不在當前節點，而在底層 prerequisites。此時系統自動：

```
1. 凍結當前節點，insert 一個 prerequisite check session
2. 對所有 AND-prerequisites 跑 BKT「是否需要補救」診斷
3. 找出 P(L) 最低（< 0.8）的 prerequisites，自動往下鑽
4. 該概念的問題暫記為「P(L) 假性反覆 — 疑似 prerequisite 缺失」
```

熔斷後的 drill 不是完整三階段，而是針對性 mini-drill（3-5 題填空/修改），確認 prerequisite 真的穩了再回到原節點。

### 2.7 Exam IRT 獨立校準

Learn 和 Practice phase 有 scaffolding，學生答對時 IRT θ 的校正量應低於 raw performance 暗示的量。三個獨立校準線：

```
θ_learn   ← 只吃 learn phase 的作答（最低權重）
θ_practice ← 只吃 practice phase 的作答（中等權重，用 fading stage 作為 partial credit）
θ_exam    ← 只吃 exam phase 的作答（最高權重，無 scaffolding）
```

跳級判斷用 θ_exam（或 θ_practice 若無 exam data）。補救判斷用 θ_practice 和 BKT P(L)。不混合不同 phase 的 data，防止 scaffolding 階段的過估。

phase 轉移矩陣中的 P(L) 閾值以對應 phase 的 θ 為輔助參考：若 θ_exam 顯著高於 practice 預期，可加速轉移到 exam；若 θ_exam 顯著低於 practice 同人的表現，應回頭檢查 practice 階段是否有 scaffold dependency。

### 2.8 研究參考

- Sweller (1988). Cognitive load during problem solving. *Cognitive Science*.
- Sweller et al. (2019). Cognitive architecture and instructional design: 20 years later. *Educational Psychology Review*.
- Renkl & Atkinson (2003). Structuring the transition from example study to problem solving. *Educational Psychologist*.
- Kalyuga et al. (2003). The expertise reversal effect. *Educational Psychologist*.
- Kalyuga (2007). Expertise reversal effect and its implications. *Educational Psychology Review*.
- Chen (2025). Worked examples with explanation types in programming. *TOCE*.
- Chi & Wylie (2014). The ICAP framework. *Educational Psychologist*.
- Bjork & Bjork (1992, 2011). Desirable difficulties.
- Salden et al. (2010). Adaptive fading in tutored problem solving.
- Atkinson et al. (2000). Learning from examples: instructional principles. *Review of Educational Research*.

---

## 3. 微 Drill 系統（Micro Drill Engine）

### 3.1 設計原理

微 drill 是 learn phase 內 Step 3（Mini Drill）的完整規格，也是 debug/patch drill 的生成基礎。每個 drill 只測**一個原子子技能**（single sub-skill, single cognitive operation），維持最低 intrinsic load（Sweller 2019），同時透過對比與預測產生 desirable difficulty（Bjork）。

三種 drill 類型形成遞增的認知需求梯度：

| 類型 | 認知操作 | ICAP | 對應 sub-skill 類型 | BKT 權重 |
|------|---------|------|-------------------|---------|
| 填空 Fill-in | 回憶+補全 | Active | 語法、邊界條件、變數名 | 0.3 |
| 追蹤 Trace | 模擬執行 | Constructive | 變數流向、控制流程、狀態變遷 | 0.5 |
| 轉換 Transform | 結構映射 | Constructive | 表示法互換、迴圈⇔遞迴、介面適配 | 0.7 |

權重意義：drill 答對計為 `weight × 1 次 normal correct`（因為 drill 是 scaffolded 環境，低於獨立解題的證據強度）。

### 3.2 填空 Drill（Fill-in）

#### 模板

```
code_template: string          # 完整程式碼，含 {{blank_N}} 標記
blanks: [
  {
    id: "bl-1",
    expected: "n == 0",        # 正確答案（支援多種等價）
    alternatives: ["0 == n"],
    subskill: "recursion-basecase-condition",
    hint: "檢查停止條件"
    context_line: 3,           # 該行行號
  }
]
judge_prompt: "學生填入 {{student_answer}}，標準答案是 {{expected}}。
               功能等價且語法正確即算對。"
partial_credit: true           # LLM 判斷部分正確（如寫對表達式但少了 });
```

partial credit 到 BKT 的映射：
- 有 LLM judge：`prob_correct = adjusted_score`（同 4.6 soft evidence 公式）
- 無 LLM judge（純字串比對）：`prob_correct = 0.5 + 0.5 × (答對 blanks 數 / 總 blanks 數)`
- 結果餵入 BKT soft evidence：`P(obs | L) = prob_correct × (1 − P(S)) + (1 − prob_correct) × P(S)`
```

#### 生成規則

從概念節點自動生成填空 drill：

1. **語法填空**：從 Syntax Template 中刪除關鍵 token（條件式、變數名、返回值）
   - 難度 1：刪 1 個 token，有明確 hint（`// 填入 base case 條件`）
   - 難度 3：刪 2-3 個 token，無 hint
   - 難度 5：刪一整行關鍵邏輯，需從上下文推斷

2. **邊界填空**：從 common_misconceptions 中的典型錯誤位置設計 blank
   - 例：`recursion-basecase-direction` → 空出 base case 的方向判斷

3. **反饋設計**
   - 答對：簡短確認 + 自動前進下一題
   - 答錯：展示正確 vs 學生的並排對比（同 2.5 Step 0）
   - LLM 判斷 partial credit 時：給提示後再試一次（最多 2 次 retry）

### 3.3 追蹤 Drill（Trace）

#### 模板

```
trace_code: string             # 要追蹤的程式碼片
input: string                  # 給定的輸入（如果適用）
checkpoints: [
  {
    line: 7,                   # 在執行到這行時提問
    question: "此刻 n = ?",
    expected: "5"
    var: "n"                   # 追蹤的變數
  }
]
subskill: "recursion-call-stack-trace"
```

追蹤 drill 不要求學生寫完整程式——只要求**在心中模擬執行**並在關鍵點輸出變數狀態。這直接訓練工作記憶中的 mental model，比寫完整程式碼的 cognitive load 低很多。

#### 生成規則

1. **變數流向追蹤**
   - 在 assignment / update 後設 checkpoint
   - 學生回答該變數此刻的值
   - 難度 1：單一變數，線性流程
   - 難度 3：多變數，含條件分支
   - 難度 5：含遞迴 call stack 或巢狀迴圈

2. **控制流程追蹤**
   - 問「第幾次進入這個迴圈時條件成立？」
   - 或「這個函式呼叫會 return 什麼？」

3. **反饋設計**
   - 答錯時：**不直接給答案**，給推導提示（「注意第 3 行把 n 改成 n/2，但 current 還沒更新」）
   - 第二次錯：展示逐步執行過程（trace table）
   - 追蹤 drill 的 LLM 判斷只有「正確/錯誤」兩種（不設 partial credit，因為追蹤是確定的）

### 3.4 轉換 Drill（Transform）

#### 模板

```
source_form: "for"             # 原始表示法
target_form: "while"           # 目標表示法
source_code: string            # 要轉換的原始碼
constraints: [
  "不可改變功能行為",
  "不可使用 break"
]
subskill: "loop-representation-transform"
```

轉換 drill 要求學生在不改變功能的前提下，把一段程式從一種寫法改寫成另一種。這是最高階的 drill 類型，因為需要學生**同時理解兩種表示法的語意和對應關係**（cognitive flexibility）。

#### 生成規則

1. **表示法互換對**
   - `for` ↔ `while`
   - `if-else` 鏈 ↔ `switch`
   - `遞迴` ↔ `迭代`（需 stack 輔助時）
   - `array` ↔ `vector` 操作
   - `指標` ↔ `reference`（C++ specific）

2. **難度決定**
   - 難度 1：語法糖轉換（for → while，結構完全相同）
   - 難度 3：結構不同但單一對應（if-else 鏈 → switch）
   - 難度 5：需要額外資料結構（遞迴 → 迭代 + 自訂 stack）

3. **反饋設計**
   - LLM 判斷：源碼語意等價？語法正確？
   - 二元判斷：「轉換正確 / 不正確」
   - 不正確時：指出第一個不等價的位置（不直接給正確轉換）

#### 為什麼轉換 drill 值得比 trace 更高的 BKT 權重

轉換涉及**雙向 schema mapping**（Barnett & Ceci 2002 的 far transfer 要素）。學生需要在腦中同時維持兩種結構表徵並找到一對一對應。這比單向模擬執行（trace）需要更深的 understanding。但權重仍低於正常 practice 題（0.7 vs 1.0），因為題目本身有明確目標形式，不是開放解題。

### 3.5 Misconception-Specific Drill 生成

每個 `common_misconception` 節點（定義在概念圖中）自動對應一組 drill：

| Misconception 類型 | 填空變體 | 追蹤變體 | 轉換變體 | Near-miss buggy code |
|-------------------|---------|---------|---------|---------------------|
| `==` vs `=` | 空出條件運算子 | 追蹤錯誤賦值後的變數值 | 把正確 code 改成用 flag 變數 | `if (n = 0)` 系列 |
| off-by-one | 空出邊界值 `<` vs `<=` | 追蹤最後一次迭代的 i 值 | for→while 時保留原始語意 | `for(i=1; i<=n; i++)` 類 |
| base case 方向 | 空出 return 條件 | 追蹤遞迴到何時停止 | 遞迴→迭代時對應條件 | base case 互換 |
| 變數未初始化 | 空出宣告中的初始值 | 追蹤未初始化變數的值 | 改為建構子初始化 | `int sum;` 沒給 0 |

#### 生成引擎需求

```
function generate_misconception_drill(misconception_id, drill_type):
  1. 查 misconception 的 confuses_with, typical_location, buggy_examples
  2. 根據 drill_type 選擇對應模板：
     - "fill": 取出正確 code 中 misconception 相關行，設為 blank
     - "trace": 在 misconception 活躍處設 checkpoint
     - "transform": 要求轉換但避免 misconception 再犯
  3. 若 drill_type = "debug": 直接回傳 near-miss buggy code (2.5)
  4. 設定難度 = misconception 被觸發次數 + 1（但 max 5）
```

### 3.6 Drill 序列化排程

drill 不單獨出題，而是作為以下情境的**序列化元件**：

```
情境 A: Learn Phase Step 3（強制）
  └─ 概念節點首次學 → 必出 3 題填空 + 1 題追蹤
  └─ 全對才進 practice phase
  └─ 任一錯 → 追加 1 題同 subskill 的不同變體
  
情境 B: Phase 內鞏固（非強制，IRT θ 接近 threshold 時觸發）
  └─ 填空 2 題 + 追蹤 1 題
  └─ 不用全對，但錯的 drill 記錄到 misconceptioin node
  
情境 C: Misconception 補救（強制，2.5 的前置）
  └─ 填空 1 題（確認辨識）→ 追蹤 1 題（確認理解）→ debug/patch drill
  └─ 填空或追蹤錯 → 回到 2.5 Step 1，不跳級
  
情境 D: 複習（FSRS 排程）
  └─ 優先出學生之前錯過的 drill 變體
  └─ 如果上次是填空錯 → 出追蹤（不同認知操作，避免 surface memorization）
  └─ 如果上次是追蹤對但填空也對 → 出轉換（升級）
```

### 3.7 LLM 判官：Drill 專用判斷協議

drill 的 LLM 判斷比開放解題更簡單（scope 小），但需要更精確：

```
Drill 判官輸入:
  - drill 模板（含 expected、subskill）
  - 學生的回應（填空內容 / checkpoint 答案 / 轉換後的 code）
  - 該 subskill 的 evaluation rubric

Drill 判官輸出:
  {
    "correct": true/false,
    "partial_credit": 0.0-1.0,      # 僅填空可用
    "error_type": "syntax" | "semantic" | "incomplete" | "unrelated",
    "diagnostic": "學生寫了 ++i 但標準答案是 i++，語意等價，算對"
  }
```

填空 drill 的 LLM 調用是**最低成本**的：輸入 < 500 tokens、輸出 < 100 tokens。適合高頻呼叫。

### 3.8 Study Reference

- Chi & Wylie (2014). ICAP Framework. *Educational Psychologist*.
- Bjork & Bjork (1992, 2011). Desirable difficulties.
- Sweller et al. (2019). Cognitive architecture: 20 years later. *Educational Psychology Review*.
- Renkl & Atkinson (2003). From example study to problem solving. *Educational Psychologist*.
- Atkinson et al. (2000). Learning from examples. *Review of Educational Research*.
- Barnett & Ceci (2002). When and where do we apply what we learn? A taxonomy of far transfer. *Psychological Bulletin*.
- Chen (2025). Worked examples with explanation types in programming education. *TOCE*.

---

## 4. LLM-as-Judge 校準系統

### 4.1 定位：不是另一個 IRR 問題

LLM-as-Judge 在本系統中不是終極評估工具——它是 BKT 的**軟證據信號增強層**。BKT 本來只吃 correct/incorrect 二元訊號，LLM 判斷能把這個升格成多維證據，但前提是：

- 不可取代 human rater 做高 stakes 判斷（如選拔）
- 不可直接輸出 holistic mastery score
- 必須持續校準，假設 LLM 有系統性偏差（Fiedler 2026）

### 4.2 Sub-Skill Taxonomy

LLM 判官只判斷以下 8 類原子子技能：

| ID | 子技能類型 | 判斷問題 | 適用範圍 |
|----|-----------|---------|---------|
| SS01 | 語法正確性 | 「語法是否正確？」 | 填空、轉換、開放解題 |
| SS02 | 邊界辨識 | 「是否正確辨識邊界條件？」 | open-ended thinking |
| SS03 | 控制流程理解 | 「是否正確描述執行順序？」 | 追蹤、自解釋 |
| SS04 | 變數狀態追蹤 | 「變數值變化是否正確？」 | 追蹤 |
| SS05 | 演算法選擇理由 | 「選擇此方法的理由是否合理？」 | open-ended thinking |
| SS06 | 常見錯誤偵測 | 「是否認知到典型錯誤模式？」 | debug drill |
| SS07 | 語意等價性 | 「兩段程式碼是否功能等價？」 | 轉換 drill |
| SS08 | 自解釋品質 | 「學生的解釋是否反映結構理解？」 | learn phase self-explain |

每個判斷都是單一概率值 `[0.0, 1.0]` + 信心值 `confidence: [0.0, 1.0]`。

### 4.3 Prompt 模板系統

每個 SS 有自己的 prompt 模板。模板化強調三個原則：

1. **原子性**：一次只問一個問題
2. **可觀測性**：只問可以從文本中直接觀察到的，不問推論
3. **對比框架**：給正面和反面的範例（few-shot）

```
Template SS02 (邊界辨識):

System: 你是程式競賽思考過程的分析師。你的任務是判斷學生
        是否正確辨識了問題中的邊界條件。只輸出 JSON。

User: 
## 學生思考過程
{student_reasoning}

## Sub-skill
邊界辨識 (SS02)

## 判斷指引
- 學生是否有明確說出 inputs 的範圍？
- 學生是否有考慮 edge cases（n=0, n=1, 空陣列）？
- 學生是否有因為邊界錯誤而導致後續推導偏離？

## 正面範例
"n 最大到 10^9，所以不能用 O(n)，需要 O(log n)..."

## 反面範例
"就直接 for 迴圈跑一遍就好了"（當 n 可達 10^9）

## 輸出格式
{"score": 0.0-1.0, "confidence": 0.0-1.0, "evidence": "..."}
```

### 4.4 校準協議

#### 4.4.1 Human Labeled Calibration Set

建立 500+ 案 calibration set，每個案包含：

```
{
  "id": "CAL-0042",
  "student_reasoning": "我先把 n 讀進來，然後用 for 迴圈從 1 到 n...",
  "problem": "cses-1068",
  "sub_skills": [
    {"id": "SS02", "human_score": 0.3, "human_confidence": 0.9},
    {"id": "SS05", "human_score": 0.1, "human_confidence": 0.8}
  ],
  "llm_score": 0.7,         # LLM 原本的判斷
  "llm_confidence": 0.85,
  "adjusted_score": 0.4,    # bias correction 後
  "human_rater_id": "HR-03",
  "notes": "學生雖然提到 for 迴圈，但沒檢查 n > 0"
}
```

#### 4.4.2 統計校驗

| 指標 | 目標 | 計算方式 |
|------|------|---------|
| Spearman ρ | > 0.80 | LLM score 與 human score 的 rank correlation |
| Mean Absolute Error | < 0.15 | \|LLM - human\| 的平均 |
| Calibration Slope | 0.9-1.1 | logistic regression LLM→human 的斜率 |
| Confidence Calibration | ECE < 0.10 | Expected Calibration Error（信心 vs 實際正確率）|

Calibration set 每季或每次換模型時重新標註一批（50-100 案，含 20% 舊案追蹤 drift）。

#### 4.4.3 校準公式

```
adjusted_score = sigmoid( α × logit(llm_score) + β )

其中 α = calibration slope、β = calibration intercept
α 和 β 從 human labeled set 用 logistic regression 估計
初始 α = 1.0, β = 0.0（未校準時等於 identity）
```

### 4.5 Bias Correction Layer

LLM 判官有三種系統性偏差需校正：

#### 4.5.1 樂觀偏差（Leniency Bias）

LLM 傾向給出比 human rater 更高的分數，特別是對 verbose 的學生。

```
detection: 對每個學生，計算 Δ = mean(llm_score - human_score) over calibration subset
correction: 若 Δ > 0.1 → student_bias_correction = −Δ × 0.5

per-student 的 bias 從該生在 calibration subset 中的 overlap 估計。
若無 overlap → 用 global bias 代替。
```

#### 4.5.2 表面特徵偏差（Surface Feature Bias）

LLM 容易被學生回答的長度、術語使用、自信語氣影響（與實際能力無關）。

```
detection: 對 calibration set 做 regression：
  llm_score ~ human_score + response_length + term_count + confidence_markers
  若 response_length 或 term_count 的係數顯著（p < 0.05）→ 有 surface bias

correction: 從 adjusted_score 中減去 surface feature 的貢獻
```

#### 4.5.3 模型漂移（Model Drift）

換模型版本或 prompt 調整後，LLM 的判斷分布可能偏移。

```
detection: 
  - 每週抽 20 案重跑 LLM judge
  - 計算上周 vs 本週的 score distribution KL divergence
  - 若 KL > 0.05 → 觸發 drift alert

correction:
  - 重新跑 calibration regression（新 α, β）
  - 若持續 drift → 追加 50 案 human label
```

### 4.6 Integration with BKT

LLM 判斷作為 soft evidence 餵入 BKT，取代二元 correct/incorrect：

```
傳統 BKT evidence:
  P(obs | L) = 1 − P(S)  if correct
  P(obs | L) = P(S)       if incorrect

Soft evidence（LLM judge 介入後）:
  evidence_weight = llm_confidence × 0.5 + 0.5  # 0.5-1.0
  prob_correct   = adjusted_score
  
  P(obs | L) = prob_correct × (1 − P(S)) + (1 − prob_correct) × P(S)
  
解釋：LLM 說「有 80% 把握學生這題正確」，那就不是 100% correct
也不是 100% incorrect，而是 80/20 混合。
```

Soft evidence 只在 LLM judge 有信心（confidence ≥ 0.6）時啟用。低信心時退回原始二元訊號，不讓 LLM 的低品質判斷稀釋 BKT 的收斂性。

### 4.7 成本效益策略

LLM judge 不是每次答題都呼叫：

| 情境 | 呼叫策略 | 理由 |
|------|---------|------|
| 填空 drill | 必叫 | 成本低（< 500 tokens），需要 partial credit |
| 追蹤 drill | 必叫 | 需要判斷正確性（非二元比對） |
| 轉換 drill | 必叫 | 需要語意等價判斷 |
| Learn phase 自解釋 | 每次 | SS08 品質判斷影響 fading speed |
| Practice/Exam 解題 | 抽樣 30% | 成本高（完整思考過程），足夠校準 |
| 複習 drill | 不叫 | 已有之前錯題紀錄，成本效益低 |
| Debug drill Step 1 | 必叫 | 需要判斷錯誤識別正確性 |

抽樣策略：對 practice/exam 的每道題，以 30% 概率隨機決定是否叫 LLM judge。累積足夠樣本進行 calibration 和 bias correction 即可，不需要每題都 judge。

### 4.8 品質監控儀表板

持續追蹤：

```
1. Inter-rater reliability (LLM vs human): 滾動 100 案
2. Calibration slope drift: 每週
3. Per-student bias: 每學生累積 20+ LLM judge calls 後可算
4. Confidence calibration ECE: 每週
5. LLM judge call cost: 每日 token 用量
```

品質低於閾值時自動降級：退回二元 BKT，等待重新校準後再啟用。

### 4.9 Study Reference

- Fiedler (2026). Bias and Uncertainty in LLM-as-a-Judge Estimation.
- SURE: Self-Consistency and Selective Human Review for LLM grading (2026). *MDPI MAKE*.
- Corbett & Anderson (1995). Knowledge Tracing. *User Modeling and User-Adapted Interaction*.
- Baker et al. (2008). Contextual Slip and Guess BKT.
- Cheng et al. (2025). KnowLP: GraphRAG-Induced Dual Knowledge Structure Graphs. *AAAI 2025*.

---

## 5. 整合系統 — 排程演算法與資料流

### 5.1 系統架構總覽

```
┌─────────────────────────────────────────────────────────┐
│                     Scheduling Layer                      │
│   next_concept() → next_content() → next_phase()          │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   Event Bus                               │
│  misconception_detected → trigger_debug_drill             │
│  phase_stuck → trigger_prerequisite_check                 │
│  correct_sequence → consider_acceleration                 │
│  llm_judge_available → soft_evidence_update                │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│             5-Layer State Store (per student)              │
│  Layer 1: Concept Graph (typed nodes + edges)              │
│  Layer 2: BKT (P(L), P(T), P(G), P(S) per concept)        │
│  Layer 3: LLM Judge (calibration params, bias model)       │
│  Layer 4: FSRS (D, S, R per card)                          │
│  Layer 5: KST Fringe (inner/outer fringe per student)      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Content Generation Engine                     │
│  Phase 1: Learn (worked example → template → drill)        │
│  Phase 2: Practice (fading → retrieval → mini drill)       │
│  Phase 3: Exam (blank slate → soft limit → AC gate)        │
│  Cross-cut: Debug/Patch drill (on misconception trigger)    │
└─────────────────────────────────────────────────────────┘
```

### 5.2 排程演算法（主循環）

每次學生要求新任務時，跑以下決策樹：

```
function next_action(student_state):
  // Step 0: 檢查是否有中斷的 drill session
  if student_state.has_interrupted_drill:
    return resume_drill(student_state.interrupted_drill)
  
  // Step 1: 檢查是否有 active misconception 需要補救
  active_mc = student_state.get_active_misconceptions()
  if active_mc and not recently_remediated(active_mc, 24h):
    return start_debug_drill(active_mc)
  
  // Step 2: 檢查到期複習（FSRS R < retrieval_threshold）
  due = fsrs.get_due_cards(student_state, limit=3)
  if due and student_state.completed_last_session:
    return schedule_review(due)
  
  // Step 3: 找當前節點的 next phase action
  current = student_state.current_concept
  phase = student_state.get_phase(current)
  action = generate_phase_action(current, phase, student_state)
  if action:
    return action
  
  // Step 4: 找 outer fringe 的下一個概念
  fringe = kst.get_outer_fringe(student_state)
  next_concept = select_best(fringe, criteria={
    "info_gain": |P(L) - 0.5|,      // 越不確定越好
    "irt_match": |θ - item_difficulty| < 0.5,  // 難度匹配
    "prereq_stable": all_prereqs_PL_above(0.8), // 先修穩固
  })
  if next_concept:
    return start_new_concept(next_concept, phase="learn")
  
  // Step 5: 無可用新概念 → session 結束建議
  return session_complete("所有可學概念已 mastered")
```

#### 優先級總表

| 優先級 | 動作 | 條件 |
|--------|------|------|
| 1 (最高) | 補救 drill | misconception 活躍且 24h 內未處理 |
| 2 | 中斷的 drill 恢復 | interrupted_drill flag 存在 |
| 3 | FSRS 複習 | R < 0.7 且上次 session 完成 |
| 4 | 當前 phase 內容 | 當前概念未 mastered |
| 5 | 新概念 | outer fringe 非空 |
| 6 | Session 結束 | 無可做事項 |

#### 動機調節 Modifiers

SDT（自主性、勝任感）和 Self-Efficacy（自我效能）不改變優先級順序，但調整執行參數：

**自主性支持（SDT Autonomy）：**
- 當 `next_action()` 回傳「新概念」時，若有 ≥ 2 個 equally-ranked 候選，改為提供選擇題（非強制指定）：「你想先學 A 還是 B？」
- 系統仍記錄建議順序，但學生選擇優先

**勝任感調節（Self-Efficacy Calibration）：**
- 追蹤滾動成功率 `success_rate = 近 5 題答對數 / 5`
- 若 success_rate < 0.3（連續挫敗）→ 自動將下一題難度降一級（-200 rating），製造 mastery experience（Bandura 向上螺旋）
- 若 success_rate > 0.9 且近 5 題皆為 rating+200 內 → 自動升一級難度（+200 rating），防止無聊
- 此調節不影響 IRT θ 或 BKT P(L) 的計算——只影響出題選擇，不汙染能力估計

**歸因回饋（Attribution Feedback）：**
- 學生 AC 後，若 LLM judge 判斷思考過程紮實，系統給予歸因於策略的回饋：「你這次 debug 的方法很系統化，先確認邊界條件再檢查核心邏輯，這策略有效。」
- 避免歸因於天賦的表述（Dweck 成長型思維理論，見 `cogsci-foundations.md` Topic 9）

### 5.3 Phase 內動作生成

#### Learn Phase

```
generate_learn_action(concept, student):
  step = student.get_learn_step(concept)
  
  switch step:
    case 0: return advance_organizer(concept.advance_organizer)
    case 1: return worked_example(concept.worked_example, self_explain_prompt)
    case 2: return syntax_template(concept.syntax_template)
    case 3: 
      drills = generate_drill_sequence(concept, "fill", count=3)
      drills += generate_drill_sequence(concept, "trace", count=1)
      return mini_drill_session(drills)
    case 4: return learn_complete_check()
```

step 前進條件：當前 step 的所有任務完成（example 看完、template 打完、drill 答對率 ≥ 0.7）。任一 drill 答錯 → 停留在 step 3，追加同 subskill 不同變體。

#### Practice Phase

```
generate_practice_action(concept, student):
  fading_stage = student.get_fading_stage(concept)
  // fading_stage 1-5（見 2.3）
  
  action = faded_problem(concept, stage=fading_stage)
  action.transition_check = {
    "advance": "連續 2 題隱藏步驟正確 → stage + 1",
    "retreat": "隱藏步驟答錯 → stage - 1",
    "expertise_reversal": "解題時間 < 預期 50% → stage + 2"
  }
  
  // 每 2 題 fading 夾 1 題 mini drill（鞏固變數追蹤能力）
  if student.consecutive_fading_since_last_drill >= 2:
    action.drill_interleave = generate_drill(concept, "trace", difficulty=2)
  
  return action
```

#### Exam Phase

```
generate_exam_action(concept, student):
  if student.unseen_variants_exist(concept):
    variant = concept.get_next_variant(difficulty=student.irt_theta)
    return exam_problem(variant, soft_time_limit=1.5x)
  else:
    return exam_complete_check()
```

### 5.4 Graph CRUD 操作

概念圖的操作接口：

```
// Read — 查詢學生當前狀態
get_concept_mastery(student_id, concept_id) → P(L), phase, 各項參數
get_prerequisite_chain(concept_id, direction="down") → 先修鏈
get_outer_fringe(student_id) → [concept_ids]
get_inner_fringe(student_id) → [concept_ids]
get_misconception_status(student_id, concept_id) → [active misconceptions]

// Write — 更新狀態
update_bkt(student_id, concept_id, observation, soft_evidence?)
update_irt(student_id, item_id, correct, phase_label)
update_fsrs(student_id, card_id, recall_success, reasoning_quality)
trigger_misconception(student_id, misconception_id, trigger_source)
complete_drill(student_id, drill_id, results)
advance_phase(student_id, concept_id, target_phase)
prerequisite_check(student_id, concept_id) → [unstable_prereqs]

// Admin — 圖結構操作
add_concept(concept_data)
add_prerequisite(parent_id, child_id, group_type="AND"|"OR")
register_misconception(concept_id, misconception_data)
calibrate_llm_judge(calibration_data)
```

### 5.5 Event Bus — 跨層通訊

各層之間不直接呼叫，透過 event bus 發布/訂閱：

| Event | Publisher | Subscribers | 效果 |
|-------|-----------|------------|------|
| `student_answered(obs)` | 答題系統 | BKT, IRT, LLM judge | 更新各層狀態 |
| `misconception_detected(mc_id)` | LLM judge | Scheduling, Debug drill | 排程補救 |
| `bkt_phase_transition(concept, from, to)` | BKT | Scheduling, FSRS, Oscillation monitor | 切換 phase + 熔斷計數器 |
| `phase_oscillation_detected(concept_id, count)` | Oscillation monitor | Scheduling | 熔斷：凍結當前節點，觸發 prerequisite check |
| `fringe_changed(student_id)` | KST | Scheduling | 重新計算 outer fringe |
| `irt_theta_changed(student_id, θ)` | IRT | Scheduling, Fading | 調整難度 |
| `calibration_drift(drift_level)` | Monitor | LLM judge | 暫停 LLM judge / 重新校準 |
| `prerequisite_cascade(start_concept)` | Scheduling | Graph | 遞迴檢查先修鏈 |
| `session_start(student_id)` | Frontend | Scheduling | 觸發 `next_action()` |
| `session_end(student_id, summary)` | Scheduling | FSRS, Anki | 安排複習 + 同步 |

### 5.6 邊界案例與防禦

#### 5.6.1 圖中有環

prerequisites 在插入時做 cycle detection（DFS back-edge check）。發現環時：
- reject 該 edge，回傳衝突的 cycle path
- 允許 non-prerequisite 邊（reinforces, analogous-to）有環

#### 5.6.2 多個概念同時解鎖

當 outer fringe 突然變大（如一個難的先修 mastered 後解鎖 5 個後繼）：
- 排序 criteria：IRT 難度最匹配的優先
- 提供橫向建議：「你可以學 A、B、C，建議從 A 開始（跟之前學的 D 最像）」

#### 5.6.3 學生長時間沒回來

```
1. FSRS R 已衰退 → 回溯性重新評估：
   - R < 0.4：自動退回一個 phase（learn 不退回）
   - R < 0.2：insert 一個 quick review drill（3 題填空）before 繼續
2. 決定是否觸發熔斷：計算缺席前的 P(L) vs 現在的推測 P(L) 差距
```

#### 5.6.4 LLM Judge 離線或降級

```
1. LLM judge 呼叫失敗或逾時 → 跳過 soft evidence
2. BKT 退回純二元觀察值（不影響主循環）
3. 累積失敗計數，若連續 5 次失敗 → 自動停用 LLM judge 24h
4. 恢復後先跑 10 案 calibration check 再重新啟用
```

#### 5.6.5 空圖啟動

初始狀態下沒有任何概念被 mastered：
```
1. 預載 core C++ syntax 概念圖（約 20 個節點：variables, loops, functions...）
2. 所有節點的 P(L₀) = 0.3（Corbett & Anderson 的保守初始值）
3. outer fringe = 沒有 prerequisites 的根節點（如 "basic-io", "variable-declaration"）
4. 學生學完根節點後逐步展開圖
```

### 5.7 CLI 交互設計（algo 命令）

algo 是主入口：

```
algo today          # 今日面板：複習到期 + 當前概念 + 建議（等同 today tool）
algo start cses-xx  # 開始一題（自動決定 phase）
algo next           # 下一步（觸發 scheduling → content generation）
algo hint           # 當前題的下一級提示（只在 exam phase 提供）
algo drill          # 強制進入 drill session（手動觸發）
algo status         # 當前概念掌握度一覽
algo log            # 最近訓練日誌
algo review         # 到期複習列表
algo submit         # 提交當前作答，更新模型
```

### 5.8 Study Reference

- Doignon & Falmagne (1985). Knowledge Spaces. *Int. J. Man-Machine Studies*.
- Corbett & Anderson (1995). Knowledge Tracing. *User Modeling*.
- Falmagne & Doignon (2011). *Learning Spaces*. Springer.
- Ye et al. (2022-2024). FSRS. *ACM KDD / IEEE TKDE / Anki*.
- Chi & Wylie (2014). ICAP Framework. *Educational Psychologist*.
- Atkinson et al. (2000). Learning from examples. *Review of Educational Research*.
