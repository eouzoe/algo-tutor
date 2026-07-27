import { Phase, type ConceptState } from "./types.ts"
import { computePhaseTransition } from "./phase.ts"
import { bktUpdate } from "./bkt.ts"
import { nextAction, selectByInfoGain } from "./schedule.ts"
import type { ScheduleContext } from "./schedule.ts"

const student: ConceptState = {
  conceptId: "recursion",
  phase: Phase.Learn,
  pL: 0.3,
  bkt: { pL0: 0.3, pT: 0.4, pG: 0.2, pS: 0.1 },
  learnStep: 0,
  fadingStage: 1,
  oscillationCount: 0,
  consecutiveCorrect: 0,
  drillInterrupted: false,
  activeMisconceptions: [],
}

console.log("=== ioi-forge engine demo ===\n")

console.log(`Initial:   ${student.conceptId} @ ${student.phase} (P(L)=${student.pL.toFixed(3)})`)

// Simulate 10 practice rounds
for (let i = 0; i < 10; i++) {
  const correct = student.pL > 0.3 + Math.random() * 0.4
  student.pL = bktUpdate(student.pL, student.bkt, { correct })

  const transition = computePhaseTransition(student)
  const prevPhase = student.phase
  student.phase = transition.to

  const mark = correct ? "✓" : "✗"
  const phaseChange = prevPhase !== transition.to ? ` → ${transition.to} (${transition.reason})` : ""
  console.log(`  #${i + 1}: ${mark} P(L)=${student.pL.toFixed(3)}${phaseChange}`)

  if (student.phase === Phase.Mastered) {
    console.log("\n✅ Mastered!")
    break
  }
}

console.log("\n--- fringe selection demo ---")
const fringe = [
  { conceptId: "dp", pL: 0.95 } as ConceptState,
  { conceptId: "graphs", pL: 0.55 } as ConceptState,
  { conceptId: "trees", pL: 0.3 } as ConceptState,
]
const best = selectByInfoGain(fringe)
console.log(`Fringe: [dp(0.95), graphs(0.55), trees(0.30)]`)
console.log(`Best next: ${best?.conceptId} (P(L)=${best?.pL}, info_gain=${Math.abs((best?.pL ?? 0) - 0.5).toFixed(2)})`)

console.log("\n--- scheduling demo ---")
const ctx: ScheduleContext = {
  hasInterruptedDrill: false,
  activeMisconceptions: [],
  recentlyRemediated: () => false,
  dueCards: [{ cardId: "c1", retrievability: 0.3, conceptId: "recursion" }],
  completedLastSession: true,
  outerFringe: fringe,
  selectBestFringe: () => best,
}
const action = nextAction(student, ctx)
console.log(`Next action: ${action.type} → ${action.detail}`)
