/**
 * G01 — 後綴自動機（Suffix Automaton, SAM）
 *
 * 線性構造。每個狀態代表一組 endpos 等價的子字串。
 * 可求：本質不同子串數、最長共同子串、第 k 小子串。
 */

export interface SAMState {
  len: number
  link: number
  next: Map<number, number>
}

export class SAM {
  states: SAMState[] = [{ len: 0, link: -1, next: new Map() }]
  last = 0

  extend(c: number): void {
    const p = this.last
    const cur = this.states.length
    this.states.push({ len: this.states[p].len + 1, link: 0, next: new Map() })
    this.last = cur

    let v = p
    while (v >= 0 && !this.states[v].next.has(c)) {
      this.states[v].next.set(c, cur)
      v = this.states[v].link
    }

    if (v < 0) {
      this.states[cur].link = 0
    } else {
      const q = this.states[v].next.get(c)!
      if (this.states[v].len + 1 === this.states[q].len) {
        this.states[cur].link = q
      } else {
        const clone = this.states.length
        this.states.push({
          len: this.states[v].len + 1,
          link: this.states[q].link,
          next: new Map(this.states[q].next),
        })
        while (v >= 0 && this.states[v].next.get(c) === q) {
          this.states[v].next.set(c, clone)
          v = this.states[v].link
        }
        this.states[q].link = clone
        this.states[cur].link = clone
      }
    }
  }

  build(s: string): void {
    for (const ch of s) this.extend(ch.charCodeAt(0))
  }

  distinctSubstrings(): number {
    return this.states.reduce((sum, s) => sum + s.len - this.states[s.link].len, 0) - 1
  }

  longestCommonSubstring(t: string): number {
    let v = 0, l = 0, ans = 0
    for (const ch of t) {
      const c = ch.charCodeAt(0)
      while (v >= 0 && !this.states[v].next.has(c)) {
        v = this.states[v].link
        if (v >= 0) l = this.states[v].len
      }
      if (v < 0) {
        v = 0; l = 0
      } else {
        v = this.states[v].next.get(c)!
        l++
        ans = Math.max(ans, l)
      }
    }
    return ans
  }
}

// ── Drill content ──────────────────────────────────────

export const fillDrills = [
  {
    id: "G01-sam-extend",
    conceptId: "G01-sam",
    codeTemplate: `  extend(c: number): void {
    const p = this.last
    const cur = this.states.length
    this.states.push({
      len: this.states[p].len + 1,
      link: 0,
      next: new Map()
    })
    this.last = cur

    let v = p
    while (v >= 0 && !this.states[v].next.has(c)) {
      this.states[v].next.set(c, cur)
      v = this.states[v].link
    }

    if (v < 0) {
      this.states[cur].link = 0
    } else {
      const q = this.states[v].next.get(c)!
      if (this.states[v].len + 1 === this.states[q].len) {
        this.states[cur].link = q
      } else {
        const clone = this.states.length
        this.states.push({
          len: this.states[v].len + 1,
          link: this.states[q].link,
          next: new Map(this.states[q].next),
        })
        while (v >= 0 && this.states[v].next.get(c) === q) {
          this.states[v].next.set(c, clone)
          v = this.states[v].link
        }
        this.states[q].link = clone
        this.states[cur].link = clone
      }
    }
  }`,
    blanks: [
      { id: "sam-last-len", expected: "this.states[p].len + 1", alternatives: ["p + 1", "this.states[p].len"], subskill: "sam-construction", hint: "新狀態的長度 = last 狀態長度 + 1", contextLine: 4 },
      { id: "sam-set-transition", expected: "this.states[v].next.set(c, cur)", alternatives: ["this.states[v].next.set(c, q)", "states[v].next.set(c, cur)"], subskill: "sam-construction", hint: "設定轉移邊指向新狀態", contextLine: 14 },
      { id: "sam-clone-len", expected: "this.states[v].len + 1", alternatives: ["this.states[q].len", "this.states[p].len"], subskill: "sam-clone", hint: "clone 狀態的長度 = v 的長度 + 1", contextLine: 31 },
      { id: "sam-clone-link", expected: "this.states[q].link", alternatives: ["this.states[v].link", "this.states[cur].link"], subskill: "sam-clone", hint: "clone 的 link = q 原本的 link", contextLine: 32 },
    ],
    subskill: "sam-implementation",
    partialCredit: true,
    difficulty: 4,
    problems: ["cf/149E", "cf/1787E"],
  },
]

export const traceDrills = [
  {
    id: "G01-sam-distinct",
    conceptId: "G01-sam",
    traceCode: `const sam = new SAM()
sam.build("abc")
const distinct = sam.distinctSubstrings()
// "abc" 的所有子串: "a","b","c","ab","bc","abc"`,
    input: "",
    checkpoints: [
      { line: 4, question: "distinct 的值是？", expected: "6", varName: "distinct" },
    ],
    subskill: "sam-count",
    difficulty: 2,
  },
  {
    id: "G01-sam-lcs",
    conceptId: "G01-sam",
    traceCode: `const sam = new SAM()
sam.build("ababc")
const lcs = sam.longestCommonSubstring("babba")
// 最長共同子串是 "bab" 或 "aba"`,
    input: "",
    checkpoints: [
      { line: 5, question: "lcs 的值是？", expected: "3", varName: "lcs" },
    ],
    subskill: "sam-lcs",
    difficulty: 2,
  },
]
