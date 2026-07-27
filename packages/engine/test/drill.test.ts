import { describe, test, expect } from "bun:test"
import {
  DrillType,
  DRILL_BKT_WEIGHT,
  generateLearnStep3Drills,
  generatePhaseConsolidationDrills,
  generateMisconceptionRemediationDrills,
  generateReviewDrills,
  advanceDrill,
  isSessionComplete,
  totalDrillWeight,
  estimatePartialCredit,
} from "../src/drill.ts"

describe("generators", () => {
  test("learn step 3 generates 3 fills + 1 trace", () => {
    const s = generateLearnStep3Drills("recursion", "recursion-basecase")
    expect(s.scenario).toBe("learn_step3")
    expect(s.drills).toHaveLength(4)
    expect(s.drills.filter(d => d.type === "fill")).toHaveLength(3)
    expect(s.drills.filter(d => d.type === "trace")).toHaveLength(1)
  })

  test("phase consolidation generates 2 fills + 1 trace", () => {
    const s = generatePhaseConsolidationDrills("recursion", "recursion-basecase")
    expect(s.scenario).toBe("phase_consolidation")
    expect(s.drills).toHaveLength(3)
    expect(s.drills.filter(d => d.type === "fill")).toHaveLength(2)
    expect(s.drills.filter(d => d.type === "trace")).toHaveLength(1)
  })

  test("misconception remediation generates fill + trace + debug", () => {
    const s = generateMisconceptionRemediationDrills("recursion", "mc-basecase", "recursion-basecase",
      "if (n = 0) return 1;", "if (n == 0) return 1;")
    expect(s.scenario).toBe("misconception_remediation")
    expect(s.drills).toHaveLength(3)
    expect(s.drills.filter(d => d.type === "debug")).toHaveLength(1)
  })

  test("review drills escalate type based on previous errors", () => {
    const prev = [
      { drillType: DrillType.Fill as const, correct: false },
      { drillType: DrillType.Trace as const, correct: true },
    ]
    const s = generateReviewDrills("recursion", prev)
    expect(s.drills).toHaveLength(2)
    expect(s.drills[0].type).toBe("trace")
    expect(s.drills[1].type).toBe("transform")
  })
})

describe("advanceDrill", () => {
  test("moves to next drill on correct", () => {
    const s = generateLearnStep3Drills("rec", "ss")
    const updated = advanceDrill(s, true)
    expect(updated.currentIndex).toBe(1)
    expect(updated.consecutiveCorrect).toBe(1)
  })

  test("stays on same drill with retry on wrong if retries remain", () => {
    const s = generateLearnStep3Drills("rec", "ss")
    const updated = advanceDrill(s, false)
    expect(updated.currentIndex).toBe(0)
    expect(updated.retriesRemaining).toBe(0)
  })

  test("advances on wrong when no retries left", () => {
    const s = { ...generateLearnStep3Drills("rec", "ss"), retriesRemaining: 0 }
    const updated = advanceDrill(s, false)
    expect(updated.currentIndex).toBe(1)
    expect(updated.consecutiveCorrect).toBe(0)
  })

  test("does not advance past last drill", () => {
    let s = generateLearnStep3Drills("rec", "ss")
    for (let i = 0; i < s.drills.length; i++) {
      s = advanceDrill(s, true)
    }
    expect(s.currentIndex).toBe(s.drills.length - 1)
  })
})

describe("isSessionComplete", () => {
  test("returns false at start", () => {
    const s = generateLearnStep3Drills("rec", "ss")
    expect(isSessionComplete(s)).toBe(false)
  })

  test("returns true after completing last drill", () => {
    let s = generateLearnStep3Drills("rec", "ss")
    for (let i = 0; i < s.drills.length; i++) {
      s = advanceDrill(s, true)
    }
    expect(isSessionComplete(s)).toBe(true)
  })
})

describe("totalDrillWeight", () => {
  test("sums BKT weights for all drills", () => {
    const s = generateLearnStep3Drills("rec", "ss")
    const expected = 3 * DRILL_BKT_WEIGHT.fill + DRILL_BKT_WEIGHT.trace
    expect(totalDrillWeight(s)).toBeCloseTo(expected)
  })
})

describe("estimatePartialCredit", () => {
  test("uses llmScore when provided", () => {
    expect(estimatePartialCredit(3, 2, 0.8)).toBe(0.8)
  })

  test("computes from blanks when no LLM score", () => {
    expect(estimatePartialCredit(4, 3)).toBeCloseTo(0.5 + 0.5 * 0.75)
  })

  test("handles zero blanks gracefully", () => {
    expect(estimatePartialCredit(0, 0)).toBeCloseTo(0.5)
  })
})
