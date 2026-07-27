/**
 * A01 — FFT / NTT（Number Theoretic Transform）
 *
 * Iterative Cooley-Tukey NTT, O(n log n).
 * Prime: 998244353 (119 * 2^23 + 1), primitive root = 3.
 */

export const MOD = 998244353
export const ROOT = 3

export function modPow(a: number, e: number, mod: number = MOD): number {
  let r = 1
  while (e) {
    if (e & 1) r = Number(BigInt(r) * BigInt(a) % BigInt(mod))
    a = Number(BigInt(a) * BigInt(a) % BigInt(mod))
    e >>= 1
  }
  return r
}

export function ntt(a: number[], invert: boolean): void {
  const n = a.length
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) [a[i], a[j]] = [a[j], a[i]]
  }

  for (let len = 2; len <= n; len <<= 1) {
    const wlen = modPow(ROOT, (MOD - 1) / len)
    for (let i = 0; i < n; i += len) {
      let w = 1
      for (let j = 0; j < len / 2; j++) {
        const u = a[i + j]
        const v = Number(BigInt(a[i + j + len / 2]) * BigInt(w) % BigInt(MOD))
        a[i + j] = (u + v) % MOD
        a[i + j + len / 2] = (u - v + MOD) % MOD
        w = Number(BigInt(w) * BigInt(wlen) % BigInt(MOD))
      }
    }
  }

  if (invert) {
    const invN = modPow(n, MOD - 2)
    for (let i = 0; i < n; i++) a[i] = Number(BigInt(a[i]) * BigInt(invN) % BigInt(MOD))
    a.reverse()
  }
}

export function multiply(a: number[], b: number[]): number[] {
  const n = 1 << (Math.ceil(Math.log2(a.length + b.length - 1)))
  const fa = [...a, ...new Array(n - a.length).fill(0)]
  const fb = [...b, ...new Array(n - b.length).fill(0)]
  ntt(fa, false)
  ntt(fb, false)
  for (let i = 0; i < n; i++) fa[i] = Number(BigInt(fa[i]) * BigInt(fb[i]) % BigInt(MOD))
  ntt(fa, true)
  fa.length = a.length + b.length - 1
  return fa
}

// ── Drill content ──────────────────────────────────────

export const fillDrills: any[] = [
  {
    type: "fill",
    id: "A01-fft-bitrev",
    conceptId: "A01-fft-ntt",
    codeTemplate: `function ntt(a: number[], invert: boolean) {
  const n = a.length
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) [a[i], a[j]] = [a[j], a[i]]
  }
  for (let len = 2; len <= n; len <<= 1) {
    const wlen = modPow(ROOT, (MOD - 1) / len)
    for (let i = 0; i < n; i += len) {
      let w = 1
      for (let j = 0; j < len / 2; j++) {
        const u = a[i + j]
        const v = Number(BigInt(a[i + j + len / 2]) * BigInt(w) % BigInt(MOD))
        a[i + j] = (u + v) % MOD
        a[i + j + len / 2] = (u - v + MOD) % MOD
        w = Number(BigInt(w) * BigInt(wlen) % BigInt(MOD))
      }
    }
  }
  if (invert) {
    const invN = modPow(n, MOD - 2)
    for (let i = 0; i < n; i++) a[i] = Number(BigInt(a[i]) * BigInt(invN) % BigInt(MOD))
    a.reverse()
  }
}`,
    blanks: [
      { id: "bitrev-loop", expected: "i < n", alternatives: ["i != n", "i <= n"], subskill: "bit-reversal", hint: "bit-reversal 的終止條件", contextLine: 3 },
      { id: "len-loop", expected: "len <= n", alternatives: ["len < n", "len < a.length"], subskill: "cooley-tukey", hint: "外層長度倍增的終止條件", contextLine: 13 },
      { id: "butterfly-u", expected: "a[i + j]", alternatives: ["a[i]", "a[j]", "a[i+j]"], subskill: "butterfly", hint: "蝶形運算的左側取值", contextLine: 19 },
      { id: "butterfly-v", expected: "a[i + j + len / 2]", alternatives: ["a[i + len/2]", "a[j + len/2]"], subskill: "butterfly", hint: "蝶形運算的右側取值", contextLine: 20 },
    ],
    subskill: "ntt-implementation",
    partialCredit: true,
    difficulty: 3,
    problems: ["cf/1842D", "cf/1733D2"],
  },
]

export const traceDrills = [
  {
    id: "A01-ntt-convolution",
    conceptId: "A01-fft-ntt",
    traceCode: `function multiply(a, b) {
  const n = 1 << (ceil(log2(a.length + b.length - 1)))
  const fa = a.concat(new Array(n - a.length).fill(0))
  const fb = b.concat(new Array(n - b.length).fill(0))
  ntt(fa, false)
  ntt(fb, false)
  for (let i = 0; i < n; i++) fa[i] = fa[i] * fb[i] % MOD
  ntt(fa, true)
  return fa.slice(0, a.length + b.length - 1)
}`,
    input: "multiply([1, 2, 3], [4, 5, 6])",
    checkpoints: [
      { line: 2, question: "n 的值為？", expected: "8", varName: "n" },
      { line: 7, question: "迴圈結束後 fa 每個元素代表什麼？", expected: "頻域逐點相乘結果", varName: "fa" },
      { line: 9, question: "回傳陣列的長度為？", expected: "5", varName: "result" },
    ],
    subskill: "convolution",
    difficulty: 3,
  },
]

export const debugDrills = [
  {
    id: "A01-ntt-modbug",
    conceptId: "A01-fft-ntt",
    misconceptionId: "ntt-no-mod",
    buggyCode: `function multiply(a, b) {
  const n = 1 << (ceil(log2(a.length + b.length - 1)))
  const fa = [...a, ...new Array(n - a.length).fill(0)]
  const fb = [...b, ...new Array(n - b.length).fill(0)]
  ntt(fa, false)
  ntt(fb, false)
  for (let i = 0; i < n; i++) fa[i] = fa[i] * fb[i]
  ntt(fa, true)
  return fa
}`,
    correctCode: `function multiply(a, b) {
  const n = 1 << (ceil(log2(a.length + b.length - 1)))
  const fa = [...a, ...new Array(n - a.length).fill(0)]
  const fb = [...b, ...new Array(n - b.length).fill(0)]
  ntt(fa, false); ntt(fb, false)
  for (let i = 0; i < n; i++)
    fa[i] = Number(BigInt(fa[i]) * BigInt(fb[i]) % BigInt(MOD))
  ntt(fa, true)
  return fa.slice(0, a.length + b.length - 1)
}`,
    subskill: "convolution",
    difficulty: 2,
  },
]
