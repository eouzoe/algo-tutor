# Super-IOI 課綱與題單地圖 v1

> 目標：讓學生帶著超越 IOI 的工具上場，使 IOI 題目看起來只是 routine。
> 構造能力盈餘（capacity surplus），而非補弱點。

---

## 一、總體結構：兩層疊加

```
第一層（IOI 大師級，CF 2600+）       第二層（超越 IOI，CF 3000+）
─────────────────────────────        ─────────────────────────────
IOI Syllabus 完整覆蓋                 大學數學/CS 工具包
USACO Guide Platinum 全主題           生成函數 + BM + Kitamasa
CSES 全 300 題                       多項式全家桶（ln/exp/冪）
CF 2600+ 題庫                        網路流最小割建模 / 一般圖匹配
AtCoder 高難度（ARC/AGC）             Link-Cut Tree / HLD
IOI 真題 2010–2025 全刷               Wavelet Matrix / Segment Tree Beats
All-AC 的 code library               DP 優化全集（Aliens / 四邊形 / 分治）
                                      隨機化與雜湊 trick
                                      三維凸包 / Voronoi
                                      SAM / 迴文樹
```

### 訓練順序

```
[階段 1] 刷完 IOI Syllabus（CF 1600→2600）→ 建立第一層
[階段 2] 把第二層工具逐個「裝進工具包」
         └─ 每個工具：3–5 題 drill 建立反射
         └─ 不追求理解完整理論，只追求:
             a) 知道什麼問題用它
             b) 模板 10 分鐘內敲出來
             c) 知道常見陷阱
[階段 3] 兩層混合：在 2700+ 題目中自然使用第二層工具
[階段 4] 回來寫 IOI 模擬 → 體感「這題好簡單」
```

---

## 二、第一層：IOI Syllabus 完整覆蓋

### 現有課綱（curriculum.json 單元 1–18）涵蓋

| # | 單元 | 銜接 USACO | 關鍵題源 |
|---|------|-----------|---------|
| 1 | 環境與第一支程式 | General | zj/a001, zj/a002 |
| 2 | 控制流 | Bronze/Simulation | cses/1068, zj/a003 |
| 3 | 函式與遞迴初步 | — | 人工出題 |
| 4 | 陣列/vector/字串 | Bronze/Intro_DS | cses/1069, cses/1083 |
| 5 | STL 排序 | Bronze/Intro_Sorting, Silver/Sorting_Custom | cses/1621 |
| 6 | STL 關聯容器 | Bronze/Intro_Sets, Silver/Priority_Queues | cses/1090 |
| 7 | STL 演算法/迭代器 | General/Lambda_Funcs | cses/1091 |
| 8 | 複雜度與對拍 | Bronze/Time_Comp, General/Basic_Debugging | — |
| 9 | 遞迴與完全搜索 | Bronze/Intro_Complete, Bronze/Complete_Rec | cses/1623, cses/1624 |
| 10 | 貪心 | Bronze/Intro_Greedy, Silver/Greedy_Sorting | cses/1629 |
| 11 | 二分搜 | Silver/Binary_Search | cses/1620 |
| 12 | 前綴和與雙指針 | Silver/Prefix_Sums, Silver/Two_Pointers | cses/1640, cses/1661 |
| 13 | 基礎 DP | Gold/Intro_DP, Gold/Knapsack_DP, Gold/Paths_Grids | cses/1633, cses/1158, cses/1638 |
| 14 | 圖論基礎 | Bronze/Intro_Graphs, Silver/Graph_Traversal, Silver/Flood_Fill | cses/1192, cses/1666 |
| 15 | 最短路與拓撲 | Gold/Shortest_Paths | cses/1671, cses/1679 |
| 16 | 樹與 DSU | Silver/Intro_Tree, Gold/DSU | cses/1674, cses/1676 |
| 17 | 初選特化 I: 區間資結 | Gold/PURS | cses/1648, cses/1649 |
| 18 | 初選特化 II: 矩陣冪/哈希 | Gold/Hashing, Gold/Modular | cses/1722, cses/1753 |

### 需補足的 IOI 等級主題（第一層延伸）

#### 單元 19–25：Gold → Platinum

