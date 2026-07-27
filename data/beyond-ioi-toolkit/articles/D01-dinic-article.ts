/**
 * D01 — Dinic 最大流教學文章
 *
 * 學習理論整合：BKT weight、IRT difficulty、drill refs 貫穿全文。
 * 教師每節結束後呼叫 engine_bkt_update 更新熟練度。
 */
import type { ToolkitArticle } from "../article-types.ts"

const article: ToolkitArticle = {
  metadata: {
    id: "D01-dinic",
    title: "Dinic 最大流 — 網路流經典演算法",
    group: "圖論進階",
    prerequisites: ["BFS", "DFS", "圖的鄰接表表示"],
    estimatedTotalMinutes: 120,
    bktDefault: { pT: 0.4, pG: 0.15, pS: 0.2 },
  },

  sections: [
    // ════════════════════════════════════════════
    // 第一節：問題動機
    // ════════════════════════════════════════════
    {
      id: "D01-motivation",
      title: "問題動機：最大流問題",
      content: `## 最大流問題定義

給定有向圖 G(V,E)，每條邊 (u,v) 有容量 c(u,v) ≥ 0。
找到從源點 s 到匯點 t 的最大流量，滿足：
1. 容量限制：每條邊的流量 ≤ 容量
2. 流量守恆：除了 s 和 t，每個節點流入 = 流出

## 為什麼 Dinic？

三種主流最大流演算法：

  Ford-Fulkerson：每次找一條增廣路，O(E·|f|)，可能很慢
  Edmonds-Karp：用 BFS 找「最短」增廣路，O(VE²)
  **Dinic**：分層圖 + blocked flow，O(EV²)，實際更快

Dinic 在競程中是事實標準，因為：
- 實作簡單（~60 行）
- 實際表現接近 O(E√V)
- 容易擴充成費用流

## 本節檢核

確認你能定義：容量、流量、源點、匯點、增廣路。`,
      theory: {
        bktWeight: 0.1,
        irtDifficulty: -1.0,
        estimatedMinutes: 5,
        prerequisites: [],
        drillRefs: [],
        evidence: "能用自己的話定義最大流問題",
        fsrsInitialEF: 2.5,
      },
    },

    // ════════════════════════════════════════════
    // 第二節：Dinic 核心概念
    // ════════════════════════════════════════════
    {
      id: "D01-core-idea",
      title: "核心概念：分層圖與阻塞流",
      content: `## Dinic 兩階段

while (BFS 還能到達匯點) {
    分層（Level Graph）
    DFS 做阻塞流（Blocking Flow）
}

### 階段一：BFS 分層（Level Graph）

從 s 做 BFS，每個節點標記 level[v] = 到 s 的最短邊數。
只保留 level[v] = level[u] + 1 的邊——這些邊構成分層圖。

### 階段二：DFS 推送阻塞流

在分層圖上 DFS，從 s 到 t 推盡可能多的流量。
當一條邊被推滿（容量用盡），就把它從分層圖中移除。
當從某節點無法繼續推送時，在該層「阻塞」。

### 為什麼兩階段有效？

BFS 保證每次找到的是「最短」增廣路。
DFS 一次推送所有可能流量，而不是一條一條找。
每次 BFS 後最短增廣路長度嚴格遞增，所以最多 V 次 BFS。

## 複雜度分析

- 每次 BFS：O(E)
- 每次 DFS（含當前弧優化）：O(E)
- 最多 V 次 BFS：O(EV)

但實際遠快於此，對隨機/單元容量圖約 O(E√V)。

## 檢核

請確認你能解釋：
1. 分層圖的定義？為什麼只保留 level+1 的邊？
2. 阻塞流的意思？
3. 為什麼 BFS 最多只會做 V 次？`,
      theory: {
        bktWeight: 0.2,
        irtDifficulty: 0.0,
        estimatedMinutes: 15,
        prerequisites: ["D01-motivation"],
        drillRefs: [],
        evidence: "能口述 Dinic 兩階段流程與分層圖的意義",
        fsrsInitialEF: 2.5,
      },
    },

    // ════════════════════════════════════════════
    // 第三節：當前弧優化
    // ════════════════════════════════════════════
    {
      id: "D01-current-arc",
      title: "當前弧優化（Current Arc / Dinic Optimization）",
      content: `## 問題：DFS 重複遍歷

在分層圖上 DFS 時，某一條邊如果已經被推滿容量，
下次從同一個節點出發時不應該再檢查它。

## 當前弧優化

對每個節點 v，維護 cur[v] = 從 v 出發的「下一條待檢查的邊」。

int cur[MAXN];  // 當前弧指標

bool bfs() { ... }  // 建立 level[]

int dfs(int v, int flow) {
    if (v == t) return flow;
    for (int &i = cur[v]; i < g[v].size(); i++) {
        Edge &e = g[v][i];
        if (level[e.to] != level[v] + 1 || e.cap <= 0) continue;
        int pushed = dfs(e.to, min(flow, e.cap));
        if (pushed) {
            e.cap -= pushed;
            g[e.to][e.rev].cap += pushed;
            return pushed;
        }
    }
    return 0;
}

關鍵行：for (int &i = cur[v]; i < g[v].size(); i++)
用 reference 更新 cur[v]，下次呼叫 dfs(v, ...) 時從中斷處繼續。

## 為什麼正確？

因為在分層圖上，一條邊要嘛被推滿（以後不會再用），
要嘛還有容量但下一層無法推送（該路徑阻塞）。
兩種情況都不需要再檢查這條邊。

## Fill Drill 提示

去看 toolkit_show D01-dinic mode=fill。
注意 Dinic 的 edge 結構——cr 欄位和 to/cap 一起存在結構體中。`,
      theory: {
        bktWeight: 0.3,
        irtDifficulty: 0.5,
        estimatedMinutes: 15,
        prerequisites: ["D01-core-idea"],
        drillRefs: [{ drillId: "D01-dinic-structured", mode: "fill", subskill: "dinic-structure" }],
        evidence: "能解釋當前弧優化的原理並寫出核心迴圈",
        fsrsInitialEF: 2.5,
      },
    },

    // ════════════════════════════════════════════
    // 第四節：邊結構與反向邊
    // ════════════════════════════════════════════
    {
      id: "D01-edge-structure",
      title: "邊結構與反向邊（Adjacency List with Reverse）",
      content: `## 為什麼需要反向邊？

當一條邊 (u,v) 被推送了流量 f，我們需要能夠「反悔」。
方法：每條邊加入一條反向邊，容量初始為 0。

struct Edge {
    int to, rev;  // rev：反向邊在 g[to] 中的 index
    ll cap;
};

vector<Edge> g[MAXN];

void add_edge(int u, int v, ll cap) {
    g[u].push_back({v, (int)g[v].size(), cap});
    g[v].push_back({u, (int)g[u].size() - 1, 0});
}

注意反向邊的 rev 指向正邊，正邊的 rev 指向反向邊。
這樣在推送流量時：

e.cap -= pushed;
g[e.to][e.rev].cap += pushed;

## 邊結構的記憶體技巧

每條實際邊 + 一條反向邊，共開 2E 條。
用 vector<Edge> 自動管理，不需要預先配置 MAXM。

## 配接：為什麼反向邊初始容量是 0？

因為初始時沒有流，所以不需要反悔。
反向邊只在「已經有流動」後才需要容量。

## Trace Drill 提示

現在用 trace drill A01-dinic-levelgraph，追蹤一個簡單圖的 BFS 分層過程。`,
      theory: {
        bktWeight: 0.25,
        irtDifficulty: 0.0,
        estimatedMinutes: 15,
        prerequisites: ["D01-current-arc"],
        drillRefs: [
          { drillId: "D01-dinic-structured", mode: "fill", subskill: "dinic-structure" },
          { drillId: "D01-dinic-levelgraph", mode: "trace", subskill: "level-graph" },
        ],
        evidence: "能寫出 add_edge 並解釋反向邊的 rev index 機制",
        fsrsInitialEF: 2.5,
      },
    },

    // ════════════════════════════════════════════
    // 第五節：完整實作與測試
    // ════════════════════════════════════════════
    {
      id: "D01-full-implementation",
      title: "完整實作與測試",
      content: `## 完整 C++ 模板（data/lib/dinic.cpp）

參考 data/lib/dinic.cpp，注意：

1. 變數命名：level[] 和 cur[] 全域陣列，每次 BFS 前不需要清空
2. BFS 回傳 false 表示不可達（流量為 0）
3. DFS 的 int &i = cur[v] 用 reference
4. 主迴圈：while (bfs()) { memset(cur, 0, sizeof(cur)); while (dfs(s, INF)); }

## 常見陷阱

1. ❌ 忘記重置 cur[]：每次 BFS 後 cur 必須歸零
2. ❌ 反向邊的 rev index 算錯：一定要 push_back 後再取 size
3. ❌ DFS 深度過大：最大遞迴深度 = V，對 IOI 規模（V ≤ 10⁵）需用迭代
4. ❌ 用 int 存容量：可能超過 2³¹，用 ll

## Debug Drill 提示

做 debug drill D01-dinic-bfsbug：找 BFS 分層初始化錯誤。

## 測試方法

// 簡單三角形圖
add_edge(0, 1, 10);
add_edge(1, 2, 5);
add_edge(0, 2, 5);
// max flow from 0 to 2 = 10? 還是 15？

// 典型二分圖匹配
// n 左側, m 右側, s = n+m, t = n+m+1
// 每條左→右容量 1
// s→左容量 1, 右→t 容量 1

## 學習理論提醒

Dinic 的 fill drill BKT weight = 0.3（記憶），trace = 0.5（理解），debug = 0.5（診斷）。
根據 FSRS：
  - 24h 後：做 fill drill（回想 edge 結構）
  - 7d 後：從空白寫出 Dinic（實作 recall）
  - 30d 後：做 min-cut 建模題目（應用 recall）`,
      theory: {
        bktWeight: 0.3,
        irtDifficulty: 0.5,
        estimatedMinutes: 30,
        prerequisites: ["D01-edge-structure"],
        drillRefs: [
          { drillId: "D01-dinic-structured", mode: "fill", subskill: "dinic-structure" },
          { drillId: "D01-dinic-levelgraph", mode: "trace", subskill: "level-graph" },
          { drillId: "D01-dinic-bfsbug", mode: "debug", subskill: "dinic-bfs" },
        ],
        evidence: "能從空白檔案寫出完整 Dinic 並通過測試",
        fsrsInitialEF: 2.5,
      },
    },

    // ════════════════════════════════════════════
    // 第六節：最小割與應用
    // ════════════════════════════════════════════
    {
      id: "D01-min-cut",
      title: "最小割定理與建模",
      content: `## 最大流 = 最小割

最小割：移除一組邊，使 s 無法到達 t，且被移除邊的容量總和最小。
**最大流 = 最小割**——這是網路流最重要的定理。

證明直觀：
- 任何 s-t 流 ≤ 任何 s-t 割的容量（弱對偶）
- Dinic 結束後，s 可達的節點集合 S 構成最小割（強對偶）

## 從 Dinic 結果找最小割

Dinic 完成後（BFS 無法到 t），level[] 中 level[v] != -1 的 v 屬於 S 側。
所有 S→T 的邊（滿載邊）構成最小割。

## 常見建模技巧

| 題型 | 建模方式 |
|------|---------|
| 二分圖最大匹配 | s→L(1) + L(1)→R(1) + R→t(1) |
| 最小路徑覆蓋 | 拆點 + s→u'(1) + u→v'(1) |
| 最大權閉合子圖 | 正權連 s，負權連 t，容量為絕對值 |
| 專案選擇問題 | 依賴關係轉換成 inf 邊 |

## 應用題推薦

1. CF/1733C — min-cut 二分圖
2. CF/1661F — 網路流 + 樹 DP
3. UOJ/77 — 最大權閉合子圖經典

## 賽前 checklist

□ 能在 8 分鐘內寫出 Dinic 完整模板
□ 能解釋最大流=最小割的直觀意義
□ 會拆點建模
□ 會最大權閉合子圖建模

現在從空白檔案寫 dinic.cpp，計時器開始。`,
      theory: {
        bktWeight: 0.15,
        irtDifficulty: 1.0,
        estimatedMinutes: 25,
        prerequisites: ["D01-full-implementation"],
        drillRefs: [],
        evidence: "能解釋最小割定理並寫出三種建模",
        fsrsInitialEF: 2.5,
      },
    },
  ],
}

export default article
