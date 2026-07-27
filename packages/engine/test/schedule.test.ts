import { describe, it, expect } from "bun:test"
import { Phase, type ConceptState } from "../src/types.ts"
import { nextAction, applyAnswer, selectByInfoGain } from "../src/schedule.ts"
import type { ScheduleContext } from "../src/schedule.ts"

function makeState(overrides: Partial<ConceptState> = {}): ConceptState {
  return {
    conceptId: "test",
    phase: Phase.Learn,
    pL: 0.7,
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

function mockContext(overrides: Partial<ScheduleContext> = {}): ScheduleContext {
  return {
    hasInterruptedDrill: false,
    activeMisconceptions: [],
    recentlyRemediated: () => false,
    dueCards: [],
    completedLastSession: true,
    outerFringe: [],
    selectBestFringe: () => null,
    ...overrides,
  }
}

describe("scheduling", () => {
  it("prioritizes interrupted drill", () => {
    const a = nextAction(makeState(), mockContext({ hasInterruptedDrill: true }))
    expect(a.type).toBe("drill")
  })

  it("prioritizes active misconception", () => {
    const a = nextAction(
      makeState({ activeMisconceptions: ["mc-assign-eq"] }),
      mockContext({ activeMisconceptions: ["mc-assign-eq"] }),
    )
    expect(a.type).toBe("drill")
    expect(a.detail).toContain("mc-assign-eq")
  })

  it("returns phase_content for learn phase", () => {
    const a = nextAction(makeState({ phase: Phase.Learn, pL: 0.7 }), mockContext())
    expect(a.type).toBe("phase_content")
    expect(a.phase).toBe(Phase.Learn)
  })

  it("returns new_concept when current mastered and fringe exists", () => {
    const next = makeState({ conceptId: "next-concept", pL: 0.5 })
    const a = nextAction(
      makeState({ phase: Phase.Mastered, pL: 0.99 }),
      mockContext({ outerFringe: [next], selectBestFringe: () => next }),
    )
    expect(a.type).toBe("new_concept")
    expect(a.conceptId).toBe("next-concept")
  })

  it("returns session_end when nothing available", () => {
    const a = nextAction(makeState({ phase: Phase.Mastered, pL: 0.99 }), mockContext())
    expect(a.type).toBe("session_end")
  })
})

describe("applyAnswer", () => {
  it("increases P(L) on correct answer", () => {
    const s = makeState({ pL: 0.5 })
    applyAnswer(s, true)
    expect(s.pL).toBeGreaterThan(0.5)
  })

  it("decreases P(L) on wrong answer", () => {
    const s = makeState({ pL: 0.8 })
    applyAnswer(s, false)
    expect(s.pL).toBeLessThan(0.8)
  })

  it("transitions to practice when P(L) high enough", () => {
    const s = makeState({ phase: Phase.Learn, pL: 0.75 })
    applyAnswer(s, true)
    if (s.pL >= 0.8) {
      expect(s.phase).toBe(Phase.Practice)
    } else {
      expect(s.phase).toBe(Phase.Learn)
    }
  })

  it("tracks consecutive correct", () => {
    const s = makeState()
    applyAnswer(s, true)
    expect(s.consecutiveCorrect).toBe(1)
    applyAnswer(s, true)
    expect(s.consecutiveCorrect).toBe(2)
    applyAnswer(s, false)
    expect(s.consecutiveCorrect).toBe(0)
  })

  it("exam weight applies", () => {
    const s1 = makeState({ phase: Phase.Exam, pL: 0.9 })
    applyAnswer(s1, true, 1.5)
    const s2 = makeState({ phase: Phase.Exam, pL: 0.9 })
    applyAnswer(s2, true, 1.0)
    expect(s1.pL).toBeGreaterThanOrEqual(s2.pL)
  })
})

describe("selectByInfoGain", () => {
  it("picks concept closest to P(L)=0.5", () => {
    const c1 = makeState({ conceptId: "a", pL: 0.95 })
    const c2 = makeState({ conceptId: "b", pL: 0.55 })
    const c3 = makeState({ conceptId: "c", pL: 0.3 })
    const picked = selectByInfoGain([c1, c2, c3])
    expect(picked?.conceptId).toBe("b")
  })

  it("returns null for empty fringe", () => {
    expect(selectByInfoGain([])).toBeNull()
  })
})
