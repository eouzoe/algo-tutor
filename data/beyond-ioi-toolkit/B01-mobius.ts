/**
 * B01 — 莫比烏斯反演（Möbius Inversion）
 *
 * Dirichlet 卷積: (f * g)(n) = sum_{d|n} f(d) g(n/d)
 * Möbius 函數 μ(n): 無平方因數時 (-1)^k 否則 0
 * 反演: f(n) = sum_{d|n} g(d) ⇔ g(n) = sum_{d|n} μ(d) f(n/d)
 *
 * 應用: gcd/lcm 計數、互質對計數、因數集合 DP
 */

import { MOD } from "./A01-fft-ntt"

// ── 線性篩求質數 + μ + φ ─────────────────────────

export interface SieveResult {
  primes: number[]
  mu: number[]
  phi: number[]
  isComposite: boolean[]
}

export function linearSieve(n: number): SieveResult {
  const primes: number[] = []
  const mu = new Array(n + 1).fill(0)
  const phi = new Array(n + 1).fill(0)
  const isComposite = new Array(n + 1).fill(false)
  mu[1] = 1
  phi[1] = 1

  for (let i = 2; i <= n; i++) {
    if (!isComposite[i]) {
      primes.push(i)
      mu[i] = -1
      phi[i] = i - 1
    }
    for (const p of primes) {
      if (i * p > n) break
      isComposite[i * p] = true
      if (i % p === 0) {
        mu[i * p] = 0
        phi[i * p] = phi[i] * p
        break
      } else {
        mu[i * p] = -mu[i]
        phi[i * p] = phi[i] * (p - 1)
      }
    }
  }

  return { primes, mu, phi, isComposite }
}

// ── Dirichlet 卷積（暴力 O(n log n)）───────────────

export function dirichletConvolution(f: number[], g: number[]): number[] {
  const n = f.length - 1
  const h = new Array(n + 1).fill(0)
  for (let d = 1; d <= n; d++) {
    for (let m = d; m <= n; m += d) {
      h[m] = (h[m] + f[d] * g[Math.floor(m / d)]) % MOD
    }
  }
  return h
}

// ── Möbius 反演範例：互質對計數 ─────────────────────

export function coprimePairs(arr: number[], maxVal: number): number {
  const cnt = new Array(maxVal + 1).fill(0)
  for (const x of arr) cnt[x]++

  const f = new Array(maxVal + 1).fill(0) // f[d] = count of pairs with gcd divisible by d
  for (let d = 1; d <= maxVal; d++) {
    let s = 0
    for (let m = d; m <= maxVal; m += d) s += cnt[m]
    f[d] = s * (s - 1) / 2
  }

  const { mu } = linearSieve(maxVal)
  let ans = 0
  for (let d = 1; d <= maxVal; d++) ans += mu[d] * f[d]
  return ans
}

// ── Drill content ──────────────────────────────────────

export const fillDrills = [
  {
    id: "B01-linear-sieve-mu",
    conceptId: "B01-mobius",
    codeTemplate: `function linearSieve(n: number): SieveResult {
  const primes: number[] = []
  const mu = new Array(n + 1).fill(0)
  const phi = new Array(n + 1).fill(0)
  const isComposite = new Array(n + 1).fill(false)
  mu[1] = 1
  phi[1] = 1

  for (let i = 2; i <= n; i++) {
    if (!isComposite[i]) {
      primes.push(i)
      mu[i] = -1
      phi[i] = i - 1
    }
    for (const p of primes) {
      if (i * p > n) break
      isComposite[i * p] = true
      if (i % p === 0) {
        mu[i * p] = 0
        phi[i * p] = phi[i] * p
        break
      } else {
        mu[i * p] = -mu[i]
        phi[i * p] = phi[i] * (p - 1)
      }
    }
  }
  return { primes, mu, phi, isComposite }
}`,
    blanks: [
      { id: "mu-i-p-mod", expected: "i % p === 0", alternatives: ["i % p == 0", "p % i == 0"], subskill: "linear-sieve", hint: "p 是 i 的最小質因數", contextLine: 19 },
      { id: "mu-i-p-zero", expected: "mu[i * p] = 0", alternatives: ["mu[i * p] = -mu[i]", "mu[i * p] = 1"], subskill: "linear-sieve", hint: "i * p 有平方因數 p²", contextLine: 20 },
      { id: "phi-i-p-eq", expected: "phi[i] * p", alternatives: ["phi[i] * (p - 1)", "phi[i] + p"], subskill: "linear-sieve", hint: "phi(i·p) = phi(i)·p 當 p | i", contextLine: 21 },
      { id: "mu-else", expected: "-mu[i]", alternatives: ["mu[i]", "0"], subskill: "linear-sieve", hint: "i*p 多了一個質因數，μ 取負", contextLine: 24 },
    ],
    subskill: "linear-sieve",
    partialCredit: true,
    difficulty: 2,
    problems: ["cf/1740F", "cf/1620E"],
  },
  {
    id: "B01-dirichlet-conv",
    conceptId: "B01-mobius",
    codeTemplate: `function dirichletConvolution(f: number[], g: number[]): number[] {
  const n = f.length - 1
  const h = new Array(n + 1).fill(0)
  for (let d = 1; d <= n; d++) {
    for (let m = d; m <= n; m += d) {
      h[m] = (h[m] + f[d] * g[Math.floor(m / d)]) % MOD
    }
  }
  return h
}`,
    blanks: [
      { id: "dc-inner-loop", expected: "m += d", alternatives: ["m++", "m += f[d]"], subskill: "dirichlet", hint: "遍歷 d 的倍數", contextLine: 5 },
      { id: "dc-index", expected: "g[Math.floor(m / d)]", alternatives: ["g[m / d]", "g[d]"], subskill: "dirichlet", hint: "g 的索引 = m/d", contextLine: 6 },
    ],
    subskill: "dirichlet-convolution",
    partialCredit: true,
    difficulty: 2,
  },
]

export const traceDrills = [
  {
    id: "B01-mobius-coprime",
    conceptId: "B01-mobius",
    traceCode: `// [2, 3, 4, 6] 中互質對數量
const ans = coprimePairs([2, 3, 4, 6], 6)
// 互質對: (2,3), (3,4), (2,3? 已經有了)`,
    input: "",
    checkpoints: [
      { line: 3, question: "互質對數量是？", expected: "3", varName: "ans" },
    ],
    subskill: "mobius-application",
    difficulty: 3,
  },
]

export const debugDrills = [
  {
    id: "B01-sos-vs-dirichlet",
    conceptId: "B01-mobius",
    misconceptionId: "sos-dirichlet-confusion",
    buggyCode: `// SOS DP (子集卷積) vs Dirichlet 卷積（倍數卷積）
// 兩者不同：
// SOS: 遍歷列舉子集（bitmask 維度）
// Dirichlet: 遍歷因數/倍數（整數維度）
// 混淆會導致複雜度分析錯誤`,
    correctCode: `// SOS DP: O(n 2^n) for subset zeta transform
// Dirichlet: O(n log n) for divisor sum zeta transform
// 線索：bitmask → SOS, 因數倍數 → Dirichlet`,
    subskill: "transform-type",
    difficulty: 2,
  },
]
