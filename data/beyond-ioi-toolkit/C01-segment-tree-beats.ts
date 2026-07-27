/**
 * C01 — 線段樹 Beats（Segment Tree Beats）
 *
 * 支援區間取 min/max + 區間求和。
 * 關鍵：維護區間最大值/次大值/最大值的出現次數，
 * 當「要取的 min 值 ≥ 區間最大值」→ 跳過，
 * 「≥ 次大值」→ 只更新最大值，否則遞迴。
 *
 * 勢能分析：每個值最多被更新 O(log C) 次，總 O((n+q) log n log C)。
 */

// ── 區間 chmin + 區間和 ──────────────────────────────

export class SegTreeBeats {
  private n: number
  private sum: bigint[] = []
  private mx1: number[] = []
  private mx2: number[] = []
  private cnt: number[] = []

  constructor(arr: number[]) {
    this.n = arr.length
    const size = 4 * this.n
    this.sum = new Array(size).fill(0n)
    this.mx1 = new Array(size).fill(0)
    this.mx2 = new Array(size).fill(-1)
    this.cnt = new Array(size).fill(0)
    this._build(arr, 1, 0, this.n - 1)
  }

  private _build(arr: number[], idx: number, l: number, r: number): void {
    if (l === r) {
      this.sum[idx] = BigInt(arr[l])
      this.mx1[idx] = arr[l]
      this.mx2[idx] = -1
      this.cnt[idx] = 1
      return
    }
    const m = (l + r) >> 1
    this._build(arr, idx * 2, l, m)
    this._build(arr, idx * 2 + 1, m + 1, r)
    this._pull(idx)
  }

  private _pull(idx: number): void {
    const lc = idx * 2, rc = idx * 2 + 1
    this.sum[idx] = this.sum[lc] + this.sum[rc]
    // 合併最大值
    if (this.mx1[lc] === this.mx1[rc]) {
      this.mx1[idx] = this.mx1[lc]
      this.mx2[idx] = Math.max(this.mx2[lc], this.mx2[rc])
      this.cnt[idx] = this.cnt[lc] + this.cnt[rc]
    } else if (this.mx1[lc] > this.mx1[rc]) {
      this.mx1[idx] = this.mx1[lc]
      this.mx2[idx] = Math.max(this.mx2[lc], this.mx1[rc])
      this.cnt[idx] = this.cnt[lc]
    } else {
      this.mx1[idx] = this.mx1[rc]
      this.mx2[idx] = Math.max(this.mx1[lc], this.mx2[rc])
      this.cnt[idx] = this.cnt[rc]
    }
  }

  private _pushDown(idx: number, l: number, r: number): void {
    if (l === r) return
    // 如果父節點的最大值小於子節點的最大值，更新子節點
    this._chminNode(idx * 2, this.mx1[idx])
    this._chminNode(idx * 2 + 1, this.mx1[idx])
  }

  private _chminNode(idx: number, x: number): void {
    if (x >= this.mx1[idx]) return
    this.sum[idx] -= BigInt(this.cnt[idx]) * BigInt(this.mx1[idx] - x)
    this.mx1[idx] = x
  }

  rangeChmin(ql: number, qr: number, x: number): void {
    this._chmin(1, 0, this.n - 1, ql, qr, x)
  }

  private _chmin(idx: number, l: number, r: number, ql: number, qr: number, x: number): void {
    if (ql > r || qr < l) return
    if (ql <= l && r <= qr && this.mx2[idx] < x) {
      this._chminNode(idx, x)
      return
    }
    if (l === r) return
    this._pushDown(idx, l, r)
    const m = (l + r) >> 1
    this._chmin(idx * 2, l, m, ql, qr, x)
    this._chmin(idx * 2 + 1, m + 1, r, ql, qr, x)
    this._pull(idx)
  }

  rangeSum(ql: number, qr: number): bigint {
    return this._query(1, 0, this.n - 1, ql, qr)
  }

