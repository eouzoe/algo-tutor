import { describe, test, expect } from "bun:test"
import {
  CardType,
  createCard,
  computeRetrievability,
  updateAfterRecall,
  updateAfterForget,
  nextInterval,
  recallProbAt,
} from "../src/fsrs.ts"

describe("createCard", () => {
  test("creates card with default values", () => {
    const card = createCard("c1", "recursion", CardType.Concept)
    expect(card.cardId).toBe("c1")
    expect(card.conceptId).toBe("recursion")
    expect(card.type).toBe("concept")
    expect(card.difficulty).toBe(5)
    expect(card.stability).toBe(1)
    expect(card.retrievability).toBe(1)
    expect(card.interval).toBe(0)
    expect(card.reviewCount).toBe(0)
  })

  test("accepts custom difficulty", () => {
    const card = createCard("c2", "dp", CardType.Drill, 8)
    expect(card.difficulty).toBe(8)
  })
})

describe("computeRetrievability", () => {
  test("returns 1 at t=0", () => {
    expect(computeRetrievability(0, 1)).toBeCloseTo(1, 5)
  })

  test("decreases with time", () => {
    const r1 = computeRetrievability(1, 1)
    const r7 = computeRetrievability(7, 1)
    expect(r7).toBeLessThan(r1)
  })

  test("higher S slows forgetting", () => {
    const rLowS = computeRetrievability(7, 1)
    const rHighS = computeRetrievability(7, 30)
    expect(rHighS).toBeGreaterThan(rLowS)
  })

  test("returns 0 for S=0", () => {
    expect(computeRetrievability(1, 0)).toBe(0)
  })

  test("is between 0 and 1", () => {
    const r = computeRetrievability(10, 5)
    expect(r).toBeGreaterThan(0)
    expect(r).toBeLessThan(1)
  })
})

describe("updateAfterRecall", () => {
  test("increases stability on high grade", () => {
    const card = createCard("c1", "recursion", CardType.Concept)
    const updated = updateAfterRecall(card, 4)
    expect(updated.stability).toBeGreaterThan(card.stability)
    expect(updated.reviewCount).toBe(1)
    expect(updated.interval).toBeGreaterThan(0)
  })

  test("decreases difficulty on high grade", () => {
    const card = createCard("c1", "recursion", CardType.Concept, 7)
    const updated = updateAfterRecall(card, 4)
    expect(updated.difficulty).toBeLessThan(card.difficulty)
  })

  test("increases difficulty on low grade", () => {
    const card = createCard("c1", "recursion", CardType.Concept, 5)
    const updated = updateAfterRecall(card, 0)
    expect(updated.difficulty).toBeGreaterThan(card.difficulty)
  })

  test("higher grade gives more stability", () => {
    const card = createCard("c1", "recursion", CardType.Concept)
    const low = updateAfterRecall(card, 1)
    const high = updateAfterRecall(card, 4)
    expect(high.stability).toBeGreaterThan(low.stability)
  })
})

describe("updateAfterForget", () => {
  test("decreases stability", () => {
    const card = createCard("c1", "recursion", CardType.Concept)
    const stable = { ...card, stability: 30 }
    const updated = updateAfterForget(stable)
    expect(updated.stability).toBeLessThan(stable.stability)
  })

  test("increases difficulty", () => {
    const card = createCard("c1", "recursion", CardType.Concept, 5)
    const updated = updateAfterForget(card)
    expect(updated.difficulty).toBeGreaterThan(card.difficulty)
  })

  test("resets interval to 0", () => {
    const card = { ...createCard("c1", "recursion", CardType.Concept), interval: 30 }
    const updated = updateAfterForget(card)
    expect(updated.interval).toBe(0)
  })
})

describe("nextInterval", () => {
  test("is proportional to stability", () => {
    const card = createCard("c1", "recursion", CardType.Concept)
    const highS = { ...card, stability: 100 }
    const lowS = { ...card, stability: 10 }
    expect(nextInterval(highS)).toBeGreaterThan(nextInterval(lowS))
  })

  test("higher targetR gives shorter interval", () => {
    const card = { ...createCard("c1", "recursion", CardType.Concept), stability: 30 }
    expect(nextInterval(card, 0.5)).toBeGreaterThan(nextInterval(card, 0.9))
  })

  test("returns at least 1", () => {
    const card = { ...createCard("c1", "recursion", CardType.Concept), stability: 0.01 }
    expect(nextInterval(card)).toBeGreaterThanOrEqual(1)
  })
})

describe("recallProbAt", () => {
  test("equals computeRetrievability at that time", () => {
    expect(recallProbAt({ ...createCard("c", "r", CardType.Concept), stability: 30 }, 15))
      .toBe(computeRetrievability(15, 30))
  })

  test("decreases with future days", () => {
    const card = { ...createCard("c", "r", CardType.Concept), stability: 10 }
    const near = recallProbAt(card, 1)
    const far = recallProbAt(card, 10)
    expect(far).toBeLessThan(near)
  })
})