```
單元 19 — DP 進階
├─ 區間 DP（cses/1639, cf/1720B）
├─ 輪廓 DP（plug DP）
├─ 數位 DP（cf/1036C, atcoder/abc154f）
└─ DP 優化: deque 滑窗、bitmask、滾動陣列

單元 20 — 圖論進階
├─ Bellman-Ford / Floyd-Warshall / SPFA（負環偵測）
├─ 最小生成樹（Kruskal / Prim, cses/1675）
├─ 強連通分量（Kosaraju / Tarjan, cses/1682）
├─ 橋與關節點（cses/1677, cses/1678）
├─ 二分圖判定與最大匹配（cses/1133）
└─ 尤拉路徑（cf/1917C, boj/1199）

單元 21 — 樹上進階
├─ 最近共同祖先（LCA, cses/1688）
├─ 子樹 DP 與 reroot（cses/1131）
├─ 樹直徑與中心
└─ 樹上差分（cses/1130）

單元 22 — 資料結構進階
├─ 線段樹 lazy propagation（cses/1651, cses/1735）
├─ 離散化 + 掃描線（cses/1741）
├─ 持久化線段樹 / Trie / BIT
├─ 平衡二元樹（Treap / Splay 基本操作）
└─ 離線查詢：CDQ 分治、整體二分搜

單元 23 — 組合數學與數論
├─ 組合數計算（Pascal / 模逆元 / Lucas, cses/1079）
├─ 質數篩法（線性篩、區間篩）
├─ 尤拉函數與積性函數（cses/1080）
├─ 莫比烏斯反演基礎（gcd/lcm 計數）
├─ 中國剩餘定理（cses/1712）
└─ 離散對數（BSGS）

單元 24 — 計算幾何基礎
├─ 點/線/向量運算（叉積、線段相交）
├─ 凸包（Andrew monotone chain）
├─ 旋轉卡尺（最遠點對）
└─ 多邊形面積與點包含測試

單元 25 — 字串演算法
├─ KMP（cses/1753）
├─ Z-algorithm（cses/1754）
├─ Trie 與 Aho-Corasick（cses/1730）
├─ 雜湊進階（雙模、rolling hash anti-hack）
└─ 後綴陣列（SA + LCP 基本操作）
```

### IOI 等級題源彙整

| 題源 | 範圍 | 備註 |
|------|------|------|
| **CSES** | 全部 300 題 | 完整刷完，每題 AC |
| **USACO Guide** | Gold → Platinum | 每篇 guide 對應一單元 |
| **IOI 真題 (2010–2025)** | 全部 | 模擬賽用，全刷 |
| **CF 1600–2600** | 每 rating band 50 題 | 按 tags 篩選弱點 |
| **AtCoder ABC (E–G)** | 灰色→高難度 | ARC/AGC 模擬題 |
| **BOJ 分類題集** | 金/鉑金 tier | 韓國分類品質高 |
| **JOI 春合宿** | 本選/春合宿 | 全球公認高品質 |
| **POI / COCI** | 波蘭/克羅埃西亞 | CF Gym 多場合集 |

---

## 三、第二層：Beyond-IOI 工具包（20 個模組）

### A. 代數工具（Algebraic Tools）

```
A01 — FFT / NTT
├─ 模板: iterative NTT (Cooley-Tukey) O(n log n)
├─ 應用: 大數乘法、多項式卷積、卷積 DP 優化
├─ drill: NTT 實現填空, 多項式乘法 trace
├─ CF/1842D, CF/1733D2, CF/1580B
└─ USACO Guide: —（超越範疇）

A02 — 生成函數（Generating Functions）
├─ OGF（組合計數、背包封閉形式）
├─ EGF（排列、標號結構）
├─ 模板: 求逆 / 乘法 / 平移 O(n log n)
├─ drill: OGF 推導→NTT 計算
├─ CF/1982D, CF/1965D, AGC058A
└─ 應用: 看似組合暴搜→生成函數直接出公式

A03 — 線性遞迴與 BM
├─ Berlekamp-Massey（從序列反推遞迴式）
├─ Kitamasa O(k² log n) 加速
├─ 模板: BM → Kitamasa, <50 行
├─ drill: 給序列→BM→Kitamasa 求第 n 項
├─ CF/1806E, CF/1912A, CF/1705E
└─ 應用: 猜公式題、DP 優化、隨機過程期望值

A04 — 多項式全家桶
├─ 多項式求逆 / ln / exp / sqrt
├─ 多項式冪（含形式冪級數）
├─ 多項式複合逆 / Lagrange 反演
├─ 多點求值 / 快速插值 O(n log² n)
├─ drill: 模板各函式填空串接
└─ 應用: 組合計數、形式冪級數優化 DP
```

### B. 數論深度工具

```
B01 — 莫比烏斯反演完整
├─ Dirichlet 卷積（zeta 變換 / Möbius 變換）
├─ 偏序集版本（不只是 gcd/lcm）
├─ SOS DP 的高維推廣（超集/子集卷積）
├─ drill: Dirichlet 卷積 trace, SOS DP 填空
├─ CF/1740F, CF/1620E, CF/1889C
└─ 應用: 因數集合 DP、互質計數

B02 — 模域進階
├─ CRT 不互質版本（exCRT）
├─ Lucas 定理 → 大組合數 mod 小質數
├─ 離散對數 BSGS（cses/1725）
├─ 二次剩餘（Cipolla / Tonelli-Shanks）
├─ N 次剩餘
├─ drill: exCRT 填空, Cipolla trace
├─ CF/1716E, CF/1106E, CF/1749F
└─ 應用: 數論構造題、大組合數

B03 — 質數與因數分解
├─ Miller-Rabin 質數測試 O(k log³ n)
├─ Pollard-Rho 因數分解 O(n^{1/4})
├─ 模板: MR + PR 一體
├─ drill: MR trace → PR 填空
└─ 應用: 超大數因數分解、密碼學相關題
```

