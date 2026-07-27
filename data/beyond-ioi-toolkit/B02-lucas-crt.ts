/**
 * B02 — 模域進階（exCRT + Lucas + BSGS + 二次剩餘）
 *
 * exCRT: 中國剩餘定理（不互質版本）
 * Lucas: 大組合數 mod 小質數
 * BSGS: 離散對數 baby-step giant-step
 * 二次剩餘: Cipolla 演算法
 */

import { MOD } from "./A01-fft-ntt"

// ── exCRT ──────────────────────────────────────────────

export interface Congruence {
  a: number  // x ≡ a (mod m)
  m: number
}

function mod(x: number, m: number): number {
  return ((x % m) + m) % m
}

function exgcd(a: number, b: number): { g: number; x: number; y: number } {
  if (b === 0) return { g: a, x: 1, y: 0 }
  const r = exgcd(b, a % b)
  return { g: r.g, x: r.y, y: r.x - Math.floor(a / b) * r.y }
}

export function exCRT(eqs: Congruence[]): { x: number; m: number } | null {
  let x = eqs[0].a
  let m = eqs[0].m

  for (let i = 1; i < eqs.length; i++) {
    const { a, m: mi } = eqs[i]
    const { g, x: t } = exgcd(m, mi)
    if ((a - x) % g !== 0) return null
    const lcm = m / g * mi
    x = mod(x + (a - x) / g * t % (mi / g) * m, lcm)
    m = lcm
  }

  return { x, m }
}

// ── Lucas 定理 ─────────────────────────────────────────

function modPow(a: number, e: number, mod: number): number {
  let r = 1
  while (e) {
    if (e & 1) r = Number(BigInt(r) * BigInt(a) % BigInt(mod))
    a = Number(BigInt(a) * BigInt(a) % BigInt(mod))
    e >>= 1
  }
  return r
}

export function lucas(n: number, k: number, p: number): number {
  if (k === 0) return 1
  return Number(BigInt(
    BigInt(lucas(Math.floor(n / p), Math.floor(k / p), p)) *
    BigInt(combModP(n % p, k % p, p))
  ) % BigInt(p))
}

function combModP(n: number, k: number, p: number): number {
  if (k > n) return 0
  let num = 1, den = 1
  for (let i = 1; i <= k; i++) {
    num = Number(BigInt(num) * BigInt(n - i + 1) % BigInt(p))
    den = Number(BigInt(den) * BigInt(i) % BigInt(p))
  }
  return Number(BigInt(num) * BigInt(modPow(den, p - 2, p)) % BigInt(p))
}

// ── BSGS ───────────────────────────────────────────────

export function bsgs(a: number, b: number, p: number): number | null {
  a %= p; b %= p
  if (b === 1) return 0
  const m = Math.ceil(Math.sqrt(p))
  const map = new Map<number, number>()
  let e = 1
  for (let j = 0; j < m; j++) {
    map.set(e, j)
    e = Number(BigInt(e) * BigInt(a) % BigInt(p))
  }
  const factor = modPow(a, p - 1 - m, p)
  e = b
  for (let i = 0; i < m; i++) {
    if (map.has(e)) return i * m + map.get(e)!
    e = Number(BigInt(e) * BigInt(factor) % BigInt(p))
  }
  return null
}

// ── Drill content ──────────────────────────────────────

export const fillDrills = [
  {
    id: "B02-excrt-merge",
    conceptId: "B02-lucas-crt",
    codeTemplate: `function exCRT(eqs: Congruence[]): { x: number; m: number } | null {
  let x = eqs[0].a, m = eqs[0].m

  for (let i = 1; i < eqs.length; i++) {
    const { a, m: mi } = eqs[i]
    const { g, x: t } = exgcd(m, mi)
    if ((a - x) % g !== 0) return null
    const lcm = m / g * mi
    x = mod(x + (a - x) / g * t % (mi / g) * m, lcm)
    m = lcm
  }
  return { x, m }
}`,
    blanks: [
      { id: "excrt-exgcd-arg", expected: "m, mi", alternatives: ["a, m", "mi, m"], subskill: "excrt-merge", hint: "exgcd(m, mi) 求係數", contextLine: 5 },
      { id: "excrt-compatibility", expected: "(a - x) % g !== 0", alternatives: ["(x - a) % g != 0", "a % g != x % g"], subskill: "excrt-merge", hint: "兩式相容條件：差能被 gcd 整除", contextLine: 6 },
      { id: "excrt-lcm", expected: "m / g * mi", alternatives: ["m * mi / g", "mi * m / g"], subskill: "excrt-merge", hint: "合併後的新模數", contextLine: 7 },
    ],
    subskill: "excrt",
    partialCredit: true,
    difficulty: 3,
    problems: ["cf/1716E", "cses/1712"],
  },
  {
    id: "B02-lucas-comb",
    conceptId: "B02-lucas-crt",
    codeTemplate: `function lucas(n: number, k: number, p: number): number {
  if (k === 0) return 1
  return lucas(n / p, k / p, p) * combModP(n % p, k % p, p) % p
}`,
    blanks: [
      { id: "lucas-rec-n", expected: "Math.floor(n / p)", alternatives: ["n / p", "Math.trunc(n / p)"], subskill: "lucas-recursion", hint: "n 除以 p 的整數部分", contextLine: 3 },
      { id: "lucas-rec-k", expected: "Math.floor(k / p)", alternatives: ["k / p", "Math.round(k / p)"], subskill: "lucas-recursion", hint: "k 除以 p 的整數部分", contextLine: 3 },
    ],
    subskill: "lucas",
    partialCredit: true,
    difficulty: 3,
  },
]

export const traceDrills = [
  {
    id: "B02-excrt-trace",
    conceptId: "B02-lucas-crt",
    traceCode: `// x ≡ 2 (mod 3), x ≡ 3 (mod 5), x ≡ 2 (mod 7)
const result = exCRT([
  { a: 2, m: 3 },
  { a: 3, m: 5 },
  { a: 2, m: 7 },
])`,
    input: "",
    checkpoints: [
      { line: 7, question: "最小的正整數解 x 是？", expected: "23", varName: "result.x" },
      { line: 7, question: "通解模數 m 是？", expected: "105", varName: "result.m" },
    ],
    subskill: "excrt-usage",
    difficulty: 2,
  },
  {
    id: "B02-lucas-trace",
    conceptId: "B02-lucas-crt",
    traceCode: `// C(10, 3) mod 7
// 10_7 = 13, 3_7 = 3
// C(1,0) * C(3,3) = 1 * 1 = 1
const result = lucas(10, 3, 7)`,
    input: "",
    checkpoints: [
      { line: 5, question: "result 的值是？", expected: "1", varName: "result" },
      { line: 5, question: "C(10, 3) mod 7 直接算是多少？", expected: "120 mod 7 = 1", varName: "" },
    ],
    subskill: "lucas-usage",
    difficulty: 2,
  },
]
