/**
 * E01 — 凸包優化（Convex Hull Trick, CHT）
 *
 * 斜率單調 → deque 維護 O(n)
 * 任意斜率 → Li Chao 線段樹 O(n log C)
 *
 * DP 形式: dp[i] = min_{j < i} (m_j * x_i + b_j)
 * 用 deque 保持凸包（斜率遞增），查詢 x 遞增時直接 pop front。
 */

// ── deque CHT（斜率單調遞增，查詢 x 單調遞增）───────

interface Line {
  m: number  // 斜率
  b: number  // 截距
}

export class DequeCHT {
  private lines: Line[] = []

  add(m: number, b: number): void {
    const l: Line = { m, b }
    while (this.lines.length >= 2 && this.bad(this.lines[this.lines.length - 2], this.lines[this.lines.length - 1], l)) {
      this.lines.pop()
    }
    this.lines.push(l)
  }

  private bad(l1: Line, l2: Line, l3: Line): boolean {
    // (b3 - b1)(m1 - m2) <= (b2 - b1)(m1 - m3)
    return (BigInt(l3.b - l1.b) * BigInt(l1.m - l2.m)) <= (BigInt(l2.b - l1.b) * BigInt(l1.m - l3.m))
  }

  query(x: number): number {
    while (this.lines.length >= 2 && this.value(this.lines[0], x) >= this.value(this.lines[1], x)) {
      this.lines.shift()
    }
    return this.value(this.lines[0], x)
  }

  private value(l: Line, x: number): number {
    return l.m * x + l.b
  }
}

// ── Li Chao 線段樹（任意斜率）─────────────────────────

export class LiChaoTree {
  private xs: number[]
  private tree: Line[]
  private size: number

  constructor(xs: number[]) {
    this.xs = xs
    this.size = 1
    while (this.size < xs.length) this.size <<= 1
    // 注意: 這裡的 segment tree 建立在離散的 x 座標上
    this.tree = new Array(this.size * 2)
    for (let i = 0; i < this.size * 2; i++) {
      this.tree[i] = { m: 0, b: Infinity }
    }
  }

  addLine(m: number, b: number): void {
    this._add(m, b, 0, 0, this.size - 1, this.xs)
  }

  private _add(m: number, b: number, idx: number, l: number, r: number, xs: number[]): void {
    const mid = (l + r) >> 1
    const xl = xs[l] ?? l
    const xr = xs[r] ?? r
    const xm = xs[mid] ?? mid

    const cur = this.tree[idx]
    const curL = cur.m * xl + cur.b
    const curR = cur.m * xr + cur.b
    const newL = m * xl + b
    const newR = m * xr + b

    if (curL <= newL && curR <= newR) return
    if (curL >= newL && curR >= newR) { this.tree[idx] = { m, b }; return }

    const curM = cur.m * xm + cur.b
    const newM = m * xm + b

    if (newM < curM) [this.tree[idx], m, b] = [{ m, b }, cur.m, cur.b]

    if (l === r) return
    // 比較左右端點決定遞迴方向
    if (m * xl + b < cur.m * xl + cur.b) {
      this._add(m, b, idx * 2 + 1, l, mid, xs)
    } else {
      this._add(m, b, idx * 2 + 2, mid + 1, r, xs)
    }
  }

  query(x: number): number {
    const idx = this.xs.indexOf(x)
    if (idx < 0) return Infinity

    let res = Infinity
    let i = 0
    let l = 0, r = this.size - 1

    while (true) {
      const val = this.tree[i].m * x + this.tree[i].b
      if (val < res) res = val
      if (l === r) break
      const mid = (l + r) >> 1
      if (idx <= mid) {
        i = i * 2 + 1
        r = mid
      } else {
        i = i * 2 + 2
        l = mid + 1
      }
    }

    return res
  }
}

// ── Drill content ──────────────────────────────────────

export const fillDrills = [
  {
    id: "E01-deque-cht-bad",
    conceptId: "E01-cht",
    codeTemplate: `class DequeCHT {
  private lines: Line[] = []

  add(m: number, b: number): void {
    const l: Line = { m, b }
    while (this.lines.length >= 2 &&
           this.bad(
             this.lines[this.lines.length - 2],
             this.lines[this.lines.length - 1],
             l,
           )) {
      this.lines.pop()
    }
    this.lines.push(l)
  }

  private bad(l1: Line, l2: Line, l3: Line): boolean {
    return (b3 - b1)(m1 - m2) <= (b2 - b1)(m1 - m3)
  }

  query(x: number): number {
    while (this.lines.length >= 2 &&
           this.value(this.lines[0], x) >= this.value(this.lines[1], x)) {
      this.lines.shift()
    }
    return this.value(this.lines[0], x)
  }
}`,
    blanks: [
      { id: "cht-lines-length", expected: "2", alternatives: ["1", "3"], subskill: "cht-bad-check", hint: "需要至少兩條線才能判斷是否 bad", contextLine: 14 },
      { id: "cht-bad-formula-b3", expected: "l3.b - l1.b", alternatives: ["l2.b - l1.b", "l3.b - l2.b"], subskill: "cht-bad-check", hint: "檢查 l3 插入後 l2 是否是多餘的", contextLine: 23 },
      { id: "cht-bad-formula-m1-m2", expected: "l1.m - l2.m", alternatives: ["l1.m - l3.m", "l2.m - l1.m"], subskill: "cht-bad-check", hint: "斜率差", contextLine: 23 },
      { id: "cht-pop-front", expected: "this.lines[0]", alternatives: ["this.lines[1]", "this.lines[0], this.lines[1]"], subskill: "cht-query", hint: "查詢 x 遞增時，pop 掉較差的第一條線", contextLine: 29 },
    ],
    subskill: "deque-cht",
    partialCredit: true,
    difficulty: 3,
  },
]

export const traceDrills = [
  {
    id: "E01-cht-trace",
    conceptId: "E01-cht",
    traceCode: `const cht = new DequeCHT()
cht.add(2, 0)    // y = 2x
cht.add(1, 3)    // y = x + 3
cht.add(-1, 10)  // y = -x + 10
const q1 = cht.query(0)  // x=0 時最小值
const q2 = cht.query(5)  // x=5 時最小值`,
    input: "",
    checkpoints: [
      { line: 6, question: "q1 (x=0) 的值是？", expected: "3", varName: "q1" },
      { line: 7, question: "q2 (x=5) 的值是？", expected: "5", varName: "q2" },
    ],
    subskill: "cht-execution",
    difficulty: 2,
  },
]
