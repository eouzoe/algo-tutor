/**
 * D01 — Dinic 最大流
 *
 * O(E √V) for unit capacities, O(E V²) worst case.
 * 模板 <60 行。核心：BFS 分層圖 + DFS 增廣。
 */

export class Dinic {
  private n: number
  private graph: Array<{ to: number; rev: number; cap: number }[]>

  constructor(n: number) {
    this.n = n
    this.graph = Array.from({ length: n }, () => [])
  }

  addEdge(from: number, to: number, cap: number): void {
    this.graph[from].push({ to, rev: this.graph[to].length, cap })
    this.graph[to].push({ to: from, rev: this.graph[from].length - 1, cap: 0 })
  }

  maxFlow(s: number, t: number): number {
    let flow = 0
    const level: number[] = new Array(this.n).fill(0)
    const it: number[] = new Array(this.n).fill(0)

    const bfs = (): boolean => {
      level.fill(-1)
      const q: number[] = [s]
      level[s] = 0
      while (q.length) {
        const v = q.shift()!
        for (const e of this.graph[v]) {
          if (e.cap > 0 && level[e.to] < 0) {
            level[e.to] = level[v] + 1
            q.push(e.to)
          }
        }
      }
      return level[t] >= 0
    }

    const dfs = (v: number, f: number): number => {
      if (v === t) return f
      for (let i = it[v]; i < this.graph[v].length; i++) {
        const e = this.graph[v][i]
        if (e.cap > 0 && level[v] < level[e.to]) {
          const d = dfs(e.to, Math.min(f, e.cap))
          if (d > 0) {
            e.cap -= d
            this.graph[e.to][e.rev].cap += d
            return d
          }
        }
        it[v]++
      }
      return 0
    }

    while (bfs()) {
      it.fill(0)
      while (true) {
        const f = dfs(s, Infinity)
        if (f === 0) break
        flow += f
      }
    }

    return flow
  }
}

// ── Drill content ──────────────────────────────────────

export const fillDrills = [
  {
    id: "D01-dinic-struct",
    conceptId: "D01-dinic",
    codeTemplate: `class Dinic {
  private n: number
  private graph: Array<{ to: number; rev: number; cap: number }[]>

  constructor(n: number) {
    this.n = n
    this.graph = Array.from({ length: n }, () => [])
  }

  addEdge(from: number, to: number, cap: number): void {
    this.graph[from].push({ to, rev: this.graph[to].length, cap })
    this.graph[to].push({ to: from, rev: this.graph[from].length - 1, cap: 0 })
  }

  maxFlow(s: number, t: number): number {
    let flow = 0
    const level = new Array(this.n).fill(0)
    const it = new Array(this.n).fill(0)

    const bfs = (): boolean => {
      level.fill(-1)
      const q = [s]
      level[s] = 0
      while (q.length) {
        const v = q.shift()!
        for (const e of this.graph[v]) {
          if (e.cap > 0 && level[e.to] < 0) {
            level[e.to] = level[v] + 1
            q.push(e.to)
          }
        }
      }
      return level[t] >= 0
    }

    const dfs = (v: number, f: number): number => {
      if (v === t) return f
      for (let i = it[v]; i < this.graph[v].length; i++) {
        const e = this.graph[v][i]
        if (e.cap > 0 && level[v] < level[e.to]) {
          const d = dfs(e.to, Math.min(f, e.cap))
          if (d > 0) {
            e.cap -= d
            this.graph[e.to][e.rev].cap += d
            return d
          }
        }
        it[v]++
      }
      return 0
    }

    while (bfs()) {
      it.fill(0)
      while (true) {
        const f = dfs(s, Infinity)
        if (f === 0) break
        flow += f
      }
    }
    return flow
  }
}`,
    blanks: [
      { id: "dinic-edge-rev-f", expected: "this.graph[to].length", alternatives: ["this.graph[from].length", "graph[to].length"], subskill: "dinic-add-edge", hint: "正向邊的 rev 指向反向邊在 graph[to] 中的位置", contextLine: 12 },
      { id: "dinic-edge-rev-r", expected: "this.graph[from].length - 1", alternatives: ["this.graph[to].length", "this.graph[from].length"], subskill: "dinic-add-edge", hint: "反向邊的 rev 指向正向邊（剛剛 push 的）的位置", contextLine: 13 },
      { id: "dinic-level-condition", expected: "level[e.to] < 0", alternatives: ["level[e.to] == -1", "level[e.to] < level[v]"], subskill: "dinic-bfs", hint: "未訪問（層級未設定）", contextLine: 24 },
      { id: "dinic-dfs-condition", expected: "level[v] < level[e.to]", alternatives: ["level[v] + 1 == level[e.to]", "level[e.to] > level[v]"], subskill: "dinic-dfs", hint: "只往下一層走", contextLine: 35 },
      { id: "dinic-dfs-residual", expected: "Math.min(f, e.cap)", alternatives: ["e.cap", "f"], subskill: "dinic-dfs", hint: "可流過的流量不能超過邊容量", contextLine: 36 },
    ],
    subskill: "dinic-implementation",
    partialCredit: true,
    difficulty: 3,
    problems: ["cf/1783E", "cf/1416D"],
  },
]

export const traceDrills = [
  {
    id: "D01-dinic-trace",
    conceptId: "D01-dinic",
    traceCode: `const dinic = new Dinic(4)
dinic.addEdge(0, 1, 10)
dinic.addEdge(0, 2, 5)
dinic.addEdge(1, 2, 15)
dinic.addEdge(1, 3, 10)
dinic.addEdge(2, 3, 10)
const flow = dinic.maxFlow(0, 3)`,
    input: "",
    checkpoints: [
      { line: 8, question: "maxFlow(0, 3) 回傳值是多少？", expected: "15", varName: "flow" },
      { line: 8, question: "第一次 BFS 後 level[3] = ?", expected: "2", varName: "level[3]" },
    ],
    subskill: "dinic-execution",
    difficulty: 2,
  },
]

export const debugDrills = [
  {
    id: "D01-dinic-no-rev",
    conceptId: "D01-dinic",
    misconceptionId: "dinic-forgot-reverse-edge",
    buggyCode: `addEdge(from, to, cap) {
  graph[from].push({ to, rev: -1, cap })
  // 沒有建立反向邊
}

// 結果：第一次增廣後就無法退流，答案會錯`,
    correctCode: `addEdge(from, to, cap) {
  graph[from].push({ to, rev: graph[to].length, cap })
  graph[to].push({ to: from, rev: graph[from].length - 1, cap: 0 })
}`,
    subskill: "dinic-debug",
    difficulty: 1,
  },
]
