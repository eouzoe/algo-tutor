/**
 * G03 — 後綴陣列（Suffix Array）+ LCP
 *
 * 倍增法 O(n log n) 構建 SA 與 rank 陣列。
 * Kasai 演算法 O(n) 構建 LCP（最長共同前綴）。
 *
 * 應用：重複子串、子串比對、差別子串計數、最長共同子串。
 */

// ── SA-IS 簡化版：倍增法 ─────────────────────────────

export function buildSA(s: string): number[] {
  const n = s.length
  if (n === 0) return []

  const sa: number[] = new Array(n).fill(0)
  const rank: number[] = new Array(n).fill(0)
  const tmp: number[] = new Array(n).fill(0)

  for (let i = 0; i < n; i++) { sa[i] = i; rank[i] = s.charCodeAt(i) }

  let k = 1
  const compare = (i: number, j: number): number => {
    if (rank[i] !== rank[j]) return rank[i] - rank[j]
    const ri = i + k < n ? rank[i + k] : -1
    const rj = j + k < n ? rank[j + k] : -1
    return ri - rj
  }

  while (true) {
    sa.sort(compare)
    tmp[sa[0]] = 0
    for (let i = 1; i < n; i++) {
      tmp[sa[i]] = tmp[sa[i - 1]] + (compare(sa[i - 1], sa[i]) < 0 ? 1 : 0)
    }
    for (let i = 0; i < n; i++) rank[i] = tmp[i]
    if (rank[sa[n - 1]] === n - 1) break
    k <<= 1
  }

  return sa
}

export function buildRank(sa: number[]): number[] {
  const rank: number[] = new Array(sa.length).fill(0)
  for (let i = 0; i < sa.length; i++) rank[sa[i]] = i
  return rank
}

// ── Kasai: LCP ─────────────────────────────────────────

export function buildLCP(s: string, sa: number[]): number[] {
  const n = s.length
  const rank = buildRank(sa)
  const lcp: number[] = new Array(n).fill(0)
  let h = 0

  for (let i = 0; i < n; i++) {
    if (rank[i] === 0) { h = 0; continue }
    const j = sa[rank[i] - 1]
    while (i + h < n && j + h < n && s[i + h] === s[j + h]) h++
    lcp[rank[i]] = h
    if (h > 0) h--
  }

  return lcp
}

// ── 應用：本質不同子串數 ─────────────────────────────

export function distinctSubstrings(s: string): number {
  if (s.length === 0) return 0
  const sa = buildSA(s)
  const lcp = buildLCP(s, sa)
  const total = s.length * (s.length + 1) / 2
  const lcpSum = lcp.reduce((a, b) => a + b, 0)
  return total - lcpSum
}

// ── Drill content ──────────────────────────────────────

export const fillDrills: any[] = [
  {
    id: "G03-sa-bucketed",
    conceptId: "G03-suffix-array",
    codeTemplate: `function buildSA(s: string): number[] {
  const n = s.length
  const sa: number[] = new Array(n).fill(0)
  const rank: number[] = new Array(n).fill(0)
  const tmp: number[] = new Array(n).fill(0)

  for (let i = 0; i < n; i++) { sa[i] = i; rank[i] = s.charCodeAt(i) }

  let k = 1
  const compare = (i: number, j: number): number => {
    if (rank[i] !== rank[j]) return rank[i] - rank[j]
    const ri = i + k < n ? rank[i + k] : -1
    const rj = j + k < n ? rank[j + k] : -1
    return ri - rj
  }

  while (true) {
    sa.sort(compare)
    tmp[sa[0]] = 0
    for (let i = 1; i < n; i++) {
      tmp[sa[i]] = tmp[sa[i - 1]] + (compare(sa[i - 1], sa[i]) < 0 ? 1 : 0)
    }
    for (let i = 0; i < n; i++) rank[i] = tmp[i]
    if (rank[sa[n - 1]] === n - 1) break
    k <<= 1
  }
  return sa
}`,
    blanks: [
      { id: "sa-init-rank", expected: "s.charCodeAt(i)", alternatives: ["s.charCodeAt(i) - 97", "i"], subskill: "sa-construction", hint: "初始 rank = 字元 ASCII", contextLine: 7 },
      { id: "sa-ri-out-of-bounds", expected: "i + k < n ? rank[i + k] : -1", alternatives: ["rank[i + k] ?? -1", "i + k >= n ? -1 : rank[i + k]"], subskill: "sa-construction", hint: "第二關鍵字越界時給 -1（最小）", contextLine: 11 },
      { id: "sa-unique-rank", expected: "rank[sa[n - 1]] === n - 1", alternatives: ["tmp[n-1] == n-1", "rank[n-1] == n-1"], subskill: "sa-construction", hint: "全部 rank 不同 → 排序完成", contextLine: 22 },
    ],
    subskill: "suffix-array",
    partialCredit: true,
    difficulty: 3,
    problems: ["cses/1754", "cf/1730E"],
  },
  {
    id: "G03-lcp-kasai",
    conceptId: "G03-suffix-array",
    codeTemplate: `function buildLCP(s: string, sa: number[]): number[] {
  const n = s.length
  const rank = buildRank(sa)
  const lcp: number[] = new Array(n).fill(0)
  let h = 0
  for (let i = 0; i < n; i++) {
    if (rank[i] === 0) { h = 0; continue }
    const j = sa[rank[i] - 1]
    while (i + h < n && j + h < n && s[i + h] === s[j + h]) h++
    lcp[rank[i]] = h
    if (h > 0) h--
  }
  return lcp
}`,
    blanks: [
      { id: "lcp-rank-0", expected: "rank[i] === 0", alternatives: ["i === 0", "rank[i] === 1"], subskill: "lcp-kasai", hint: "rank=0 表示沒有前一個後綴", contextLine: 6 },
      { id: "lcp-prev-sa", expected: "sa[rank[i] - 1]", alternatives: ["sa[rank[i]]", "sa[i - 1]"], subskill: "lcp-kasai", hint: "rank[i] 前一個後綴的起始位置", contextLine: 7 },
      { id: "lcp-decrement", expected: "h > 0", alternatives: ["h--", "h -= 1"], subskill: "lcp-kasai", hint: "LCP(i+1) ≥ LCP(i) - 1", contextLine: 10 },
    ],
    subskill: "lcp-kasai",
    partialCredit: true,
    difficulty: 3,
    problems: ["cses/1754", "cf/1730E"],
  },
]

export const traceDrills: any[] = [
  {
    id: "G03-sa-trace",
    conceptId: "G03-suffix-array",
    traceCode: `const sa = buildSA("banana")
// banana 的後綴陣列：1-ana, 5-a, 3-anana, ...`,
    input: "",
    checkpoints: [
      { line: 3, question: "SA[0] 的值是？", expected: "5", varName: "sa[0]" },
      { line: 3, question: "SA[1] 的值是？", expected: "3", varName: "sa[1]" },
    ],
    subskill: "sa-execution",
    difficulty: 2,
  },
  {
    id: "G03-distinct-trace",
    conceptId: "G03-suffix-array",
    traceCode: `const ds = distinctSubstrings("banana")
// "banana" 所有子串數：6*7/2 = 21
// LCP sum 扣除重複的`,
    input: "",
    checkpoints: [
      { line: 4, question: "distinctSubstrings 的值是？", expected: "15", varName: "ds" },
    ],
    subskill: "distinct-substrings",
    difficulty: 2,
  },
]
