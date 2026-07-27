import { describe, test, expect } from "bun:test"
import { ConceptGraph } from "../src/concept-graph.ts"
import { outerFringe, innerFringe, prerequisitesSatisfied, infoGain, fringeInfoGain } from "../src/kst.ts"
import { P_MASTERED } from "../src/types.ts"

function makePLMap(entries: [string, number][]): Map<string, number> {
  return new Map(entries)
}

describe("prerequisitesSatisfied", () => {
  test("returns true for node with no prerequisites", () => {
    const g = new ConceptGraph()
    g.addNode({ conceptId: "a", prerequisites: [], reinforces: [], generalizesTo: [], analogousTo: [], misconceptions: [] })
    expect(prerequisitesSatisfied("a", g, new Map())).toBe(true)
  })

  test("AND group requires all mastered", () => {
    const g = new ConceptGraph()
    g.addNode({ conceptId: "a", prerequisites: [{ group: "AND", concepts: ["b", "c"] }], reinforces: [], generalizesTo: [], analogousTo: [], misconceptions: [] })
    g.addNode({ conceptId: "b", prerequisites: [], reinforces: [], generalizesTo: [], analogousTo: [], misconceptions: [] })
    g.addNode({ conceptId: "c", prerequisites: [], reinforces: [], generalizesTo: [], analogousTo: [], misconceptions: [] })

    expect(prerequisitesSatisfied("a", g, makePLMap([["b", P_MASTERED], ["c", 0.5]]))).toBe(false)
    expect(prerequisitesSatisfied("a", g, makePLMap([["b", P_MASTERED], ["c", P_MASTERED]]))).toBe(true)
  })

  test("OR group requires at least one mastered", () => {
    const g = new ConceptGraph()
    g.addNode({ conceptId: "a", prerequisites: [{ group: "OR", concepts: ["b", "c"] }], reinforces: [], generalizesTo: [], analogousTo: [], misconceptions: [] })
    g.addNode({ conceptId: "b", prerequisites: [], reinforces: [], generalizesTo: [], analogousTo: [], misconceptions: [] })
    g.addNode({ conceptId: "c", prerequisites: [], reinforces: [], generalizesTo: [], analogousTo: [], misconceptions: [] })

    expect(prerequisitesSatisfied("a", g, makePLMap([["b", 0.5], ["c", 0.3]]))).toBe(false)
    expect(prerequisitesSatisfied("a", g, makePLMap([["b", P_MASTERED], ["c", 0.3]]))).toBe(true)
  })

  test("returns true for unknown concept", () => {
    const g = new ConceptGraph()
    expect(prerequisitesSatisfied("unknown", g, new Map())).toBe(true)
  })
})

describe("outerFringe", () => {
  test("returns concept whose prerequisites are all mastered", () => {
    const g = new ConceptGraph()
    g.addNode({ conceptId: "a", prerequisites: [{ group: "AND", concepts: ["b"] }], reinforces: [], generalizesTo: [], analogousTo: [], misconceptions: [] })
    g.addNode({ conceptId: "b", prerequisites: [], reinforces: [], generalizesTo: [], analogousTo: [], misconceptions: [] })

    const fringe = outerFringe(g, makePLMap([["a", 0.3], ["b", P_MASTERED]]))
    expect(fringe).toContain("a")
    expect(fringe).not.toContain("b")
  })

  test("excludes mastered concepts", () => {
    const g = new ConceptGraph()
    g.addNode({ conceptId: "a", prerequisites: [], reinforces: [], generalizesTo: [], analogousTo: [], misconceptions: [] })

    const fringe = outerFringe(g, makePLMap([["a", P_MASTERED]]))
    expect(fringe).not.toContain("a")
  })

  test("excludes concept with unmet AND prerequisites", () => {
    const g = new ConceptGraph()
    g.addNode({ conceptId: "a", prerequisites: [{ group: "AND", concepts: ["b"] }], reinforces: [], generalizesTo: [], analogousTo: [], misconceptions: [] })
    g.addNode({ conceptId: "b", prerequisites: [], reinforces: [], generalizesTo: [], analogousTo: [], misconceptions: [] })

    const fringe = outerFringe(g, makePLMap([["a", 0.3], ["b", 0.5]]))
    expect(fringe).not.toContain("a")
    expect(fringe).toContain("b")
  })

  test("handles chain prerequisites", () => {
    const g = new ConceptGraph()
    g.addNode({ conceptId: "c", prerequisites: [{ group: "AND", concepts: ["b"] }], reinforces: [], generalizesTo: [], analogousTo: [], misconceptions: [] })
    g.addNode({ conceptId: "b", prerequisites: [{ group: "AND", concepts: ["a"] }], reinforces: [], generalizesTo: [], analogousTo: [], misconceptions: [] })
    g.addNode({ conceptId: "a", prerequisites: [], reinforces: [], generalizesTo: [], analogousTo: [], misconceptions: [] })

    const fringe = outerFringe(g, makePLMap([["a", P_MASTERED], ["b", 0.5], ["c", 0.3]]))
    expect(fringe).toContain("b")
    expect(fringe).not.toContain("c")
  })
})

describe("innerFringe", () => {
  test("returns mastered concepts with unmastered successors", () => {
    const g = new ConceptGraph()
    g.addNode({ conceptId: "a", prerequisites: [], reinforces: [], generalizesTo: [], analogousTo: [], misconceptions: [] })
    g.addNode({ conceptId: "b", prerequisites: [{ group: "AND", concepts: ["a"] }], reinforces: [], generalizesTo: [], analogousTo: [], misconceptions: [] })

    const fringe = innerFringe(g, makePLMap([["a", P_MASTERED], ["b", 0.5]]))
    expect(fringe).toContain("a")
  })

  test("excludes mastered concepts with no unmastered successors", () => {
    const g = new ConceptGraph()
    g.addNode({ conceptId: "a", prerequisites: [], reinforces: [], generalizesTo: [], analogousTo: [], misconceptions: [] })

    const fringe = innerFringe(g, makePLMap([["a", P_MASTERED]]))
    expect(fringe).toEqual([])
  })

  test("excludes non-mastered concepts", () => {
    const g = new ConceptGraph()
    g.addNode({ conceptId: "a", prerequisites: [], reinforces: [], generalizesTo: [], analogousTo: [], misconceptions: [] })
    g.addNode({ conceptId: "b", prerequisites: [{ group: "AND", concepts: ["a"] }], reinforces: [], generalizesTo: [], analogousTo: [], misconceptions: [] })

    const fringe = innerFringe(g, makePLMap([["a", 0.5], ["b", 0.3]]))
    expect(fringe).toEqual([])
  })
})

describe("infoGain", () => {
  test("returns 0 at pL=0.5", () => {
    expect(infoGain(0.5)).toBe(0)
  })

  test("returns 0.5 at extremes", () => {
    expect(infoGain(0)).toBe(0.5)
    expect(infoGain(1)).toBe(0.5)
  })

  test("symmetric around 0.5", () => {
    expect(infoGain(0.3)).toBeCloseTo(infoGain(0.7), 10)
  })
})

describe("fringeInfoGain", () => {
  test("sorts by ascending info gain (most uncertain first)", () => {
    const result = fringeInfoGain(["a", "b", "c"], makePLMap([["a", 0.5], ["b", 0.9], ["c", 0.6]]))
    expect(result[0]).toBe("a")
    expect(result[2]).toBe("b")
  })
})
