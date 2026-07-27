/**
 * B03 — Miller-Rabin 質數測試 + Pollard-Rho 因數分解
 *
 * 超大數（< 2^64）的質數判定與因數分解，
 * O(k log³ n) + O(n^{1/4})。
 */

// ── Modular helpers（用 BigInt 處理 64-bit）──────────

function mulMod(a: bigint, b: bigint, m: bigint): bigint {
  return a * b % m
}

function powMod(a: bigint, e: bigint, m: bigint): bigint {
  let r = 1n
  a %= m
  while (e > 0n) {
    if (e & 1n) r = mulMod(r, a, m)
    a = mulMod(a, a, m)
    e >>= 1n
  }
  return r
}

// ── Miller-Rabin ───────────────────────────────────────

const WITNESSES = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n]

export function isPrime(n: bigint): boolean {
  if (n < 2n) return false
  if (n % 2n === 0n) return n === 2n

  let d = n - 1n
  let s = 0n
  while (d % 2n === 0n) { d /= 2n; s++ }

  for (const a of WITNESSES) {
    if (a >= n) continue
    let x = powMod(a, d, n)
    if (x === 1n || x === n - 1n) continue

    let composite = true
    for (let r = 0n; r < s; r++) {
      x = mulMod(x, x, n)
      if (x === n - 1n) { composite = false; break }
    }
    if (composite) return false
  }

  return true
}

// ── Pollard-Rho ────────────────────────────────────────

function f(x: bigint, c: bigint, mod: bigint): bigint {
  return (mulMod(x, x, mod) + c) % mod
}

function gcd(a: bigint, b: bigint): bigint {
  while (b) { [a, b] = [b, a % b] }
  return a
}

function pollardRho(n: bigint): bigint {
  if (n % 2n === 0n) return 2n
  if (n % 3n === 0n) return 3n

  while (true) {
    let c = BigInt(Math.floor(Math.random() * 100)) + 1n
    let x = 2n, y = 2n, d = 1n

    while (d === 1n) {
      x = f(x, c, n)
      y = f(f(y, c, n), c, n)
      d = gcd(abs(x - y), n)
    }

    if (d !== n) return d
  }
}

function abs(x: bigint): bigint { return x < 0n ? -x : x }

// ── 因數分解 ──────────────────────────────────────────

export function factorize(n: bigint): bigint[] {
  const factors: bigint[] = []

  const rec = (m: bigint): void => {
    if (m === 1n) return
    if (isPrime(m)) { factors.push(m); return }

    const d = pollardRho(m)
    rec(d)
    rec(m / d)
  }

  rec(n)
  return factors.sort((a, b) => a < b ? -1 : a > b ? 1 : 0)
}

// ── Drill content ──────────────────────────────────────

export const fillDrills: any[] = [
  {
    id: "B03-mr-witness",
    conceptId: "B03-mr-pollard-rho",
    codeTemplate: `function isPrime(n: bigint): boolean {
  if (n < 2n) return false
  if (n % 2n === 0n) return n === 2n
  let d = n - 1n, s = 0n
  while (d % 2n === 0n) { d /= 2n; s++ }

  for (const a of WITNESSES) {
    if (a >= n) continue
    let x = powMod(a, d, n)
    if (x === 1n || x === n - 1n) continue

    let composite = true
    for (let r = 0n; r < s; r++) {
      x = mulMod(x, x, n)
      if (x === n - 1n) { composite = false; break }
    }
    if (composite) return false
  }
  return true
}`,
    blanks: [
      { id: "mr-initial-check", expected: "n === 2n", alternatives: ["n % 2n === 1n", "n == 2n"], subskill: "mr-check", hint: "2 是唯一的偶質數", contextLine: 3 },
      { id: "mr-decomposition", expected: "d % 2n === 0n", alternatives: ["d % 2 == 0", "d % 2n != 0"], subskill: "mr-check", hint: "分解 n-1 = d·2^s", contextLine: 5 },
      { id: "mr-composite-check", expected: "x === n - 1n", alternatives: ["x === 1n", "x === 0n"], subskill: "mr-check", hint: "二次剩餘檢驗", contextLine: 14 },
    ],
    subskill: "miller-rabin",
    partialCredit: true,
    difficulty: 3,
    problems: ["cf/1749E", "boj/4146"],
  },
  {
    id: "B03-pr-fx",
    conceptId: "B03-mr-pollard-rho",
    codeTemplate: `function pollardRho(n: bigint): bigint {
  if (n % 2n === 0n) return 2n
  if (n % 3n === 0n) return 3n
  while (true) {
    let c = BigInt(Math.random() * 100) + 1n
    let x = 2n, y = 2n, d = 1n
    while (d === 1n) {
      x = f(x, c, n)
      y = f(f(y, c, n), c, n)
      d = gcd(abs(x - y), n)
    }
    if (d !== n) return d
  }
}`,
    blanks: [
      { id: "pr-floyd-tortoise", expected: "f(f(y, c, n), c, n)", alternatives: ["f(y, c, n)", "f(y, c, n) * 2"], subskill: "pollard-rho", hint: "Floyd 判圈法：兔子跑兩步", contextLine: 9 },
      { id: "pr-delta", expected: "gcd(abs(x - y), n)", alternatives: ["gcd(x - y, n)", "gcd(x, n)"], subskill: "pollard-rho", hint: "gcd(|兔子−烏龜|, n) 找因數", contextLine: 10 },
      { id: "pr-retry", expected: "d !== n", alternatives: ["d === 1n", "d != 1n"], subskill: "pollard-rho", hint: "找到真因數才回傳，否則重試", contextLine: 12 },
    ],
    subskill: "pollard-rho",
    partialCredit: true,
    difficulty: 4,
    problems: ["boj/4146", "cf/1730E"],
  },
]