### C. 資料結構重武器

```
C01 — 線段樹 Beats
├─ 區間取 min/max + 區間和（勢能分析）
├─ 模板: SegmentTreeBeats 類別
├─ drill: beats 操作填空, 勢能分析 trace
├─ CF/1572C, CF/1665E, CF/1749F
└─ 應用: 需要同時維護極值+區間和的複雜題

C02 — Li Chao 線段樹
├─ 動態凸包：直線/線段插入、單點查詢最值
├─ 模板: LiChaoTree <30 行
├─ drill: chmin/chmax 轉換填空
├─ CF/1175D, CF/1411E, CF/1762E
└─ 應用: DP 優化（斜率任意）

C03 — Wavelet Matrix
├─ 區間 k-th 最小、range count、range distinct
├─ O(log σ) 全操作，僅 100 行
├─ drill: access/rank/select 填空
├─ CF/1917E, BOJ/1653, JOI 2016 Final
└─ 應用: 大規模區間查詢替代持久化線段樹

C04 — Link-Cut Tree
├─ 動態樹操作（link/cut/路徑查詢）
├─ splay 實現 LCT
├─ 模板: LCT <100 行
├─ drill: access/makeroot 追蹤填空
├─ CF/1386C, CF/1738E, CF/1508C
└─ 應用: 動態圖連通性、換根路徑 XOR
```

### D. 圖論進階

```
D01 — 網路流最大流
├─ Dinic O(E√V) / ISAP
├─ 模板: Dinic <60 行
├─ 最小割 = 最大流
├─ drill: 分層圖 trace, 增廣路填空
├─ CF/1783E, CF/1416D, CF/1630E
└─ 應用: 網路流建模, 最小割

D02 — 網路流進階建模
├─ 最小割 ⇔ 最大閉合子圖 ⇔ 二分圖最小點覆蓋
├─ 最小路徑覆蓋 / 最大密度子圖
├─ 最小費用流（SPFA + Dijkstra 勢能）
├─ 模板: MCMF <80 行
├─ drill: 建模轉換 trace, 費用流填空
├─ CF/1761E, CF/1368F, CF/1704E
└─ 應用: 資源分配、排程問題

D03 — 匹配
├─ 匈牙利演算法 O(VE)（二分圖最大匹配）
├─ KM 演算法（帶權最大匹配）
├─ 一般圖匹配（開花演算法 / Blossom）
├─ drill: 匈牙利填空, 開花演算法 trace
├─ CF/1680E, CF/1637F, CF/1735F
└─ 應用: 配對、覆蓋問題

D04 — 擬陣交（Matroid Intersection）
├─ 一句話：多種限制下的貪婪 = 擬陣交
├─ 模板: bipartite matroid intersection
├─ drill: 擬陣定義填空, 增廣路 trace
└─ 應用: 限量生成樹、兩限制獨立集
```

### E. DP 優化全集

```
E01 — 凸包優化（CHT / Li Chao）
├─ 斜率單調 → deque 維護 O(n)
├─ 任意斜率 → Li Chao 線段樹 O(n log C)
├─ drill: deque CHT trace, Li Chao 填空
├─ CF/1749F, CF/1725K, CF/1763E
└─ 應用: 分組 DP 優化（斜率形式）

E02 — 四邊形不等式
├─ Knuth 優化: dp[i][j] = min(dp[i][k] + dp[k][j]) → O(n²)
├─ 分治 DP（Divide & Conquer DP）O(n log n)
├─ 四邊形不等式檢測（wqs 眼力）
├─ drill: Knuth 優化填空, 分治 DP trace
├─ CF/1737E, CF/1527E, CF/1608F
└─ 應用: 分割問題、區間 DP 加速

E03 — Aliens Trick（Lagrange Relaxation）
├─ DP 有「正好 k 個」限制 → 二分罰則 λ
├─ 模板: 外層二分 λ, 內層去限制 DP
├─ drill: λ 二分填空, 內層 DP trace
├─ CF/1661E, CF/1526E, CF/1787F
└─ 應用: 分 k 組、選 k 個、k 筆劃

E04 — Plug DP / 輪廓線 DP
├─ 棋盤覆蓋、Hamiltonian path 計數
├─ 模板: 三進位狀態 + 輪廓線 DP
├─ drill: 狀態編碼填空, 轉移 trace
├─ CF/1738E, BOJ/1943, JOI 2014
└─ 應用: 棋盤問題、網格連通性
```

### F. 幾何

