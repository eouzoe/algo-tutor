/**
 * E04 — Plug DP / 輪廓線 DP（Broken Profile DP）
 *
 * 用在棋盤覆蓋、Hamiltonian path 計數問題。
 * 典型：1×2 骨牌覆蓋 n×m 棋盤，狀態壓縮在輪廓線上的 m 格。
 *
 * 狀態編碼：m 位二進位（或三進位 for Hamiltonian path）
 * 轉移：按格推進，更新輪廓線狀態。
 */

// ── 範例：1×2 骨牌覆蓋（domino tiling）────────────

export function dominoTiling(h: number, w: number): number {
  const MOD = 1e9 + 7
  const dp: number[] = new Array(1 << w).fill(0)
  dp[0] = 1

  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w; col++) {
      const next: number[] = new Array(1 << w).fill(0)
      for (let mask = 0; mask < 1 << w; mask++) {
        if (dp[mask] === 0) continue
        // 水平放（佔用 (r,c) 和 (r,c+1)）
        if (col + 1 < w && !(mask & (1 << col)) && !(mask & (1 << (col + 1)))) {
          const nmask = mask | (1 << col) | (1 << (col + 1))
          next[nmask] = (next[nmask] + dp[mask]) % MOD
        }
        // 垂直放（佔用 (r,c) 和 (r+1,c)）
        if (!(mask & (1 << col))) {
          const nmask = mask | (1 << col)  // 在 col 位置設 1 表示下一行已被佔用
          next[nmask] = (next[nmask] + dp[mask]) % MOD
        }
        // 不放（已被上方蓋住）
        if (mask & (1 << col)) {
          next[mask ^ (1 << col)] = (next[mask ^ (1 << col)] + dp[mask]) % MOD
        }
      }
      dp.length = 0
      dp.push(...next)
    }
    // 換行：狀態右移一位（輪廓線重新對齊）
    const shifted: number[] = new Array(1 << w).fill(0)
    for (let mask = 0; mask < 1 << w; mask++) {
      if (dp[mask]) shifted[mask >> 1] = (shifted[mask >> 1] + dp[mask]) % MOD
    }
    dp.length = 0
    dp.push(...shifted)
  }

  return dp[0]
}

// ── Drill content ──────────────────────────────────────

export const fillDrills: any[] = [
  {
    id: "E04-plug-dp-transition",
    conceptId: "E04-plug-dp",
    codeTemplate: `function dominoTiling(h: number, w: number): number {
  const dp: number[] = new Array(1 << w).fill(0)
  dp[0] = 1

  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w; col++) {
      const next: number[] = new Array(1 << w).fill(0)
      for (let mask = 0; mask < 1 << w; mask++) {
        if (dp[mask] === 0) continue

        // 水平放
        if (col + 1 < w &&
            !(mask & (1 << col)) &&
            !(mask & (1 << (col + 1)))) {
          next[mask | (1 << col) | (1 << (col + 1))] =
            (next[mask | (1 << col) | (1 << (col + 1))] + dp[mask]) % MOD
        }

        // 垂直放
        if (!(mask & (1 << col))) {
          next[mask | (1 << col)] =
            (next[mask | (1 << col)] + dp[mask]) % MOD
        }

        // 被上方蓋住，不新放
        if (mask & (1 << col)) {
          next[mask ^ (1 << col)] =
            (next[mask ^ (1 << col)] + dp[mask]) % MOD
        }
      }
      dp.length = 0; dp.push(...next)
    }
    // 換行
    const shifted: number[] = new Array(1 << w).fill(0)
    for (let mask = 0; mask < 1 << w; mask++) {
      if (dp[mask]) shifted[mask >> 1] = (shifted[mask >> 1] + dp[mask]) % MOD
    }
    dp.length = 0; dp.push(...shifted)
  }
  return dp[0]
}`,
    blanks: [
      { id: "plug-horiz-cond1", expected: "!(mask & (1 << col))", alternatives: ["(mask & (1 << col)) == 0", "!((mask >> col) & 1)"], subskill: "plug-transition", hint: "水平格當前列未被佔用", contextLine: 14 },
      { id: "plug-horiz-cond2", expected: "(1 << (col + 1))", alternatives: ["(1 << col)", "(1 << (col - 1))"], subskill: "plug-transition", hint: "水平需要蓋住下一列", contextLine: 15 },
      { id: "plug-vert-mask", expected: "mask | (1 << col)", alternatives: ["mask ^ (1 << col)", "mask"], subskill: "plug-transition", hint: "垂直放設當前位為 1 表示下一行已被佔", contextLine: 22 },
      { id: "plug-skip-clear", expected: "mask ^ (1 << col)", alternatives: ["mask & ~(1 << col)", "mask >> 1"], subskill: "plug-transition", hint: "當前格被蓋住，清除該位表示處理完畢", contextLine: 28 },
      { id: "plug-shift", expected: "mask >> 1", alternatives: ["mask << 1", "mask"], subskill: "plug-row-wrap", hint: "換行時輪廓線向右偏移一位", contextLine: 35 },
    ],
    subskill: "plug-dp-domino",
    partialCredit: true,
    difficulty: 4,
    problems: ["cses/2181", "boj/1648"],
  },
]

export const traceDrills: any[] = [
  {
    id: "E04-plug-2x3",
    conceptId: "E04-plug-dp",
    traceCode: `// 2×3 棋盤的骨牌覆蓋數
const ans = dominoTiling(2, 3)
// 2×3 棋盤，全橫放有 1 種，直立+橫放...`,
    input: "",
    checkpoints: [
      { line: 4, question: "2×3 棋盤的覆蓋數是？", expected: "3", varName: "ans" },
    ],
    subskill: "plug-trace",
    difficulty: 3,
  },
]
