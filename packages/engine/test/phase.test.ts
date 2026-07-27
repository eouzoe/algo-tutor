import { describe, it, expect } from "bun:test"
import { Phase, type ConceptState } from "../src/types.ts"
import { computePhaseTransition, reviewCompleted, detectOscillation } from "../src/phase.ts"

function makeState(overrides: Partial<ConceptState> = {}): ConceptState {
  return {
    conceptId: "test-concept",
    phase: Phase.Learn,
    pL: 0.5,
    bkt: { pL0: 0.3, pT: 0.4, pG: 0.2, pS: 0.1 },
    learnStep: 0,
    fadingStage: 1,
    oscillationCount: 0,
    consecutiveCorrect: 0,
    drillInterrupted: false,
    activeMisconceptions: [],
    ...overrides,
  }
}

describe("phase transition matrix", () => {
  it("learn → practice when P(L) reaches 0.8", () => {
    const r = computePhaseTransition(makeState({ phase: Phase.Learn, pL: 0.85 }))
    expect(r.to).toBe(Phase.Practice)
    expect(r.reason).toContain("升級")
  })

  it("learn → locked when P(L) drops below 0.6", () => {
    const r = computePhaseTransition(makeState({ phase: Phase.Learn, pL: 0.3 }))
    expect(r.to).toBe(Phase.Locked)
    expect(r.reason).toContain("退回")
  })

  it("practice → exam when P(L) ≥ 0.9", () => {
    const r = computePhaseTransition(makeState({ phase: Phase.Practice, pL: 0.92 }))
    expect(r.to).toBe(Phase.Exam)
  })

  it("practice → learn when P(L) drops to 0.6-0.79", () => {
    const r = computePhaseTransition(makeState({ phase: Phase.Practice, pL: 0.7 }))
    expect(r.to).toBe(Phase.Learn)
  })

  it("exam → review when P(L) drops to 0.8-0.89", () => {
    const r = computePhaseTransition(makeState({ phase: Phase.Exam, pL: 0.85 }))
    expect(r.to).toBe(Phase.Review)
    expect(r.reviewDrills).toBe(4)
  })

  it("exam → mastered when exam passed", () => {
    const r = computePhaseTransition(makeState({ phase: Phase.Exam, pL: 0.95 }), true)
    expect(r.to).toBe(Phase.Mastered)
  })

  it("exam → practice when P(L) drops below 0.6", () => {
    const r = computePhaseTransition(makeState({ phase: Phase.Exam, pL: 0.4 }))
    expect(r.to).toBe(Phase.Practice)
  })

  it("mastered stays mastered regardless of P(L)", () => {
    const r1 = computePhaseTransition(makeState({ phase: Phase.Mastered, pL: 0.99 }))
    expect(r1.to).toBe(Phase.Mastered)
    const r2 = computePhaseTransition(makeState({ phase: Phase.Mastered, pL: 0.3 }))
    expect(r2.to).toBe(Phase.Mastered)
  })
})

describe("review sub-phase", () => {
  it("review → exam when P(L) recovered ≥ 0.9", () => {
    const r = reviewCompleted(makeState({ phase: Phase.Review, pL: 0.92 }))
    expect(r.to).toBe(Phase.Exam)
  })

  it("review → practice when P(L) still < 0.9", () => {
    const r = reviewCompleted(makeState({ phase: Phase.Review, pL: 0.85 }))
    expect(r.to).toBe(Phase.Practice)
  })
})

describe("oscillation detection", () => {
  it("detects learn↔practice cycle at threshold", () => {
    const s = makeState({ phase: Phase.Practice, oscillationCount: 2 })
    const r = { from: Phase.Practice, to: Phase.Learn, reason: "test" }
    const alarmed = detectOscillation(s, r)
    expect(alarmed).toBe(true)
    expect(s.oscillationCount).toBe(3)
  })

  it("does not alarm below threshold", () => {
    const s = makeState({ phase: Phase.Practice, oscillationCount: 1 })
    const r = { from: Phase.Practice, to: Phase.Learn, reason: "test" }
    expect(detectOscillation(s, r)).toBe(false)
    expect(s.oscillationCount).toBe(2)
  })

  it("resets on non-oscillation transition", () => {
    const s = makeState({ phase: Phase.Practice, oscillationCount: 2 })
    const r = { from: Phase.Practice, to: Phase.Practice, reason: "stay" }
    detectOscillation(s, r)
    expect(s.oscillationCount).toBe(0)
  })
})
