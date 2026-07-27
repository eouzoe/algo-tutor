import type { ConceptGraph } from "./concept-graph.ts"
import { P_MASTERED } from "./types.ts"

export function outerFringe(
  graph: ConceptGraph,
  pLMap: Map<string, number>,
): string[] {
  const result: string[] = []
  for (const [id, pL] of pLMap) {
    if (pL >= P_MASTERED) continue
    if (prerequisitesSatisfied(id, graph, pLMap)) {
      result.push(id)
    }
  }
  return result
}

export function innerFringe(
  graph: ConceptGraph,
  pLMap: Map<string, number>,
): string[] {
  const result: string[] = []
  for (const [id, pL] of pLMap) {
    if (pL < P_MASTERED) continue
    const successors = graph.getSuccessors(id)
    const hasNonMasteredSuccessor = successors.some(sid => {
      const sPL = pLMap.get(sid)
      return sPL !== undefined && sPL < P_MASTERED
    })
    if (hasNonMasteredSuccessor) {
      result.push(id)
    }
  }
  return result
}

export function prerequisitesSatisfied(
  conceptId: string,
  graph: ConceptGraph,
  pLMap: Map<string, number>,
): boolean {
  const node = graph.getNode(conceptId)
  if (!node) return true
  if (!node.prerequisites || node.prerequisites.length === 0) return true
  for (const group of node.prerequisites) {
    if (group.group === "AND") {
      if (!group.concepts.every(c => (pLMap.get(c) ?? 0) >= P_MASTERED)) {
        return false
      }
    } else {
      if (!group.concepts.some(c => (pLMap.get(c) ?? 0) >= P_MASTERED)) {
        return false
      }
    }
  }
  return true
}

export function infoGain(pL: number): number {
  return Math.abs(pL - 0.5)
}

export function fringeInfoGain(fringe: string[], pLMap: Map<string, number>): string[] {
  return [...fringe].sort((a, b) => {
    const ga = infoGain(pLMap.get(a) ?? 0)
    const gb = infoGain(pLMap.get(b) ?? 0)
    return ga - gb
  })
}