```
F01 — 三維凸包
├─ 增量法 O(n²)
├─ 模板: 三維凸包 <100 行
├─ drill: face flip trace
└─ 應用: 空間問題、三維包圍體

F02 — Voronoi 圖 / Delaunay 三角剖分
├─ Fortune 演算法 O(n log n)
├─ 模板: 掃描線 + 事件隊列
├─ drill: beach line 狀態填空
└─ 應用: 最近點對、最小生成樹（幾何）

F03 — 半平面交
├─ O(n log n) 雙端佇列法
├─ 模板: halfplane intersection <60 行
├─ drill: 半平面排序填空
└─ 應用: 多邊形核、線性規劃 2D 落點
```

### G. 字串進階

```
G01 — 後綴自動機（SAM）
├─ 線性構造、本質不同子串數
├─ 最長共同子串、第 k 小子串
├─ 模板: SAM <50 行
├─ drill: extend() trace, 子串計數填空
├─ CF/149E, CF/1787E, CF/1630E
└─ 應用: 所有子串相關問題

G02 — 迴文自動機（Palindromic Tree）
├─ 線性構造、所有本質不同迴文
├─ 模板: Palindromic Tree <50 行
├─ drill: insert() trace, 出現次數填空
├─ CF/1720E, CF/1598F
└─ 應用: 迴文子串計數、最小迴文分割

G03 — 後綴陣列 + LCP（SA-IS）
├─ SA-IS O(n)（或倍增法 O(n log n)）
├─ Kasai LCP O(n)
├─ 模板: 倍增 SA + LCP <40 行
├─ drill: rank 陣列填空, LCP trace
└─ 應用: 重複子串、子串比對、差別子串計數
```

### H. 隨機化與機率

```
H01 — 隨機化演算法
├─ 隨機增量法（convex hull、最小圓覆蓋）
├─ XOR hashing / color coding
├─ 常見亂數產生器（mt19937, splitmix64）
├─ drill: randomized partition trace, hash collision 填空
├─ CF/1749E, CF/1736E, CF/1520F
└─ 應用: 確定性演算法太慢時的偷吃步

H02 — 期望值與機率 DP
├─ 期望值線性 + 全期望公式
├─ 隨機程序的期望步數 → 解方程組
├─ 馬可夫鏈上 DP
├─ drill: 期望線性填空, 方程組建模 trace
├─ CF/1750E, CF/1720E, CF/1608E
└─ 應用: 隨機過程、遊戲機率題
```

---

## 四、各強國題源對照索引

### 中國體系

| 題源 | 對應層級 | 特色 |
|------|---------|------|
| **Luogu** | 普及→NOI | 高質量題解社群，省選/NOI 真題 |
| **POJ / HDU** | 傳統題庫 | 題量夠大但介面老舊 |
| **Codeforces** | CF 中文社群 | 大量中文題解 |
| **AtCoder** | 日文但中文題解多 | ABC/ARC 優質 |
| **國家集訓隊論文** (1999–今) | 第二層 | 每篇都是特定難點的深度穿透 |
| **李煜東《演算法競賽進階指南》** | IOI 第一層 | 結構完整，範例題精選 |
| **劉汝佳《演算法競賽入門經典》** | 基礎→中階 | 適合初學者 |

### 美國體系

| 題源 | 對應層級 | 特色 |
|------|---------|------|
| **USACO Guide** | Bronze→Platinum | 最好的結構化課綱 |
| **USACO Training Pages** | 基礎 | 老派但完整的練習序列 |
| **CSES** | 基礎→進階 | 300 題循序漸進 |
| **CPH (Laaksonen)** | 基礎→IOI | 最適合當教材的競賽書 |

### 韓國體系

| 題源 | 對應層級 | 特色 |
|------|---------|------|
| **BOJ 分類題集** | Bronze→Ruby | tier 制明確，分類精良 |
| **KBOI** | 韓國 IOI 選拔 | CF Gym 可找到 |

### 日本體系

| 題源 | 對應層級 | 特色 |
|------|---------|------|
| **AtCoder ABC (A–G)** | 基礎→CF 2000 | 穩定的周賽 |
| **AtCoder ARC (A–D)** | CF 2000–2800 | 高品質思維題 |
| **AtCoder AGC** | CF 2600+ | 滿分國手等級 |
| **JOI 本選 / 春合宿** | IOI 難度 | 全球示公認高品質 |
| **JOI Open / IOI 模擬** | IOI 難度 | 每年數題 |

### 波瀾 / 克羅埃西亞體系

| 題源 | 對應層級 | 特色 |
|------|---------|------|
| **POI** (波蘭) | 銀牌→金牌 | CF Gym 多場合集 |
| **COCI** (克羅埃西亞) | 銀牌 | 每年數場 |
| **CEOI** (中歐) | IOI 難度 | 高品質地區賽 |

### 俄羅斯體系