  private _query(idx: number, l: number, r: number, ql: number, qr: number): bigint {
    if (ql > r || qr < l) return 0n
    if (ql <= l && r <= qr) return this.sum[idx]
    this._pushDown(idx, l, r)
    const m = (l + r) >> 1
    return this._query(idx * 2, l, m, ql, qr) + this._query(idx * 2 + 1, m + 1, r, ql, qr)
  }
}

// ── Drill content ──────────────────────────────────────

export const fillDrills: any[] = [
  {
    id: "C01-beats-pull",
    conceptId: "C01-segment-tree-beats",
    codeTemplate: `private _pull(idx: number): void {
  const lc = idx * 2, rc = idx * 2 + 1
  this.sum[idx] = this.sum[lc] + this.sum[rc]
  if (this.mx1[lc] === this.mx1[rc]) {
    this.mx1[idx] = this.mx1[lc]
    this.mx2[idx] = Math.max(this.mx2[lc], this.mx2[rc])
    this.cnt[idx] = this.cnt[lc] + this.cnt[rc]
  } else if (this.mx1[lc] > this.mx1[rc]) {
    this.mx1[idx] = this.mx1[lc]
    this.mx2[idx] = Math.max(this.mx2[lc], this.mx1[rc])
    this.cnt[idx] = this.cnt[lc]
  } else {
    this.mx1[idx] = this.mx1[rc]
    this.mx2[idx] = Math.max(this.mx1[lc], this.mx2[rc])
    this.cnt[idx] = this.cnt[rc]
  }
}`,
    blanks: [
      { id: "beats-pull-sum", expected: "this.sum[lc] + this.sum[rc]", alternatives: ["this.sum[idx*2] + this.sum[idx*2+1]", "this.sum[lc] - this.sum[rc]"], subskill: "beats-pull", hint: "區間和 = 兩子樹和相加", contextLine: 3 },
      { id: "beats-pull-eq-cnt", expected: "this.cnt[lc] + this.cnt[rc]", alternatives: ["Math.max(cnt[lc], cnt[rc])", "cnt[lc]"], subskill: "beats-pull", hint: "最大值相同時，計數相加", contextLine: 8 },
      { id: "beats-pull-lc-bigger", expected: "Math.max(this.mx2[lc], this.mx1[rc])", alternatives: ["Math.max(mx2[lc], mx2[rc])", "mx2[lc]"], subskill: "beats-pull", hint: "左大於右時，次大 = max(左次大, 右最大)", contextLine: 11 },
    ],
    subskill: "segment-tree-beats",
    partialCredit: true,
    difficulty: 5,
    problems: ["cf/1572C", "cf/1665E", "cf/1749F"],
  },
  {
    id: "C01-beats-chmin",
    conceptId: "C01-segment-tree-beats",
    codeTemplate: `private _chmin(idx: number, l: number, r: number,
                  ql: number, qr: number, x: number): void {
  if (ql > r || qr < l) return
  if (ql <= l && r <= qr && this.mx2[idx] < x) {
    this._chminNode(idx, x)
    return
  }
  if (l === r) return
  this._pushDown(idx, l, r)
  const m = (l + r) >> 1
  this._chmin(idx * 2, l, m, ql, qr, x)
  this._chmin(idx * 2 + 1, m + 1, r, ql, qr, x)
  this._pull(idx)
}

private _chminNode(idx: number, x: number): void {
  if (x >= this.mx1[idx]) return
  this.sum[idx] -= BigInt(this.cnt[idx]) * BigInt(this.mx1[idx] - x)
  this.mx1[idx] = x
}`,
    blanks: [
      { id: "beats-chmin-guard", expected: "this.mx2[idx] < x", alternatives: ["this.mx1[idx] < x", "x >= this.mx1[idx]"], subskill: "beats-chmin", hint: "x > 次大值 → 只需更新最大值們", contextLine: 3 },
      { id: "beats-node-guard", expected: "x >= this.mx1[idx]", alternatives: ["x < this.mx1[idx]", "x <= this.mx1[idx]"], subskill: "beats-node", hint: "x 不小於最大值 → 不用更新", contextLine: 15 },
    ],
    subskill: "segment-tree-beats",
    partialCredit: true,
    difficulty: 5,
    problems: ["cf/1572C", "cf/1665E", "cf/1749F"],
  },
]
