/**
 * A02 — 生成函數（Generating Functions）
 *
 * OGF: 組合計數、背包問題封閉形式
 * EGF: 排列、標號結構
 * 模板: 多項式求逆 + 乘法（基於 NTT）
 */

import { multiply, MOD } from "./A01-fft-ntt"

// ── 多項式求逆（基於 NTT）─────────────────────────────

export function polyInv(a: number[], n: number): number[] {
  let res: number[] = [modPow(a[0], MOD - 2)]
  let m = 1
  while (m < n) {
    m <<= 1
    const t = a.slice(0, m)
    while (t.length < m * 2) t.push(0)
    while (res.length < m * 2) res.push(0)
    const mt = multiply(res, t)
    mt[0] = (2 - mt[0] + MOD) % MOD
    for (let i = 1; i < m * 2; i++) mt[i] = (-mt[i] + MOD) % MOD
    res = multiply(res, mt)
    res.length = m
  }
  res.length = n
  return res
}

function modPow(a: number, e: number): number {
  let r = 1
  while (e) {
    if (e & 1) r = Number(BigInt(r) * BigInt(a) % BigInt(MOD))
    a = Number(BigInt(a) * BigInt(a) % BigInt(MOD))
    e >>= 1
  }
  return r
}

// ── OGF 應用範例：卡特蘭數 ────────────────────────────

export function catalanNumbers(n: number): number[] {
  const c: number[] = [1]
  for (let i = 1; i <= n; i++) {
    c.push(Number(BigInt(c[i - 1]) * BigInt(2 * (2 * i - 1)) % BigInt(MOD) * BigInt(modPow(i + 1, MOD - 2)) % BigInt(MOD)))
  }
  return c
}

// ── EGF 應用範例：排列數 ──────────────────────────────

export function factorialMod(n: number): number[] {
  const fact: number[] = [1]
  for (let i = 1; i <= n; i++) fact.push(Number(BigInt(fact[i - 1]) * BigInt(i) % BigInt(MOD)))
  return fact
}

// ── Drill content ──────────────────────────────────────

export const fillDrills = [
  {
    id: "A02-poly-inv",
    conceptId: "A02-generating-functions",
    codeTemplate: `function polyInv(a: number[], n: number): number[] {
  let res: number[] = [modPow(a[0], MOD - 2)]
  let m = 1
  while (m < n) {
    m <<= 1
    const t = a.slice(0, m)
    while (t.length < m * 2) t.push(0)
    while (res.length < m * 2) res.push(0)
    const mt = multiply(res, t)
    mt[0] = (2 - mt[0] + MOD) % MOD
    for (let i = 1; i < m * 2; i++) mt[i] = (-mt[i] + MOD) % MOD
    res = multiply(res, mt)
    res.length = m
  }
  res.length = n
  return res
}`,
    blanks: [
      { id: "inv-initial", expected: "modPow(a[0], MOD - 2)", alternatives: ["1/a[0]", "modInv(a[0])"], subskill: "poly-inv-init", hint: "常數項的模逆元", contextLine: 2 },
      { id: "inv-newton-update", expected: "(2 - mt[0] + MOD) % MOD", alternatives: ["(2 - mt[0])", "1 - mt[0]"], subskill: "poly-inv-newton", hint: "truncated 級數，牛頓法的處理方式", contextLine: 10 },
    ],
    subskill: "polynomial-inverse",
    partialCredit: true,
    difficulty: 4,
  },
]

export const traceDrills = [
  {
    id: "A02-catalan-ogf",
    conceptId: "A02-generating-functions",
    traceCode: `// 卡特蘭數生成函數: C(x) = (1 - sqrt(1 - 4x)) / (2x)
// 遞迴式: C_n = sum_{i=0}^{n-1} C_i * C_{n-1-i}
// 前 5 項:
const c = catalanNumbers(4)
// c = ?`,
    input: "",
    checkpoints: [
      { line: 5, question: "catalanNumbers(4) 回傳？", expected: "[1, 1, 2, 5, 14]", varName: "c" },
    ],
    subskill: "ogf-trace",
    difficulty: 1,
  },
  {
    id: "A02-egf-permutations",
    conceptId: "A02-generating-functions",
    traceCode: `// 排列的 EGF: sum_{n>=0} n! * x^n / n! = 1 / (1 - x)
// factorialMod(4) = 排列數 0! 到 4!
const fact = factorialMod(4)`,
    input: "",
    checkpoints: [
      { line: 4, question: "factorialMod(4) 回傳？", expected: "[1, 1, 2, 6, 24]", varName: "fact" },
    ],
    subskill: "egf-trace",
    difficulty: 1,
  },
]