| 題源 | 對應層級 | 特色 |
|------|---------|------|
| **CF Div.1 / 2** | 全部 | 最大賽事平台 |
| **CF Gym** | 全部 | 各大賽事 archive |
| **Russian Olympiad** | IOI 難度 | 高品質 |

---

## 五、Block Practice 安排建議

### 5.1 主題塊循環

每個工具包的 drill 安排：

```
Day 1:  看模板推導 + 跟著打模板（learn mode）
Day 2:  填空 drill（fill mode）
Day 3:  trace drill + 一題簡單應用（trace → practice）
Day 4:  2–3 題混合練習（exam mode）
Day 7:  複習（review mode, FSRS 排程）
Day 30: 空白重推（從頭寫該工具的模板）
```

### 5.2 建議順序（高槓桿優先）

```
第一批（投報率最高）:
  A01 FFT/NTT → A03 BM+Kitamasa → A02 生成函數
  D01 網路流 → D02 進階建模
  E03 Aliens trick → E01 CHT
  G01 SAM

第二批（經典第二層）:
  B01 莫比烏斯反演 → B02 exCRT → B03 MR+PR
  C01 線段樹 Beats → C03 Wavelet Matrix
  E02 四邊形不等式 → E04 Plug DP
  D03 匹配（含一般圖）
  G02 迴文樹 → G03 SA

第三批（空間/隨機/進階）:
  F01 三維凸包 → F02 Voronoi → F03 半平面交
  C04 Link-Cut Tree
  D04 擬陣交
  H01 隨機化 → H02 機率 DP
  A04 多項式全家桶
```

---

## 六、追蹤與評量

每完成一個工具包模組：
1. 對應的 TS 模板需 type-check 無錯
2. 一題 drill 題 AC（從該模組的 drill 清單選）
3. 在 code library 中註冊該模板（`lib/template-name.cpp`）
4. 空白重推時：不參考任何材料，從頭寫模板，10 分鐘內完成

### AC 率目標

| 層級 | 目標 AC 率 | 時間 |
|------|-----------|------|
| 第一層基礎 (單元 1–18) | 95%+ | 3 個月 |
| 第一層進階 (單元 19–25) | 90%+ | 6 個月 |
| 第二層工具包 | 85%+ | 12 個月 |
| IOI 真題模擬 (近 5 年) | 平均 70%+ | 賽前 |

---

## 七、外部教材資源索引

每個工具包模組對應的 verified 高品質教材（語言 / 格式 / 品質評級）。

### A01 — FFT / NTT

| 資源 | URL | 語言 | 格式 | 評級 |
|------|-----|------|------|------|
| CP-Algorithms: FFT | <https://cp-algorithms.com/algebra/fft.html> | EN | article | ★★★★★ 黃金標準，含遞迴/迭代/任意模 |
| OI Wiki: 快速傅里葉變換 | <https://oi-wiki.org/math/poly/fft/> | ZH | article | ★★★★★ 中文最全，FFT+NTT+FWHT |
| CF: Tutorial on FFT/NTT (sidhant) | <https://codeforces.com/blog/entry/43499> | EN | blog | ★★★★☆ CLRS 風格，從複數開始 |
| CF: [Tutorial] FFT (-is-this-fft-) | <https://codeforces.com/blog/entry/111371> | EN | blog | ★★★★★ 現代手繪圖解，最佳全方面 |
| CF: Notes on FFT/NTT (Spheniscine) | <https://codeforces.com/blog/entry/75326> | EN | blog | ★★★★☆ 大模數 NTT 特化 |
| USACO Guide: FFT | <https://usaco.guide/adv/fft> | EN | guide | ★★★★☆ 進階→多項式，含練習題 |
| peltorator 影片 (3h) | <https://youtu.be/UiozqkITgXQ> | EN | video | ★★★★★ 從零開始，白板教學 |

### A02 — 生成函數 (OGF/EGF)

| 資源 | URL | 語言 | 格式 | 評級 |
|------|-----|------|------|------|
| CF: OGF/EGF Part 1 (zscoder) | <https://codeforces.com/blog/entry/77468> | EN | blog | ★★★★★ CP 界最佳入門，+800 |
| CF: OGF/EGF Part 2 (zscoder) | <https://codeforces.com/blog/entry/77551> | EN | blog | ★★★★☆ 實際題目應用 |
| OI Wiki: OGF / EGF | <https://oi-wiki.org/math/poly/ogf/> | ZH | article | ★★★★☆ 中文定義與操作大全 |
| Generatingfunctionology (Wilf) | <https://www.math.upenn.edu/~wilf/DownldGF.html> | EN | book(PDF) | ★★★★★ 生成函數聖經 |
| 3Blue1Brown 直觀介紹 | <https://youtu.be/bOXCLR3Wric> | EN | video | ★★★★★ 直覺視覺化入門 |

### A03 — BM + Kitamasa

