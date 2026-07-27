/**
 * C03 — Wavelet Matrix
 *
 * 靜態陣列上的資料結構，支援 O(log σ) 操作：
 *   - rank(c, pos): 前 pos 個元素中 c 出現次數
 *   - kth(l, r, k): 區間第 k 小
 *   - rangeFreq(l, r, lo, hi): 區間內值在 [lo, hi) 的個數
 *
 * 原理：對 bit 層建立 bit vector（0/1 序列），
 * 每層將陣列分成「bit=0（去左）」和「bit=1（去右）」。
 */

// ── Bit vector with rank ───────────────────────────────

class BitVector {
  private blocks: Uint32Array
  private prefix: Uint32Array
  readonly n: number

  constructor(bits: number[]) {
    this.n = bits.length
    const blockCount = Math.ceil(this.n / 32) + 1
    this.blocks = new Uint32Array(blockCount)
    this.prefix = new Uint32Array(blockCount)

    for (let i = 0; i < this.n; i++) {
      if (bits[i]) this.blocks[Math.floor(i / 32)] |= 1 << (i % 32)
    }

    let acc = 0
    for (let i = 0; i < blockCount; i++) {
      this.prefix[i] = acc
      acc += popcount(this.blocks[i])
    }
  }

  rank1(pos: number): number {
    if (pos <= 0) return 0
    if (pos >= this.n) pos = this.n
    const blockIdx = Math.floor((pos - 1) / 32)
    const bitIdx = (pos - 1) % 32
    const mask = this.blocks[blockIdx] & ((1 << (bitIdx + 1)) - 1)
    return this.prefix[blockIdx] + popcount(mask)
  }

  rank0(pos: number): number {
    return pos - this.rank1(pos)
  }
}

function popcount(x: number): number {
  x = x - ((x >>> 1) & 0x55555555)
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333)
  x = (x + (x >>> 4)) & 0x0f0f0f0f
  return (x * 0x01010101) >>> 24
}

// ── Wavelet Matrix ─────────────────────────────────────

export class WaveletMatrix {
  private layers: BitVector[] = []
  private zeroCount: number[] = []
  private maxVal: number
  private maxBit: number
  readonly n: number

  constructor(arr: number[], maxVal: number) {
    this.n = arr.length
    this.maxVal = maxVal
    this.maxBit = maxVal <= 0 ? 1 : Math.floor(Math.log2(maxVal)) + 1

    let cur = [...arr]
    for (let b = this.maxBit - 1; b >= 0; b--) {
      const bits: number[] = []
      const zeros: number[] = []
      const ones: number[] = []
      for (const v of cur) {
        const bit = (v >> b) & 1
        bits.push(bit)
        if (bit === 0) zeros.push(v)
        else ones.push(v)
      }
      this.layers.push(new BitVector(bits))
      this.zeroCount.push(zeros.length)
      cur = [...zeros, ...ones]
    }
  }

  kth(l: number, r: number, k: number): number {
    let result = 0
    let cl = l, cr = r
    for (let b = this.maxBit - 1; b >= 0; b--) {
      const l0 = this.layers[this.maxBit - 1 - b].rank0(cl)
      const r0 = this.layers[this.maxBit - 1 - b].rank0(cr)
      const cnt0 = r0 - l0
      if (k < cnt0) {
        cl = l0
        cr = r0
      } else {
        k -= cnt0
        result |= (1 << b)
        const total0 = this.zeroCount[this.maxBit - 1 - b]
        cl = total0 + (cl - l0)
        cr = total0 + (cr - r0)
      }
    }
    return result
  }

  rangeFreq(l: number, r: number, lo: number, hi: number): number {
    if (lo >= hi || l >= r) return 0
    const freqHi = this._freqLess(l, r, hi)
    const freqLo = this._freqLess(l, r, lo)
    return freqHi - freqLo
  }

  private _freqLess(l: number, r: number, x: number): number {
    if (x >= (1 << this.maxBit)) return r - l
    let cl = l, cr = r
    for (let b = this.maxBit - 1; b >= 0; b--) {
      const l0 = this.layers[this.maxBit - 1 - b].rank0(cl)
      const r0 = this.layers[this.maxBit - 1 - b].rank0(cr)
      const bit = (x >> b) & 1
      if (bit) {
        cl = this.zeroCount[this.maxBit - 1 - b] + (cl - l0)
        cr = this.zeroCount[this.maxBit - 1 - b] + (cr - r0)
      } else {
        cl = l0
        cr = r0
      }
    }
    return cl - l  // 走到最後，cl = 小於 x 的個數
  }
}

// ── Drill content ──────────────────────────────────────

export const fillDrills: any[] = [
  {
    id: "C03-wavelet-build",
    conceptId: "C03-wavelet-matrix",
    codeTemplate: `constructor(arr: number[], maxVal: number) {
  this.n = arr.length
  this.maxVal = maxVal
  this.maxBit = maxVal <= 0 ? 1
    : Math.floor(Math.log2(maxVal)) + 1

  let cur = [...arr]
  for (let b = this.maxBit - 1; b >= 0; b--) {
    const bits: number[] = []
    const zeros: number[] = []
    const ones: number[] = []
    for (const v of cur) {
      const bit = (v >> b) & 1
      bits.push(bit)
      if (bit === 0) zeros.push(v)
      else ones.push(v)
    }
    this.layers.push(new BitVector(bits))
    this.zeroCount.push(zeros.length)
    cur = [...zeros, ...ones]
  }
}`,
    blanks: [
      { id: "wm-bit-extract", expected: "(v >> b) & 1", alternatives: ["v & (1 << b)", "(v >>> b) & 1"], subskill: "wm-construction", hint: "取第 b 位", contextLine: 17 },
      { id: "wm-layer-order", expected: "this.maxBit - 1 - b", alternatives: ["b", "maxBit - b"], subskill: "wm-construction", hint: "layers 索引從 MSB 開始", contextLine: 23 },
      { id: "wm-zero-count", expected: "zeros.length", alternatives: ["zeros.length / n", "bits.length - ones.length"], subskill: "wm-construction", hint: "該層 0 的數量", contextLine: 24 },
    ],
    subskill: "wavelet-matrix",
    partialCredit: true,
    difficulty: 4,
    problems: ["cf/1917E", "boj/1653"],
  },
]

export const traceDrills: any[] = [
  {
    id: "C03-wavelet-kth",
    conceptId: "C03-wavelet-matrix",
    traceCode: `const wm = new WaveletMatrix([3, 1, 4, 1, 5, 9, 2, 6], 16)
const k2 = wm.kth(0, 8, 1)  // 區間 [0,8) 第 1 小
const k5 = wm.kth(0, 8, 4)  // 區間 [0,8) 第 4 小`,
    input: "",
    checkpoints: [
      { line: 3, question: "k2 的值是？", expected: "1", varName: "k2" },
      { line: 4, question: "k5 的值是？", expected: "3", varName: "k5" },
    ],
    subskill: "wm-kth",
    difficulty: 3,
  },
]
