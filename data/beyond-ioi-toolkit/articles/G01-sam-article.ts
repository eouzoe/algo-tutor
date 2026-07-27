/**
 * G01 — 後綴自動機（SAM）教學文章
 *
 * 學習理論整合：BKT weight、IRT difficulty、drill refs、FSRS spacing。
 * 每一個概念結點對應一個 teachable unit。
 */
import type { ToolkitArticle } from "../article-types.ts"

const article: ToolkitArticle = {
  metadata: {
    id: "G01-sam",
    title: "後綴自動機 SAM — 字串問題的瑞士刀",
    group: "字串進階",
    prerequisites: ["字串雜湊", "字典樹 Trie", "自動機概念"],
    estimatedTotalMinutes: 150,
    bktDefault: { pT: 0.35, pG: 0.2, pS: 0.2 },
  },

  sections: [
    // ════════════════════════════════════════════
    // 第一節：動機
    // ════════════════════════════════════════════
    {
      id: "G01-motivation",
      title: "SAM 的定位：比後綴陣列更強的工具",
      content: `## 字串的子串問題

給字串 S（長度 n ≤ 10⁵），需要回答：
- 有多少個本質不同的子串？
- 某個 pattern 出現了幾次？
- 最長的出現至少 k 次的重複子串？
- 兩個字串的最長共同子串？

後綴陣列（SA）可以回答這些問題，但不是最直接的。
SAM 提供一個「自動機」，可以 O(|S|) 建構、然後 O(|P|) 回答上述問題。

## SAM 的資料結構

後綴自動機是一個最小化的 DFA，接受 S 的所有後綴。
它有幾個美妙性質：
- 節點數 ≤ 2n - 1
- 邊數 ≤ 3n - 4
- 建構時間 O(n)
- 本質不同子串數 = Σ(len[v] - len[link[v]])

## 三種字串工具對比

| 工具 | 建構 | 最長共同子串 | 第 k 小子串 | 子串出現次數 |
|------|------|-------------|------------|------------|
| 後綴陣列 | O(n log n) | O(n) | O(n log n) | O(log n) |
| SAM | O(n) | O(n) | O(n) | O(n)（建構時）|
| Hash | O(n) | 難 | 難 | O(1)（不精確）|

## 本節檢核

理解 SAM 的定位：何時該用 SAM 而非 SA。`,
      theory: {
        bktWeight: 0.1,
        irtDifficulty: -1.0,
        estimatedMinutes: 5,
        prerequisites: [],
        drillRefs: [],
        evidence: "能說出 SAM 的節點/邊數上界",
        fsrsInitialEF: 2.5,
      },
    },

    // ════════════════════════════════════════════
    // 第二節：endpos 等價類
    // ════════════════════════════════════════════
    {
      id: "G01-endpos-class",
      title: "endpos 等價類 — SAM 的靈魂",
      content: `## 什麼是 endpos？

對子串 t，endpos(t) = S 中 t 出現的結束位置集合。

例如 S = "ababa"：
  endpos("aba") = {3, 5}
  endpos("ba") = {2, 4}
  endpos("a") = {1, 3, 5}

## endpos 等價類

把 endpos 相同的子串歸為一類，稱為一個 SAM 節點（state）。

關鍵性質：
1. 同一個等價類中的子串長度是連續的（[minlen, maxlen]）
2. 不同等價類的 endpos 集合要嘛不相交，要嘛一個包含另一個
3. 性質 2 構成一個樹狀結構 → 這棵樹就是 parent tree (link tree)

## link 的意義

每個節點 v 有一個 link[v]，指向 endpos(v) 的真超集中最小的那個。
也就是說：link[v] 對應的子串是 v 最長子串去掉首字元後所在的類。

link[v] 的 len 一定比 v 小：
  len[v] - len[link[v]] = v 這個類對本質不同子串的貢獻數

## 為什麼重要？

endpos 等價類是 SAM 所有功能的來源：
- 出現次數 = parent tree 上的 subtree DP
- 本質不同子串數 = Σ(len - len[link])
- 最長共同子串 = 沿自動機走 + 維護長度

## 本節檢核

能用手畫 S="ababa" 的 endpos 等價類與 link 關係。`,
      theory: {
        bktWeight: 0.3,
        irtDifficulty: 0.0,
        estimatedMinutes: 20,
        prerequisites: ["G01-motivation"],
        drillRefs: [],
        evidence: "能手寫 endpos 等價類並理解 link 的意義",
        fsrsInitialEF: 2.5,
      },
    },

    // ════════════════════════════════════════════
    // 第三節：extend() — 在線建構
    // ════════════════════════════════════════════
    {
      id: "G01-extend",
      title: "extend() — 逐字元建構",
      content: `## SAM 的在線演算法

從空字串開始，每次在字串末尾添加一個字元 c，增量更新 SAM。

struct SAM {
    struct State { int len, link, next[26]; };
    vector<State> st;
    int last;  // 最後一次 extend 前的狀態

    SAM() {
        st.push_back({0, -1, {}});
        last = 0;
    }

    void extend(char ch) {
        int c = ch - 'a';
        int cur = st.size();
        st.push_back({st[last].len + 1, 0, {}});

        int p = last;
        while (p != -1 && !st[p].next[c]) {
            st[p].next[c] = cur;
            p = st[p].link;
        }
        if (p == -1) {
            st[cur].link = 0;
        } else {
            int q = st[p].next[c];
            if (st[p].len + 1 == st[q].len) {
                st[cur].link = q;
            } else {
                int clone = st.size();
                st.push_back(st[q]);
                st[clone].len = st[p].len + 1;
                while (p != -1 && st[p].next[c] == q) {
                    st[p].next[c] = clone;
                    p = st[p].link;
                }
                st[q].link = st[cur].link = clone;
            }
        }
        last = cur;
    }
};

## 三個分支

分支一：p 走完 link 鏈都沒有 next[c]（最簡單）
  → cur.link = 0（根節點）

分支二：找到 next[c]，且 len[p] + 1 == len[q]
  → cur.link = q（直接接上）

分支三：找到 next[c]，但 len[p] + 1 < len[q]
  → clone 一個節點（分割 q 的等價類）
  → 這是最複雜但也最關鍵的情況

## 為什麼需要 clone？

q 代表一個等價類，它的最長子串可能比 p 接 c 還長。
如果直接把 cur.link = q，會破壞 endpos 的性質。
clone 複製 q 的 link 和 next，只修改 len，然後讓 q 和 cur 都指向 clone。

## Fill Drill 提示

做 fill drill G01-sam-extend，填空 extend() 的三個分支條件。

## 本節檢核

能追蹤 "ab" 的建構過程，畫出 SAM 的狀態和 link。`,
      theory: {
        bktWeight: 0.35,
        irtDifficulty: 0.5,
        estimatedMinutes: 25,
        prerequisites: ["G01-endpos-class"],
        drillRefs: [
          { drillId: "G01-sam-extend", mode: "fill", subskill: "sam-construction" },
          { drillId: "G01-sam-buildtrace", mode: "trace", subskill: "sam-construction" },
        ],
        evidence: "能理解 clone 的用途並追蹤 extend() 流程",
        fsrsInitialEF: 2.5,
      },
    },

    // ════════════════════════════════════════════
    // 第四節：parent tree 與子串計數
    // ════════════════════════════════════════════
    {
      id: "G01-parent-tree",
      title: "Parent Tree（link tree）與子串計數",
      content: `## 建立 parent tree

link[v] 指向 v 的父節點，構成一個以 0 為根的樹。
len[v] - len[link[v]] = v 這個類貢獻的本質不同子串數。

## 出現次數計算

// 先對每個 cur 節點（非 clone）計數 1
vector<int> cnt(st.size(), 0);
for (int p = last; p != 0; p = st[p].link) cnt[p] = 1;

// 按 len 排序（基數排序）
vector<int> order(st.size());
iota(order.begin(), order.end(), 0);
sort(order.begin(), order.end(),
    [&](int a, int b) { return st[a].len > st[b].len; });

// 從長到短累加 cnt
for (int v : order) {
    if (st[v].link != -1)
        cnt[st[v].link] += cnt[v];
}

完成後 cnt[v] = 節點 v 對應的所有子串在原字串中的出現次數。

## 為什麼排序後累加？

parent tree 中，父節點的 len 一定小於子節點。
按 len 遞減排序 = 從葉子到根的序，保證子節點先被處理。

## 應用：出現至少 k 次的最長子串

對每個節點，如果 cnt[v] ≥ k，則 len[v] 是可能的候選答案。
max{ len[v] | cnt[v] ≥ k }。

## Trace Drill 提示

做 trace drill G01-sam-cnttrace，追蹤 "ababa" 的 cnt 計算過程。`,
      theory: {
        bktWeight: 0.25,
        irtDifficulty: 0.0,
        estimatedMinutes: 20,
        prerequisites: ["G01-extend"],
        drillRefs: [
          { drillId: "G01-sam-extend", mode: "fill", subskill: "sam-construction" },
          { drillId: "G01-sam-cnttrace", mode: "trace", subskill: "occurrence-count" },
        ],
        evidence: "能寫出 parent tree 上的出現次數計數",
        fsrsInitialEF: 2.5,
      },
    },

    // ════════════════════════════════════════════
    // 第五節：應用 — 最長共同子串
    // ════════════════════════════════════════════
    {
      id: "G01-app-lcs",
      title: "經典應用：最長共同子串（LCS）",
      content: `## 問題

給兩個字串 S 和 T，求它們的最長共同子串長度。

## SAM 解法

對 S 建 SAM，然後用 T 在上面走：

int l = 0, ans = 0;
for (char ch : T) {
    int c = ch - 'a';
    while (p != -1 && !st[p].next[c]) {
        p = st[p].link;
        l = (p == -1) ? 0 : st[p].len;
    }
    if (p == -1) {
        p = 0; l = 0;
    } else {
        p = st[p].next[c];
        l++;
        ans = max(ans, l);
    }
}

## 為什麼 link 回溯是對的？

當 T 的目前字元 c 不能從當前狀態 p 轉移時，需要「縮短」當前匹配的子串。
link[p] 是 p 的最長後綴（且仍在 SAM 中），所以回溯後 l = st[p].len。

## 複雜度

- 建構 SAM：O(|S|)
- T 在上面走：O(|T|)（每次回溯最多減少 len，總回溯次數 ≤ |T|）
- 總共：O(|S| + |T|)

## 多字串 LCS

需要同時在多個字串中出現的最長子串？
對第一個字串建 SAM，其餘字串各維護一個 ans 陣列，最後對每個節點取 min。
答案 = max{ len[v] | 每個字串都能到達 v }。

## 練習題

1. SPOJ/LCS — LCS 模板題
2. CF/235C — Cyclic LCS
3. CF/427D — 出現在恰兩個字串中的子串計數`,
      theory: {
        bktWeight: 0.25,
        irtDifficulty: 1.0,
        estimatedMinutes: 25,
        prerequisites: ["G01-parent-tree"],
        drillRefs: [
          { drillId: "G01-sam-extend", mode: "fill", subskill: "sam-application" },
        ],
        evidence: "能解釋 LCS 的 SAM 解法並分析複雜度",
        fsrsInitialEF: 2.5,
      },
    },

    // ════════════════════════════════════════════
    // 第六節：完整實作與檢查表
    // ════════════════════════════════════════════
    {
      id: "G01-implementation",
      title: "完整實作與常見陷阱",
      content: `## 完整 C++ 模板（data/lib/sam.cpp）

參考 data/lib/sam.cpp，注意：

1. State 陣列大小開 2n（因為 clone 可能產生 2n-1 個節點）
2. next 用 array<int,26> 或 unordered_map（依字元集大小）
3. extend 的 while 條件包括 p != -1（link[0] = -1）
4. clone 時要連 next 一起複製（State = st[q]）

## 常見陷阱

1. ❌ st 陣列開不夠大：最多 2n 個節點
2. ❌ link[0] = -1；extend 中 p 可能走到 -1，需要檢查
3. ❌ clone 時忘記複製 next：st.push_back(st[q]) 一行搞定
4. ❌ 字元集字母數 > 26 時用 map 而不是 array
5. ❌ 出現次數 DP 用陣列排序而不是遞迴（避免 stack overflow）

## 賽前 checklist

□ 能在 10 分鐘內寫出 SAM 完整 extend()
□ 知道什麼時候需要 clone（分支三）
□ 會 parent tree DP 算出現次數
□ 會 LCS 的 O(n+m) 算法

現在從空白檔案寫 sam.cpp，計時器開始。5 分鐘完成 extend()，10 分鐘完成全部。`,
      theory: {
        bktWeight: 0.2,
        irtDifficulty: 0.5,
        estimatedMinutes: 25,
        prerequisites: ["G01-app-lcs"],
        drillRefs: [
          { drillId: "G01-sam-extend", mode: "fill", subskill: "sam-construction" },
          { drillId: "G01-sam-cnttrace", mode: "trace", subskill: "occurrence-count" },
        ],
        evidence: "能在 10 分鐘內寫出 SAM 模板",
        fsrsInitialEF: 2.5,
      },
    },

    // ════════════════════════════════════════════
    // 第七節：總結與複習時程
    // ════════════════════════════════════════════
    {
      id: "G01-summary",
      title: "總結與 FSRS 複習排程",
      content: `## SAM 知識圖譜

    endpos 等價類
       ↑
    link (parent tree) ←→ len (最長子串長度)
       ↑
    extend() 在線建構（3 分支）
       ↑
    應用：LCS / 出現次數 / 本質不同子串 / 第 k 小

## BKT 更新

每完成一個 section，教師用 engine_bkt_update 更新 P(L)：
  - G01-endpos-class: bktWeight = 0.3（基本概念）
  - G01-extend: bktWeight = 0.35（最難的部分）
  - G01-parent-tree: bktWeight = 0.25
  - G01-app-lcs: bktWeight = 0.25（應用遷移）
  - G01-implementation: bktWeight = 0.2

## FSRS 複習時程

  - 1 天後：複習 endpos 等價類 + link 定義（回想）
  - 3 天後：複習 extend() 三個分支（從空白寫一次）
  - 7 天後：做一題 LCS（SPOJ/LCS）
  - 30 天後：做一題 CF/235C（Cyclic LCS）

## 本單元檢核題

1. SPOJ/SUBLEX — 第 k 小子串
2. CF/802I — 所有子串出現次數平方和
3. CF/123D — 子串對的出現次數`,
      theory: {
        bktWeight: 0.1,
        irtDifficulty: -0.5,
        estimatedMinutes: 15,
        prerequisites: ["G01-implementation"],
        drillRefs: [],
        evidence: "能在 10 分鐘內寫出 SAM 模板",
        fsrsInitialEF: 2.5,
      },
    },
  ],
}

export default article
