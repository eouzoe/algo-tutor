export interface PrerequisiteGroup {
  group: "AND" | "OR"
  concepts: string[]
}

export interface Misconception {
  id: string
  description: string
  confusesWith: string[]
}

export interface ConceptNode {
  conceptId: string
  prerequisites: PrerequisiteGroup[]
  reinforces: string[]
  generalizesTo: string[]
  analogousTo: string[]
  misconceptions: Misconception[]
}

export class ConceptGraph {
  private nodes: Map<string, ConceptNode> = new Map()
  private successorsCache: Map<string, string[]> | null = null

  addNode(node: ConceptNode): void {
    this.nodes.set(node.conceptId, node)
    this.successorsCache = null
  }

  hasNode(id: string): boolean {
    return this.nodes.has(id)
  }

  getNode(id: string): ConceptNode | undefined {
    return this.nodes.get(id)
  }

  getAllNodes(): ConceptNode[] {
    return [...this.nodes.values()]
  }

  getSuccessors(id: string): string[] {
    if (!this.successorsCache) this.buildCache()
    return this.successorsCache?.get(id) ?? []
  }

  getMisconceptions(conceptId: string): Misconception[] {
    return this.nodes.get(conceptId)?.misconceptions ?? []
  }

  getMisconception(misconceptionId: string): Misconception | undefined {
    for (const node of this.nodes.values()) {
      const mc = node.misconceptions.find(m => m.id === misconceptionId)
      if (mc) return mc
    }
    return undefined
  }

  topologicalSort(): string[] {
    const visited = new Set<string>()
    const result: string[] = []
    const temp = new Set<string>()

    const visit = (id: string): void => {
      if (temp.has(id)) return
      if (visited.has(id)) return
      temp.add(id)
      for (const group of this.nodes.get(id)?.prerequisites ?? []) {
        for (const prereq of group.concepts) {
          if (this.nodes.has(prereq)) {
            visit(prereq)
          }
        }
      }
      temp.delete(id)
      visited.add(id)
      result.push(id)
    }

    for (const id of this.nodes.keys()) {
      if (!visited.has(id)) visit(id)
    }

    return result
  }

  detectCycle(): string[] | null {
    const visited = new Set<string>()
    const recStack = new Set<string>()

    const dfs = (id: string, path: string[]): string[] | null => {
      if (recStack.has(id)) {
        const cycleStart = path.indexOf(id)
        return path.slice(cycleStart).concat(id)
      }
      if (visited.has(id)) return null
      visited.add(id)
      recStack.add(id)
      path.push(id)
      for (const group of this.nodes.get(id)?.prerequisites ?? []) {
        for (const prereq of group.concepts) {
          if (this.nodes.has(prereq)) {
            const cycle = dfs(prereq, [...path])
            if (cycle) return cycle
          }
        }
      }
      recStack.delete(id)
      return null
    }

    for (const id of this.nodes.keys()) {
      if (!visited.has(id)) {
        const cycle = dfs(id, [])
        if (cycle) return cycle
      }
    }
    return null
  }

  private buildCache(): void {
    this.successorsCache = new Map()
    for (const [id] of this.nodes) {
      this.successorsCache.set(id, [])
    }
    for (const [, node] of this.nodes) {
      for (const group of node.prerequisites) {
        for (const prereq of group.concepts) {
          if (this.nodes.has(prereq)) {
            const succ = this.successorsCache.get(prereq) ?? []
            succ.push(node.conceptId)
            this.successorsCache.set(prereq, succ)
          }
        }
      }
    }
  }
}
