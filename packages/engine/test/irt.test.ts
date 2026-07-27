import { describe, test, expect } from "bun:test"
import { irt3pl, irt2pl, estimateTheta, thetaSE, itemInformation, expectedScore, logLikelihood } from "../src/irt.ts"

describe("irt3pl", () => {
  test("returns c when theta → -∞", () => {
    expect(irt3pl(-10, 1, 0, 0.25)).toBeCloseTo(0.25, 2)
  })

  test("returns 1 when theta → +∞", () => {
    expect(irt3pl(10, 1, 0, 0.25)).toBeCloseTo(1, 2)
  })

  test("returns 0.625 at theta=b for c=0.25", () => {
    expect(irt3pl(0, 1, 0, 0.25)).toBeCloseTo(0.625, 3)
  })

  test("returns 0.5 at theta=b for 2PL (c=0)", () => {
    expect(irt2pl(0, 1, 0)).toBeCloseTo(0.5, 3)
  })

  test("higher a gives steeper curve", () => {
    const low = irt3pl(-0.5, 0.5, 0, 0)
    const high = irt3pl(-0.5, 2, 0, 0)
    expect(high).toBeLessThan(low)
  })

  test("handles large exponent gracefully", () => {
    expect(irt3pl(1000, 1, 0, 0)).toBe(1)
    expect(irt3pl(-1000, 1, 0, 0)).toBe(0)
  })
})

describe("estimateTheta", () => {
  test("returns initial theta for empty responses", () => {
    expect(estimateTheta([], 0)).toBe(0)
    expect(estimateTheta([], 1.5)).toBe(1.5)
  })

  test("estimates positive theta for high ability student", () => {
    const items = [
      { u: 1, a: 1, b: -1, c: 0 },
      { u: 1, a: 1, b: 0, c: 0 },
      { u: 1, a: 1, b: 1, c: 0 },
    ]
    const theta = estimateTheta(items)
    expect(theta).toBeGreaterThan(0.5)
  })

  test("estimates negative theta for low ability student", () => {
    const items = [
      { u: 0, a: 1, b: -1, c: 0 },
      { u: 0, a: 1, b: 0, c: 0 },
      { u: 0, a: 1, b: 1, c: 0 },
    ]
    const theta = estimateTheta(items)
    expect(theta).toBeLessThan(-0.5)
  })

  test("estimates theta near 0 for mixed responses at b=0", () => {
    const items = [
      { u: 1, a: 1, b: -1, c: 0 },
      { u: 0, a: 1, b: 1, c: 0 },
    ]
    const theta = estimateTheta(items)
    expect(theta).toBeGreaterThan(-1)
    expect(theta).toBeLessThan(1)
  })

  test("converges within max iterations", () => {
    const items = Array.from({ length: 10 }, () => ({
      u: 1, a: 1.5, b: 0, c: 0.1,
    }))
    const theta = estimateTheta(items, 0, 5)
    expect(theta).toBeGreaterThan(2)
  })

  test("deals with 3PL guessing correctly", () => {
    const items = [
      { u: 1, a: 1, b: 2, c: 0.25 },
      { u: 0, a: 1, b: 0, c: 0.25 },
    ]
    const theta = estimateTheta(items)
    expect(theta).toBeFinite()
  })
})

describe("itemInformation", () => {
  test("is positive at theta=b", () => {
    const info = itemInformation(1, 0, 0, 0)
    expect(info).toBeGreaterThan(0)
  })

  test("decreases with guessing", () => {
    const noGuess = itemInformation(1, 0, 0, 0)
    const withGuess = itemInformation(1, 0, 0.25, 0)
    expect(withGuess).toBeLessThan(noGuess)
  })

  test("near zero at extremes for 2PL", () => {
    expect(itemInformation(1, 0, 0, -10)).toBeLessThan(0.001)
    expect(itemInformation(1, 0, 0, 10)).toBeLessThan(0.001)
  })
})

describe("thetaSE", () => {
  test("returns Infinity for empty items", () => {
    expect(thetaSE(0, [])).toBe(Infinity)
  })

  test("decreases with more items", () => {
    const item = { a: 1, b: 0, c: 0, information: 0 }
    const se1 = thetaSE(0, [item])
    const se2 = thetaSE(0, [item, item])
    expect(se2).toBeLessThan(se1)
  })
})

describe("expectedScore", () => {
  test("equals number of items for high theta", () => {
    const items = [
      { a: 1, b: 0, c: 0, information: 0 },
      { a: 1, b: 1, c: 0, information: 0 },
    ]
    const score = expectedScore(5, items)
    expect(score).toBeCloseTo(2, 1)
  })

  test("approaches guessing floor for low theta with guessing", () => {
    const items = [
      { a: 1, b: 0, c: 0.25, information: 0 },
    ]
    const score = expectedScore(-5, items)
    expect(score).toBeCloseTo(0.25, 1)
  })
})

describe("logLikelihood", () => {
  test("is higher for better fitting theta", () => {
    const responses = [
      { u: 1, a: 1, b: 0, c: 0 },
      { u: 1, a: 1, b: 1, c: 0 },
    ]
    const llHigh = logLikelihood(2, responses)
    const llLow = logLikelihood(-2, responses)
    expect(llHigh).toBeGreaterThan(llLow)
  })
})
