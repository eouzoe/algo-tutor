/**
 * A01 — FFT / NTT 教學文章
 *
 * 學習理論整合：
 * - 每小節結束標記 BKT weight，教師做完 drill 後應調用 engine_bkt_update
 * - IRT difficulty 標注讓教師可依學生能力調整節奏
 * - FSRS spacing hint 記錄最佳複習時機
 * - Drill refs 直接對應 toolkit 中的 drill ID
 */
import type { ToolkitArticle } from "../article-types.ts"

const article: ToolkitArticle = {
  metadata: {
    id: "A01-fft-ntt",
    title: "FFT / NTT — 快速多項式乘法",
    group: "代數工具",
    prerequisites: ["複數基本運算", "模運算", "分治思想"],
    estimatedTotalMinutes: 120,
    bktDefault: { pT: 0.45, pG: 0.15, pS: 0.15 },
  },

  sections: [
    // ════════════════════════════════════════════
    // 第一節：問題動機 — 為什麼需要 NTT
    // ════════════════════════════════════════════
    {
      id: "A01-motivation",
      title: "問題動機：卷積與暴力困境",
      content: `## 多項式乘法問題

給兩個多項式 A(x) = a₀ + a₁x + a₂x² + ... + a_{n-1}x^{n-1} 和 B(x)，求 C(x) = A(x)·B(x)。

暴力法：兩層迴圈 O(n²)，n=10⁵ 時需要 10¹⁰ 次運算，IOI 時間限制不可能。

## NTT 的承諾

NTT（Number Theoretic Transform）能在 O(n log n) 完成卷積：
- n=10⁵ → ~1.7×10⁶ 次運算（vs 10¹⁰）
- 使用整數模運算（沒有浮點誤差）
- 只需要加減乘和模運算，code < 60 行

## 核心理念：係數→點值→係數

FFT/NTT 的核心是「表示法轉換」：

 係數表示法 ──→ 點值表示法 ──→ 逐點相乘 ──→ 回到係數
  A(x)           NTT(A)           C[k]=A[k]B[k]    INTT(C)
  O(n log n)                      O(n)             O(n log n)

為什麼點值表示法乘法快？因為 C(x_k) = A(x_k)·B(x_k) 只是數字相乘。

## 本節檢核

請確認你能用自己的話解釋：
1. 為什麼暴力卷積是 O(n²)？
2. 點值表示法為什麼讓乘法變 O(n)？
3. NTT 三階段各階段的複雜度？`,
      theory: {
        bktWeight: 0.15,
        irtDifficulty: -1.0,
        estimatedMinutes: 10,
        prerequisites: [],
        drillRefs: [],
        evidence: "能口述卷積問題與 NTT 三階段流程",
        fsrsInitialEF: 2.5,
      },
    },

    // ════════════════════════════════════════════
    // 第二節：NTT 的數學基礎
    // ════════════════════════════════════════════
    {
      id: "A01-math-foundation",
      title: "數學基礎：原根與質數模",
      content: `## FFT 用複數，NTT 用整數

FFT 用複數單位根 ω_n = e^{2πi/n}，但在電腦上浮點運算有誤差。

NTT 改用模質數 P 下的「原根」（primitive root）代替單位根。

## 關鍵參數

標準 NTT 質數（998244353）：

  P = 998244353 = 119·2²³ + 1

這意味著存在原根 g = 3，且 ω_n = g^{(P-1)/n} 是模 P 下的 n 次單位根。
因為 P-1 = 119·2²³，所以 n 最大可以到 2²³（約 8 百萬），IOI 場景完全夠用。

## 為什麼這樣設計？

需要 ω_nⁿ ≡ 1 (mod P) 且 ω_n^{n/2} ≡ -1 (mod P)，類似複數單位根的性質：
- ω_n^k = ω_n^{k mod n}（周期性）
- ω_n^{k+n/2} = -ω_n^k（對稱性）

## 原根計算（只做一次）

int findPrimitiveRoot(int P) {
    vector<int> factors = factorize(P - 1);
    for (int g = 2; g < P; g++) {
        bool ok = true;
        for (int f : factors)
            if (mod_pow(g, (P-1)/f, P) == 1) { ok = false; break; }
        if (ok) return g;
    }
    return -1;
}

但在競程中，已知的標準質數和對應原根是常數，不需要算。
常用的 NTT-friendly 質數：

  P = 998244353, g = 3     // 最常用，119·2²³+1
  P = 1004535809, g = 3    // 479·2²¹+1
  P = 469762049, g = 3     // 7·2²⁶+1

## 本節檢核

請確認：
1. 998244353 的因數分解為何？
2. ω_n = g^{(P-1)/n} 的直觀意思是什麼？
3. 為什麼 n 最大到 2²³？`,
      theory: {
        bktWeight: 0.2,
        irtDifficulty: -0.5,
        estimatedMinutes: 15,
        prerequisites: ["A01-motivation"],
        drillRefs: [],
        evidence: "能解釋 NTT 質數的結構與原根的用途",
        fsrsInitialEF: 2.5,
      },
    },

    // ════════════════════════════════════════════
    // 第三節：Bit-Reversal Permutation
    // ════════════════════════════════════════════
    {
      id: "A01-bitrev",
      title: "Bit-Reversal Permutation（位元反轉排列）",
      content: `## 為什麼需要位元反轉？

Cooley-Tukey 迭代式 FFT 要求輸入已經是「位元反轉順序」。

如果 n = 8，原始順序是 0,1,2,3,4,5,6,7。
位元反轉後（3 bits）：0,4,2,6,1,5,3,7。

  原始： 000 001 010 011 100 101 110 111
  反轉： 000 100 010 110 001 101 011 111

## 線上位元反轉技巧（In-Place）

for (int i = 1, j = 0; i < n; i++) {
    int bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) swap(a[i], a[j]);
}

這段 code 是「線上演算法」，不需要預先建表。追蹤一次 n=8：

  i=1: bit=4, j=0 → j&4=0 → j^=4, j=4, swap(a[1],a[4])
  i=2: bit=4, j=4 → j&4≠0 → j^=4, j=0, bit=2 → j&2=0 → j^=2, j=2, swap(a[2],a[2])（跳過）
  i=3: bit=4, j=2 → j&4=0 → j^=4, j=6, swap(a[3],a[6])
  i=4: bit=4, j=6 → j&4≠0 → j^=4, j=2, bit=2 → j&2≠0 → j^=2, j=0, bit=1 → j&1=0 → j^=1, j=1, swap(a[5],a[1])（i<j 已不成立）

## 為什麼可以 in-place？

這個技巧實質上是「反轉 index 的計數器」，每次 i 增加時同步更新反轉後的 j。
不需要額外陣列，O(n) 時間。

## Fill Drill 提示

現在打開 toolkit_show A01-fft-ntt mode=fill，做 drill ID 為 A01-fft-bitrev 的填答應用。
注意填空處在 bitrev-loop 和 len-loop 的終止條件。`,
      theory: {
        bktWeight: 0.3,
        irtDifficulty: 0.0,
        estimatedMinutes: 15,
        prerequisites: ["A01-math-foundation"],
        drillRefs: [{ drillId: "A01-fft-bitrev", mode: "fill", subskill: "bit-reversal" }],
        evidence: "能在不看參考的情況下重寫 bit-reversal 迴圈",
        fsrsInitialEF: 2.5,
      },
    },

    // ════════════════════════════════════════════
    // 第四節：蝶形運算（Butterfly）
    // ════════════════════════════════════════════
    {
      id: "A01-butterfly",
      title: "蝶形運算（Butterfly）與 Cooley-Tukey 迭代",
      content: `## 從分治到迭代

遞迴版 FFT：把多項式分成偶數項和奇數項，分別 FFT，再合併。
迭代版：從 leaf（長度 2 的 DFT）開始，逐層合併到 root。

for (int len = 2; len <= n; len <<= 1) {
    // 對每組長度 len 的 DFT 做合併
    for (int i = 0; i < n; i += len) {
        int wlen = mod_pow(root, (P-1)/len);
        int w = 1;
        for (int j = 0; j < len/2; j++) {
            int u = a[i + j];           // 左半
            int v = a[i + j + len/2] * w % P;  // 右半 × 旋轉因子
            a[i + j] = (u + v) % P;     // 新的左
            a[i + j + len/2] = (u - v + P) % P; // 新的右
            w = w * wlen % P;            // 更新旋轉因子
        }
    }
}

## 蝶形的直觀

一次 butterfly 操作：

    (u, v) → (u + ω·v, u - ω·v)

形狀像蝴蝶張開翅膀：

    u ──────→ (+)──→ u + ωv
                ↙
      ω·v  ← ω
                ↘
    v ──────→ (−)──→ u - ωv

## 長度倍增的流程

以 n = 8 為例：
  len=2: 4 組 butterfly（每組 1 個）
  len=4: 2 組 butterfly（每組 2 個）
  len=8: 1 組 butterfly（每組 4 個）

總共 n log₂(n)/2 次 butterfly，O(n log n)。

## 為什麼叫「單位根」？

ω_{2len}² = ω_len，所以下一層的 ωlen 可以由 ω_{2len} 平方得到。
這就是為什麼外層 wlen 每次由 mod_pow 從原始根計算，內層 w 逐步乘 wlen。

## Trace Drill 提示

現在做 trace drill: A01-ntt-convolution。
追蹤 multiply([1,2,3], [4,5,6]) 的 n 值與陣列長度變化。`,
      theory: {
        bktWeight: 0.35,
        irtDifficulty: 0.5,
        estimatedMinutes: 20,
        prerequisites: ["A01-bitrev"],
        drillRefs: [
          { drillId: "A01-fft-bitrev", mode: "fill", subskill: "butterfly" },
          { drillId: "A01-ntt-convolution", mode: "trace", subskill: "convolution" },
        ],
        evidence: "能手繪 butterfly 圖並解釋 len 倍增流程",
        fsrsInitialEF: 2.5,
      },
    },

    // ════════════════════════════════════════════
    // 第五節：逆變換（Inverse NTT）
    // ════════════════════════════════════════════
    {
      id: "A01-inverse",
      title: "逆變換：從頻域回到係數",
      content: `## 為什麼需要逆變換？

頻域逐點相乘後，結果還在頻域（點值表示法）。
我們需要回到係數表示法才能得到多項式的係數。

## 逆變換公式

NTT 的逆變換幾乎和正變換一樣：

1. 用 ω_n^{-1} 代替 ω_n（即 g^{-(P-1)/n}）
2. 做完後每個數乘上 n^{-1}（模逆元）
3. 反轉陣列（因為從頭到尾做了一次 reverse）

在代碼中：

if (invert) {
    ll inv_n = mod_pow(n, P-2);  // 費馬小定理：n^{-1} ≡ n^{P-2} (mod P)
    for (ll &x : a) x = x * inv_n % P;
    reverse(a.begin(), a.end());
}

## 為什麼 NTT 和 INTT 共用同一函式？

因為 ω_n^{-1} = ω_n^{n-1}，也就是說傳入 ω_n^{n-1} 做正變換等於 INTT。
程式可以共用：當 invert=true 時，把 wlen 改成 wlen^{-1}（即 mod_pow(wlen, P-2)）。

在我們的實作中：
  wlen = mod_pow(ROOT, (P-1) / len)
如果 invert，就改成 wlen = mod_pow(ROOT, (P-1) / len * (len-1))

但更簡潔的寫法：invert 時用 wlen = mod_pow(wlen, P-2)（即原 wlen 的模逆元）。

## 驗證

取任意多項式 A，NTT(INTT(A)) 應該等於 A 本身。
這是除錯時最簡單的 sanity check。

## Debug Drill 提示

現在試 debug drill: A01-ntt-modbug。
有一段 multiply 函式少了 % MOD 步驟——找到並修復它。`,
      theory: {
        bktWeight: 0.25,
        irtDifficulty: 0.0,
        estimatedMinutes: 10,
        prerequisites: ["A01-butterfly"],
        drillRefs: [{ drillId: "A01-ntt-modbug", mode: "debug", subskill: "convolution" }],
        evidence: "能解釋逆變換三步驟並 debug 常見的 mod bug",
        fsrsInitialEF: 2.5,
      },
    },

    // ════════════════════════════════════════════
    // 第六節：完整 NTT 實作與測試
    // ════════════════════════════════════════════
    {
      id: "A01-full-implementation",
      title: "完整實作與測試",
      content: `## 完整 C++ 模板（data/lib/ntt.cpp）

參考 data/lib/ntt.cpp 中的完整實作，注意：

1. mod_pow 的 ll 版本（競程中用 ll 避免 int 溢位）
2. n 必須是 2 的冪，且 n ≤ 2²³
3. 陣列事先 resize 到 n，不要 push_back
4. vector<ll> 傳 reference，不要 copy

## 測試方法

// 測試 1：小多項式乘法
vector<ll> a = {1, 2, 3}, b = {4, 5, 6};
auto c = multiply(a, b);
// c = {4, 13, 28, 27, 18}
// (1+2x+3x²)(4+5x+6x²)
// = 4 + 13x + 28x² + 27x³ + 18x⁴

// 測試 2：inverse 性質
vector<ll> d = {1, 2, 3, 4, 5, 6, 7, 8};
auto e = d;
ntt(e, false);
ntt(e, true);
// e 應該等於 d

// 測試 3：大數乘法（常見題型）
// 用 NTT 做兩個大數的乘法：
// "123" × "456" → 把 digits 當係數

## 常見陷阱

1. ❌ 忘記 % MOD：中間結果可能超過 2⁶³
2. ❌ n 不是 2 的冪：用 while (n < a.size()+b.size()-1) n <<= 1;
3. ❌ 忘記截斷結果長度：fa.resize(a.size() + b.size() - 1);
4. ❌ 用 int 累加：乘法過程可能超過 2³¹（用 ll）
5. ❌ BigInt 轉換效能：C++ 用 ll 不需要 BigInt（P² ≈ 10¹⁸ < 9.22×10¹⁸）
   但在 JS/TS 中用 BigInt 是必要的。

## 學習理論提醒

你已經完成了 NTT 的完整學習單元。做 fill drill 時 BKT weight 是 0.3（回想階段），trace drill 是 0.5（理解階段），debug drill 是 0.5（診斷階段）。

根據 FSRS 排程：
- 第一複習：24 小時後（做一次 trace drill）
- 第二複習：7 天後（做一次完整實作）
- 第三複習：30 天後（獨立從空白寫出 ntt.cpp）

請教師用 engine_bkt_update 更新學生的 BKT P(L)。`,
      theory: {
        bktWeight: 0.2,
        irtDifficulty: 0.5,
        estimatedMinutes: 30,
        prerequisites: ["A01-inverse"],
        drillRefs: [
          { drillId: "A01-fft-bitrev", mode: "fill", subskill: "ntt-implementation" },
          { drillId: "A01-ntt-convolution", mode: "trace", subskill: "convolution" },
          { drillId: "A01-ntt-modbug", mode: "debug", subskill: "convolution" },
        ],
        evidence: "能從空白檔案寫出完整 NTT + multiply 並通過測試",
        fsrsInitialEF: 2.5,
      },
    },

    // ════════════════════════════════════════════
    // 第七節：變形與應用
    // ════════════════════════════════════════════
    {
      id: "A01-applications",
      title: "變形與應用（賽前衝刺用）",
      content: `## 常見變形

### 1. 多個多項式乘法

分治合併：A·B·C = (A·B)·C，每次 NTT 後截斷再 NTT。
複雜度：O(k log k) 而不是 O(k²)。

### 2. 任意模數 NTT（三模 NTT）

當 P 不是 NTT-friendly 時，用三個 NTT 質數分別計算後用 CRT 合併。
三個質數：998244353, 1004535809, 469762049
乘積 ≈ 4.7×10²⁶ > (10⁹)²，夠 cover 大多數場景。

### 3. 多項式逆元 / 除法 / 開根

進階多項式操作全都依賴 NTT：
  - 多項式逆元：牛頓迭代 O(n log n)
  - 多項式除法：逆元 + 反轉 O(n log n)
  - 多項式 ln / exp / 開根：同樣 O(n log n)

### 題目推薦

1. CF/1842D — NTT 直接應用
2. CF/1733D2 — NTT + DP
3. CF/623D — 生成函數 + NTT
4. CF/1342F — NTT 優化 DP

### 賽前 checklist

□ 能敲出 ntt() 完整實作 < 5 分鐘
□ 知道 n 的計算方式（下一個 2 的冪）
□ 記得三模 NTT 的三個質數
□ 記得 invert=true 的三步驟

現在做一次完整的 code drill：打開 vim，從空白開始寫 ntt.cpp，
計時器啟動。寫完後對照 data/lib/ntt.cpp 檢查。`,
      theory: {
        bktWeight: 0.1,
        irtDifficulty: 1.0,
        estimatedMinutes: 20,
        prerequisites: ["A01-full-implementation"],
        drillRefs: [],
        evidence: "能在 5 分鐘內寫出完整 NTT 並知道三種變形",
        fsrsInitialEF: 2.5,
      },
    },
  ],
}

export default article