| 資源 | URL | 語言 | 格式 | 評級 |
|------|-----|------|------|------|
| CF: BM 教學 (smax) | <https://codeforces.com/blog/entry/96199> | EN | blog | ★★★★★ 最佳教學，直覺+證明+KACTL |
| CF: Linear Recurrence (TLE) | <https://codeforces.com/blog/entry/61306> | EN | blog | ★★★★☆ BM 爆紅之源頭，+1492 |
| OI Wiki: Berlekamp–Massey | <https://oi-wiki.org/math/berlekamp-massey/> | ZH | article | ★★★★☆ 中文最佳，含五種進階應用 |
| CF: Kitamasa 教學 (Justice_Hui) | <https://codeforces.com/blog/entry/88760> | EN | blog | ★★★★★ Kitamasa 最佳，+322 |
| CF: Bostan-Mori (maspy) | <https://codeforces.com/blog/entry/111862> | EN | blog | ★★★★★ 更快的新型線性遞推 |

### B01 — 莫比烏斯反演

| 資源 | URL | 語言 | 格式 | 評級 |
|------|-----|------|------|------|
| OI Wiki: 莫比烏斯反演 | <https://oi-wiki.org/math/number-theory/mobius/> | ZH | article | ★★★★★ 中文最全，μ+Dirichlet+4 例 |
| CF: Möbius Inversion | <https://codeforces.com/blog/entry/53925> | EN | blog | ★★★★★ 最被引用，+500 |
| CF: Zeta/Möbius Transform | <https://codeforces.com/blog/entry/119082> | EN | blog | ★★★★☆ SOS DP 到 GCD 卷積 |
| USACO Guide: PIE (Möbius) | <https://usaco.guide/plat/PIE> | EN | guide | ★★★☆☆ μ 篩法與無平方因數計數 |

### B02 — exCRT / Lucas

| 資源 | URL | 語言 | 格式 | 評級 |
|------|-----|------|------|------|
| CP-Algorithms: CRT | <https://cp-algorithms.com/algebra/chinese-remainder-theorem.html> | EN | article | ★★★★★ Garner + 不互質推廣 |
| OI Wiki: CRT | <https://oi-wiki.org/math/number-theory/crt/> | ZH | article | ★★★★★ 完整含歷史案例與 exCRT |
| OI Wiki: Lucas / exLucas | <https://oi-wiki.org/math/number-theory/lucas/> | ZH | article | ★★★★★ Lucas 完整 + exLucas |
| CF: CRT blog | <https://codeforces.com/blog/entry/61290> | EN | blog | ★★★★☆ exCRT 合併 via exgcd，+450 |

### B03 — Miller-Rabin + Pollard-Rho

| 資源 | URL | 語言 | 格式 | 評級 |
|------|-----|------|------|------|
| CP-Algorithms: Primality Tests | <https://cp-algorithms.com/algebra/primality_tests.html> | EN | article | ★★★★★ 64-bit 確定性基底 |
| CP-Algorithms: Factorization | <https://cp-algorithms.com/algebra/factorization.html> | EN | article | ★★★★★ Floyd+Brent，含 `__int128` |
| OI Wiki: 素性測試 | <https://oi-wiki.org/math/number-theory/prime/> | ZH | article | ★★★★☆ u64 確定性 7 基底 |
| OI Wiki: Pollard-Rho | <https://oi-wiki.org/math/number-theory/pollard-rho/> | ZH | article | ★★★★☆ 金模板+遞迴 fac() |
| KACTL: Factor.h / MillerRabin.h | <https://github.com/kth-competitive-programming/kactl> | EN | code | ★★★★★ ICPC 戰隊參考，gcd 累積優化 |

### C01 — 線段樹 Beats

| 資源 | URL | 語言 | 格式 | 評級 |
|------|-----|------|------|------|
| CF: Segment Tree Beats (jiry_2) | <https://codeforces.com/blog/entry/57319> | EN | blog | ★★★★★ 原始論文，勢能分析框架 |
| OI Wiki: 線段樹 Beats | <https://oi-wiki.org/ds/seg-beats/> | ZH | article | ★★★★★ 多種懶標優先級，含國集論文 |
| USACO Guide: Segtree Beats | <https://usaco.guide/adv/segtree-beats> | EN | guide | ★★★★☆ 結構化教學+練習題 |
| peltorator 影片 | <https://codeforces.com/blog/entry/90460> | EN | video | ★★★★☆ 可視化解釋 |

### C03 — Wavelet Matrix

