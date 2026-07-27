/**
 * E03 — Aliens Trick（Lagrange Relaxation / WQS 二分）
 *
 * 用在 DP 有「正好 k 個」限制時：
 * 加入罰則 λ，對 λ 二分搜，讓無限制 DP 恰好選到 k 個。
 *
 * 模板：外層二分 λ，內層去限制 DP。
 */

// ── 通用 Aliens Trick 框架 ────────────────────────────

export interface AlienResult {
  value: number
  count: number
}

export type AlienInner = (lambda: number) => AlienResult

/**
 * 二分搜 λ，使無限制 DP 恰好選 k 個。
 * 注意：題目必須滿足 value(count) 是凹函數（convex）。
 */
export function aliensBinarySearch(
  inner: AlienInner,
  k: number,
  lo: number = -1e9,
  hi: number = 1e9,
  iter: number = 60,
): number {
  let lambda = 0
  for (let i = 0; i < iter; i++) {
    lambda = (lo + hi) / 2
    const res = inner(lambda)
    if (res.count < k) {
      hi = lambda  // 懲罰太重，需要降低懲罰
    } else {
      lo = lambda  // 懲罰太輕，需要提高懲罰
    }
  }
  return lambda
}

// ── 範例：選 k 個物品求最大和 ─────────────────────────

export function maxSumWithK(
  values: number[],
  k: number,
): number {
  const inner = (lambda: number): AlienResult => {
    let sum = 0
    let count = 0
    for (const v of values) {
      const adjusted = v - lambda
      if (adjusted > 0) {
        sum += adjusted
        count++
      }
    }
    return { value: sum, count }
  }

  const lambda = aliensBinarySearch(inner, k)
  const res = inner(lambda)
  return Math.round(res.value + lambda * k)
}

// ── Drill content ──────────────────────────────────────

export const fillDrills = [
  {
    id: "E03-aliens-inner",
    conceptId: "E03-aliens",
    codeTemplate: `function aliensBinarySearch(
  inner: AlienInner,
  k: number,
  lo = -1e9,
  hi = 1e9,
  iter = 60,
): number {
  let lambda = 0
  for (let i = 0; i < iter; i++) {
    lambda = (lo + hi) / 2
    const res = inner(lambda)
    if (res.count < k) {
      hi = lambda
    } else {
      lo = lambda
    }
  }
  return lambda
}`,
    blanks: [
      { id: "aliens-mid", expected: "(lo + hi) / 2", alternatives: ["lo + (hi - lo) / 2", "(lo + hi) >> 1"], subskill: "aliens-binary-search", hint: "二分中間值", contextLine: 14 },
      { id: "aliens-lo-hi-direction", expected: "res.count < k", alternatives: ["res.count > k", "res.count == k"], subskill: "aliens-direction", hint: "count < k 表示懲罰太重，需要降低", contextLine: 16 },
    ],
    subskill: "aliens-binary-search",
    partialCredit: true,
    difficulty: 3,
    problems: ["cf/1661E", "cf/1526E"],
  },
]

export const traceDrills = [
  {
    id: "E03-aliens-trace",
    conceptId: "E03-aliens",
    traceCode: `// 選 k=2 個物品使和最大，values = [5, 3, 1, 4]
// 先理解 λ 從 0 開始二分
const result = maxSumWithK([5, 3, 1, 4], 2)`,
    input: "",
    checkpoints: [
      { line: 4, question: "result 的值是？", expected: "9", varName: "result" },
      { line: 4, question: "為什麼要選 5 和 4 而不是 5 和 3？", expected: "因為 4 的 adjusted > 0 時會優先選大的", varName: "" },
    ],
    subskill: "aliens-execution",
    difficulty: 2,
  },
]

export const debugDrills = [
  {
    id: "E03-aliens-nonconvex",
    conceptId: "E03-aliens",
    misconceptionId: "aliens-non-convex-value",
    buggyCode: `// 錯誤：value(count) 不是凹函數時用 aliens trick
// 例如：選越多個反而邊際效益遞增
// aliens 二分會收斂到錯的答案

// 正確做法：先證明 value(count) 是凹函數
// 即選第 t 個的邊際效益隨 t 遞減`,
    correctCode: `// 使用 aliens trick 前必須確認：
// 1. 最佳值 = dp[k] 是 k 的凹函數
// 2. 無限制 DP 能加入 λ 懲罰
// 3. 無限制 DP 好算`,
    subskill: "aliens-convex-check",
    difficulty: 3,
  },
]
