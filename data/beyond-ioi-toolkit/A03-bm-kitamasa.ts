/**
 * A03 — Berlekamp-Massey + Kitamasa
 *
 * BM: 從序列反推最小線性遞迴式（O(n²)）
 * Kitamasa: O(k² log n) 求線性遞迴第 n 項
 */

export const MOD = 998244353

// ── Berlekamp-Massey ───────────────────────────────────

function mod(x: number): number {
  return ((x % MOD) + MOD) % MOD
}

export function berlekampMassey(seq: number[]): number[] {
  const n = seq.length
  let C: number[] = [1]
  let B: number[] = [1]
  let L = 0
  let m = 1
  let b = 1

  for (let i = 0; i < n; i++) {
    let d = seq[i]
    for (let j = 1; j <= L; j++) d = mod(d + C[j] * seq[i - j])

    if (d === 0) {
      m++
    } else {
      const T = C.slice()
      const factor = mod(d * modPow(b, MOD - 2))
      while (C.length < B.length + m) C.push(0)
      for (let j = 0; j < B.length; j++) C[j + m] = mod(C[j + m] - factor * B[j])

      if (2 * L <= i) {
        L = i + 1 - L
        B = T
        b = d
        m = 1
      } else {
        m++
      }
    }
  }

  return C.slice(1) // 遞迴係數
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

// ── Kitamasa ───────────────────────────────────────────

function polyMul(a: number[], b: number[], c: number[]): number[] {
  const k = c.length
  const tmp: number[] = new Array(2 * k).fill(0)
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      tmp[i + j] = mod(tmp[i + j] + Number(BigInt(a[i]) * BigInt(b[j]) % BigInt(MOD)))
    }
  }
  for (let i = 2 * k - 2; i >= k; i--) {
    for (let j = 1; j <= k; j++) {
      tmp[i - j] = mod(tmp[i - j] + Number(BigInt(tmp[i]) * BigInt(c[k - j]) % BigInt(MOD)))
    }
  }
  tmp.length = k
  return tmp
}

export function kitamasa(n: number, init: number[], coeff: number[]): number {
  const k = coeff.length
  if (n < k) return init[n]

  let x: number[] = new Array(k).fill(0)
  x[0] = 1
  let y: number[] = new Array(k).fill(0)
  y[1] = 1

  while (n) {
    if (n & 1) x = polyMul(x, y, coeff)
    y = polyMul(y, y, coeff)
    n >>= 1
  }

  let ans = 0
  for (let i = 0; i < k; i++) ans = mod(ans + Number(BigInt(x[i]) * BigInt(init[i]) % BigInt(MOD)))
  return ans
}

// ── Drill content ──────────────────────────────────────