| 資源 | URL | 語言 | 格式 | 評級 |
|------|-----|------|------|------|
| 原始論文 (Navarro 2012) | <https://users.dcc.uchile.cl/~gnavarro/ps/spire12.4.pdf> | EN | paper | ★★★★★ 發明者原文 |
| Yuri Vishnevsky: Enter the WM | <https://yuri.is/writing/enter-the-wavelet-matrix/> | EN | blog | ★★★★★ 最佳概念入門+圖解 |
| Yuri Vishnevsky: WM Construction | <https://yuri.is/writing/wavelet-matrix-construction/> | EN | blog | ★★★★☆ 建構流程深潛 |
| IOI Journal 論文 | <https://ioinformatics.org/journal/v10_2016_19_37.pdf> | EN | paper | ★★★★☆ WM vs 持久化線段樹比較 |
| USACO Guide: Wavelet | <https://usaco.guide/adv/wavelet> | EN | guide | ★★★★☆ 含多種解法的教學 |
| CF: Intro to Wavelet Trees | <https://codeforces.com/blog/entry/52854> | EN | blog | ★★★★☆ 最被引用的 Wavelet CF 文 |
| 洛谷: 淺談 Wavelet Matrix | <https://www.luogu.com.cn/article/w6s63rpj> | ZH | blog | ★★★★☆ 完整中文實作 |

### D01 — Dinic 最大流

| 資源 | URL | 語言 | 格式 | 評級 |
|------|-----|------|------|------|
| CP-Algorithms: Dinic | <https://cp-algorithms.com/graph/dinic.html> | EN | article | ★★★★★ 黃金標準，含當前弧 |
| OI Wiki: 最大流 | <https://oi-wiki.org/graph/flow/max-flow/> | ZH | article | ★★★★★ 中文最全，含 ISAP |
| USACO Guide: Max Flow | <https://usaco.guide/adv/max-flow> | EN | guide | ★★★★☆ Dinic 模板+練習題 |
| USACO Guide: Min Cut | <https://usaco.guide/adv/min-cut> | EN | guide | ★★★★☆ 最小割建模經典 |
| CF: Dinic 深入理解 (adamant) | <https://codeforces.com/blog/entry/104960> | EN | blog | ★★★★★ 設計哲學三部曲 |
| CF: Min Cut 建模大全 | <https://codeforces.com/blog/entry/136761> | EN | blog | ★★★★★ 最完整的 min-cut 系統教學 |
| VisuAlgo: Max Flow | <https://visualgo.net/en/maxflow> | EN | interactive | ★★★★★ 逐步視覺化 BFS→DFS |
| CF: Project Selection | <https://codeforces.com/blog/entry/101354> | EN | blog | ★★★★☆ closure→min-cut 等價性 |

### E01 — 凸包優化 CHT

| 資源 | URL | 語言 | 格式 | 評級 |
|------|-----|------|------|------|
| CP-Algorithms: CHT & Li Chao | <https://cp-algorithms.com/geometry/convex_hull_trick.html> | EN | article | ★★★★★ CHT + Li Chao 大全 |
| OI Wiki: 李超線段樹 | <https://oi-wiki.org/ds/li-chao-tree/> | ZH | article | ★★★★★ 插入/查詢/合併全覆蓋 |
| OI Wiki: 斜率優化 | <https://oi-wiki.org/dp/opt/slope/> | ZH | article | ★★★★☆ CHT 作為 DP 優化 |
| CF: CHT (643Algo) | <https://codeforces.com/blog/entry/63823> | EN | blog | ★★★★★ 最被引用，+600 |
| USACO Guide: CHT | <https://usaco.guide/plat/convex-hull-trick> | EN | guide | ★★★★☆ deque CHT + Fair Nut |
| Algorithms Live: CHT | <https://youtu.be/PPFx7iCwWxQ> | EN | video | ★★★★☆ 可視化直覺 |

### E03 — Aliens Trick

| 資源 | URL | 語言 | 格式 | 評級 |
|------|-----|------|------|------|
| CF: The trick from aliens | <https://codeforces.com/blog/entry/68778> | EN | blog | ★★★★★ 原始完整教學，+300 |
| OI Wiki: WQS 二分 | <https://oi-wiki.org/dp/opt/wqs-binary-search/> | ZH | article | ★★★★★ 最全中文，拉格朗日對偶+4 證明 |
| CF: 理論基礎 | <https://codeforces.com/blog/entry/98334> | EN | blog | ★★★★☆ Lagarange 對偶嚴格處理 |
| Algo-Science: Alien's Trick | <https://www.takeuhigh.org/docs/greedy-course/chapter-07-wqs-binary-search/01-the-aliens-trick/> | EN | tutorial | ★★★★☆ 幾何視角+互動 |
| IOI 2016 Aliens (原題) | <https://oj.uz/problem/view/IOI16_aliens> | EN | problem | ★★★★☆ 讓 WQS 爆紅的那題 |

### E04 — Plug DP

