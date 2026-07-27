import { describe, test, expect } from "bun:test"
import { ConceptGraph } from "../src/concept-graph.ts"

function makeNode(conceptId: string, prereqs: string[][] = []) {
  return {
    conceptId,
    prerequisites: prereqs.map(group => ({
      group: group.length > 1 && group[0] === "OR" ? "OR" as const : "AND" as const,
      concepts: group.length > 1 && group[0] === "OR" ? group.slice(1) : group,
    })),
    reinforces: [] as string[],
    generalizesTo: [] as string[],
    analogousTo: [] as string[],
    misconceptions: [] as { id: string; description: string; confusesWith: string[] }[],
  }
}

describe("ConceptGraph", () => {
  test("addNode and getNode", () => {
    const g = new ConceptGraph()
    const node = makeNode("recursion")
    g.addNode(node)
    expect(g.getNode("recursion")).toBeDefined()
    expect(g.getNode("recursion")?.conceptId).toBe("recursion")
  })

  test("hasNode", () => {
    const g = new ConceptGraph()
    g.addNode(makeNode("a"))
    expect(g.hasNode("a")).toBe(true)
    expect(g.hasNode("b")).toBe(false)
  })

  test("getAllNodes", () => {
    const g = new ConceptGraph()
    g.addNode(makeNode("a"))
    g.addNode(makeNode("b"))
    expect(g.getAllNodes()).toHaveLength(2)
  })

  test("getSuccessors returns concepts that depend on given concept", () => {
    const g = new ConceptGraph()
    g.addNode(makeNode("a"))
    g.addNode(makeNode("b"))
    g.addNode(makeNode("c", [["a"], ["b"]]))

    const successorsOfA = g.getSuccessors("a")
    expect(successorsOfA).toContain("c")
    const successorsOfC = g.getSuccessors("c")
    expect(successorsOfC).toEqual([])
  })

  test("getSuccessors returns empty for unknown concept", () => {
    const g = new ConceptGraph()
    g.addNode(makeNode("a"))
    expect(g.getSuccessors("unknown")).toEqual([])
  })

  test("topologicalSort respects prerequisites", () => {
    const g = new ConceptGraph()
    g.addNode(makeNode("a"))
    g.addNode(makeNode("b", [["a"]]))
    g.addNode(makeNode("c", [["b"]]))

    const order = g.topologicalSort()
    const aIdx = order.indexOf("a")
    const bIdx = order.indexOf("b")
    const cIdx = order.indexOf("c")
    expect(aIdx).toBeLessThan(bIdx)
    expect(bIdx).toBeLessThan(cIdx)
  })

  test("detectCycle returns null for DAG", () => {
    const g = new ConceptGraph()
    g.addNode(makeNode("a"))
    g.addNode(makeNode("b", [["a"]]))
    g.addNode(makeNode("c", [["b"]]))

    expect(g.detectCycle()).toBeNull()
  })

  test("detectCycle finds cycle", () => {
    const g = new ConceptGraph()
    g.addNode(makeNode("a", [["c"]]))
    g.addNode(makeNode("b", [["a"]]))
    g.addNode(makeNode("c", [["b"]]))

    const cycle = g.detectCycle()
    expect(cycle).not.toBeNull()
    expect(cycle!.length).toBeGreaterThanOrEqual(2)
  })

  test("getMisconceptions returns empty for concept with none", () => {
    const g = new ConceptGraph()
    g.addNode(makeNode("a"))
    expect(g.getMisconceptions("a")).toEqual([])
  })

  test("getMisconceptions returns defined misconceptions", () => {
    const g = new ConceptGraph()
    g.addNode({
      conceptId: "recursion",
      prerequisites: [],
      reinforces: [],
      generalizesTo: [],
      analogousTo: [],
      misconceptions: [
        { id: "mc-basecase", description: "base case wrong direction", confusesWith: ["iteration"] },
      ],
    })
    const mcs = g.getMisconceptions("recursion")
    expect(mcs).toHaveLength(1)
    expect(mcs[0].id).toBe("mc-basecase")
  })

  test("getMisconception finds by id across all nodes", () => {
    const g = new ConceptGraph()
    g.addNode({
      conceptId: "recursion",
      prerequisites: [],
      reinforces: [],
      generalizesTo: [],
      analogousTo: [],
      misconceptions: [
        { id: "mc-basecase", description: "base case wrong direction", confusesWith: [] },
      ],
    })
    const mc = g.getMisconception("mc-basecase")
    expect(mc).toBeDefined()
    expect(mc!.description).toContain("base case")
    expect(g.getMisconception("nonexistent")).toBeUndefined()
  })
})
