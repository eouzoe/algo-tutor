import { describe, it, expect } from "bun:test"
import { bktUpdate, bktUpdateAfterExam } from "../src/bkt.ts"

const defaultParams = { pL0: 0.3, pT: 0.4, pG: 0.2, pS: 0.1 }

describe("BKT update", () => {
  it("correct answer increases P(L)", () => {
    const result = bktUpdate(0.5, defaultParams, { correct: true })
    expect(result).toBeGreaterThan(0.5)
    expect(result).toBeCloseTo(0.913, 2)
  })

  it("incorrect answer decreases P(L)", () => {
    const result = bktUpdate(0.5, defaultParams, { correct: false })
    expect(result).toBeLessThan(0.5)
  })

  it("approaches 1.0 with repeated correct answers", () => {
    let pL = 0.3
    for (let i = 0; i < 10; i++) {
      pL = bktUpdate(pL, defaultParams, { correct: true })
    }
    expect(pL).toBeGreaterThan(0.99)
  })

  it("exam weight boosts posterior more", () => {
    const normal = bktUpdate(0.5, defaultParams, { correct: true })
    const exam = bktUpdateAfterExam(0.5, defaultParams, true)
    expect(exam).toBeGreaterThan(normal)
  })

  it("soft evidence updates correctly", () => {
    const result = bktUpdate(0.5, defaultParams, {
      correct: true,
      softEvidence: { probCorrect: 0.8, weight: 0.7 },
    })
    expect(result).toBeGreaterThan(0.5)
    expect(result).toBeLessThan(0.9)
  })

  it("pL stays in [0, 1] range", () => {
    const result = bktUpdate(0.999, defaultParams, { correct: true, softEvidence: { probCorrect: 0.99, weight: 0.3 } })
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(1)
  })

  it("repeated incorrect from high pL drops significantly", () => {
    let pL = 0.95
    for (let i = 0; i < 5; i++) {
      pL = bktUpdate(pL, defaultParams, { correct: false })
    }
    expect(pL).toBeLessThan(0.8)
  })
})