export const fillDrills = [
  {
    id: "A03-bm-seq-diff",
    conceptId: "A03-bm-kitamasa",
    codeTemplate: `function berlekampMassey(seq: number[]): number[] {
  const n = seq.length
  let C: number[] = [1]
  let B: number[] = [1]
  let L = 0, m = 1, b = 1

  for (let i = 0; i < n; i++) {
    let d = seq[i]
    for (let j = 1; j <= L; j++)
      d = mod(d + C[j] * seq[i - j])

    if (d === 0) { m++ }
    else {
      const T = C.slice()
      const factor = mod(d * modPow(b, MOD - 2))
      while (C.length < B.length + m) C.push(0)
      for (let j = 0; j < B.length; j++)
        C[j + m] = mod(C[j + m] - factor * B[j])

      if (2 * L <= i) { L = i + 1 - L; B = T; b = d; m = 1 }
      else { m++ }
    }
  }
  return C.slice(1)
}`,
    blanks: [
      { id: "bm-d-initial", expected: "seq[i]", alternatives: ["seq[0]", "0"], subskill: "bm-discrepancy", hint: "差距 d 起始為當前項", contextLine: 8 },
      { id: "bm-d-accum", expected: "C[j] * seq[i - j]", alternatives: ["B[j] * seq[i-j]", "C[j] * seq[j]"], subskill: "bm-discrepancy", hint: "累加 C_j * s_{i-j}", contextLine: 10 },
      { id: "bm-factor", expected: "b", alternatives: ["C[0]", "d"], subskill: "bm-update", hint: "factor = d / last_b", contextLine: 14 },
      { id: "bm-return", expected: "C.slice(1)", alternatives: ["C", "B.slice(1)"], subskill: "bm-output", hint: "回傳除去常數項後的係數", contextLine: 24 },
    ],
    subskill: "berlekamp-massey",
    partialCredit: true,
    difficulty: 4,
    problems: ["cf/1806E", "cf/1912A"],
  },
  {
    id: "A03-kitamasa-poly-mul",
    conceptId: "A03-bm-kitamasa",
    codeTemplate: `function polyMul(a: number[], b: number[], c: number[]): number[] {
  const k = c.length
  const tmp: number[] = new Array(2 * k).fill(0)
  for (let i = 0; i < k; i++)
    for (let j = 0; j < k; j++)
      tmp[i + j] = mod(tmp[i + j] + a[i] * b[j])

  for (let i = 2 * k - 2; i >= k; i--)
    for (let j = 1; j <= k; j++)
      tmp[i - j] = mod(tmp[i - j] + tmp[i] * c[k - j])

  tmp.length = k
  return tmp
}`,
    blanks: [
      { id: "km-tmp-init", expected: "0", alternatives: ["null", "undefined"], subskill: "kitamasa-mul", hint: "初始值必須為 0", contextLine: 3 },
      { id: "km-mod-reduce-start", expected: "2 * k - 2", alternatives: ["2*k - 1", "k*2"], subskill: "kitamasa-reduce", hint: "從最高次項開始降次", contextLine: 9 },
      { id: "km-coeff-access", expected: "c[k - j]", alternatives: ["c[j - 1]", "c[j]"], subskill: "kitamasa-reduce", hint: "遞迴係數順序：c[0] 是最高次係數？注意索引", contextLine: 11 },
    ],
    subskill: "kitamasa",
    partialCredit: true,
    difficulty: 4,
  },
]

export const traceDrills = [
  {
    id: "A03-bm-trace",
    conceptId: "A03-bm-kitamasa",
    traceCode: `// 求 Fibonacci: 1 1 2 3 5 的遞迴式
const seq = [1, 1, 2, 3, 5]
const coeff = berlekampMassey(seq)
// coeff = ?`,
    input: "",
    checkpoints: [
      { line: 4, question: "coeff 的值是？", expected: "[1, 1]", varName: "coeff" },
      { line: 4, question: "用 coeff 表示的遞迴式是？", expected: "s_n = s_{n-1} + s_{n-2}", varName: "" },
    ],
    subskill: "bm-trace",
    difficulty: 2,
  },
  {
    id: "A03-kitamasa-trace",
    conceptId: "A03-bm-kitamasa",
    traceCode: `// Fibonacci: init=[0,1], coeff=[1,1], 求第 10 項
const ans = kitamasa(10, [0, 1], [1, 1])`,
    input: "",
    checkpoints: [
      { line: 3, question: "ans 的值是？", expected: "55", varName: "ans" },
    ],
    subskill: "kitamasa-trace",
    difficulty: 2,
  },
]

export const debugDrills = [
  {
    id: "A03-bm-no-mod",
    conceptId: "A03-bm-kitamasa",
    misconceptionId: "bm-forgot-mod",
    buggyCode: `function berlekampMassey(seq) {
  const n = seq.length
  let C = [1], B = [1], L = 0, m = 1, b = 1
  for (let i = 0; i < n; i++) {
    let d = seq[i]
    for (let j = 1; j <= L; j++) d += C[j] * seq[i - j]
    if (d === 0) { m++ }
    else {
      const T = C.slice()
      const factor = d / b
      while (C.length < B.length + m) C.push(0)
      for (let j = 0; j < B.length; j++) C[j + m] -= factor * B[j]
      if (2 * L <= i) { L = i + 1 - L; B = T; b = d; m = 1 }
      else { m++ }
    }
  }
  return C.slice(1)
}`,
    correctCode: `// 缺少 mod 導致 overflow + 因數非整數除法
// 每處 d += 改為 mod(d + ...)
// factor = d / b 改為 mod(d * modPow(b, MOD-2))
// C[j+m] -= 改為 mod(C[j+m] - factor * B[j])
`,
    subskill: "bm-mod",
    difficulty: 3,
  },
]