| 資源 | URL | 語言 | 格式 | 評級 |
|------|-----|------|------|------|
| OI Wiki: 插頭 DP | <https://oi-wiki.org/dp/plug/> | ZH | article | ★★★★★ 最全中文，連通性+Hamiltonian+括號 |
| 陳丹琦 2008 國集論文 | <https://www.cs.princeton.edu/~danqic/papers/dynamic-programming.pdf> | ZH | paper | ★★★★★ 插頭 DP 原創論文，括號表示法 |
| CF: Plug DP 介紹 (jxin314) | <https://codeforces.com/blog/entry/90841> | EN | blog | ★★★★★ 唯一完整英文教學 |
| 模板題: Luogu P5056 | <https://www.luogu.com.cn/problem/P5056> | ZH | problem | ★★★★☆ 插頭 DP 經典模板題 |

### G01 — 後綴自動機 SAM

| 資源 | URL | 語言 | 格式 | 評級 |
|------|-----|------|------|------|
| CP-Algorithms: SAM | <https://cp-algorithms.com/string/suffix-automaton.html> | EN | article | ★★★★★ 英文最全定義+11 應用 |
| OI Wiki: 後綴自動機 | <https://oi-wiki.org/string/sam/> | ZH | article | ★★★★★ endpos/link/suffix tree |
| CF: SAM 簡明指南 (quasisphere) | <https://codeforces.com/blog/entry/20861> | EN | blog | ★★★★★ 記憶遊戲隱喻，最親切的入門 |
| CF: SAM and Suffix Tree (adamant) | <https://codeforces.com/blog/entry/22420> | EN | blog | ★★★★☆ SAM↔suffix tree 嚴謹橋接 |
| e-maxx 原始文章 (俄) | <https://e-maxx.ru/algo/suffix_automata> | RU | article | ★★★★★ Maxim Ivanov 原作 |

### G03 — 後綴陣列 SA + LCP

| 資源 | URL | 語言 | 格式 | 評級 |
|------|-----|------|------|------|
| CP-Algorithms: Suffix Array | <https://cp-algorithms.com/string/suffix-array.html> | EN | article | ★★★★★ 倍增法+Kasai+LCP |
| OI Wiki: 後綴陣列 | <https://oi-wiki.org/string/sa/> | ZH | article | ★★★★★ 9 種應用分類+SA-IS |
| USACO Guide: Suffix Array | <https://usaco.guide/adv/suffix-array> | EN | guide | ★★★★☆ 倍增+radix sort+BWT |
| USACO Guide: String Suffix | <https://usaco.guide/adv/string-suffix> | EN | guide | ★★★★☆ SAM↔SA↔suffix tree 橋接 |

---

## 八、中國國家集訓隊論文（可使用資源）

2008–2025 每年 ~15 篇，GitHub 可取得：

| 倉庫 | URL | 涵蓋年份 |
|------|-----|---------|
| enkerewpo/OI-Public-Library | <https://github.com/enkerewpo/OI-Public-Library> | 2013–2025 |
| lingr7/Proceedings 99-09 | <https://github.com/lingr7/Proceedings-of-the-Informatics-Olympic-National-Training-Team-99-09-> | 1999–2009 |

**與工具包相關的重點論文：**

| 年份 | 作者 | 標題 | 關聯工具 |
|------|------|------|---------|
| 2008 | 陳丹琦 | 基於連通性狀態壓縮的動態規劃問題 | E04 Plug DP |
| 2016 | 吉如一 (jiry_2) | Segment Tree Beats | C01 Beats |
| 2011 | 胡偉棟 | 數論與代數 | B03 MR+PR |
| 2009 | 毛杰明 | 淺談線性遞推問題 | A03 BM/Kitamasa |
| 2020 | 鄧明揚 | 一類基於值域的資料結構 | C03 Wavelet Matrix |
| 2013 | 王迪 | 淺談線性規劃與對偶 | D01 Min-Cut, E03 Aliens |

建議：不必完整讀整篇論文，每個工具包先讀 CP-Algorithms 或 OI Wiki，再拿國集論文當深度補充。

---

## 九、檔案結構

```
data/
├── curriculum.json            # 現有課綱（18 單元，基礎→初選）
├── curriculum-super.md        # 本文件（超 IOI 擴展）
├── concept-index.json         # 基礎概念 drill 索引
├── resource-index.json        # 外部教材索引（結構化 JSON，可供程式消費）
├── cf-problems.json           # CF 題庫
├── usaco/                     # USACO Guide 對照
├── beyond-ioi-toolkit/        # 第二層工具包 TS 模板 + drill
│   ├── A01-fft-ntt.ts
│   ├── A02-generating-functions.ts
│   ├── ...
│   ├── index.ts               # 統一索引（42 drills, 14 concepts）
├── lib/                       # C++ 模板庫（學生 code library）
│   ├── ntt.cpp
│   ├── bm-kitamasa.cpp
│   ├── dinic.cpp
│   ├── sam.cpp
│   ├── cht.cpp
│   └── excrt-lucas.cpp
└── papers/                    # 16 篇論文 PDF（9.0 MB）
```
