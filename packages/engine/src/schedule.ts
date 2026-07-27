import type { ConceptState } from "./types.ts"
import { Phase, P_MASTERED } from "./types.ts"
import { computePhaseTransition, detectOscillation } from "./phase.ts"
import { bktUpdate } from "./bkt.ts"

export interface ReviewCard {
  cardId: string
  retrievability: number
  conceptId: string
}

export interface Action {
  type: "drill" | "review" | "phase_content" | "new_concept" | "session_end"
  conceptId?: string
  phase?: Phase
  detail: string
}

export interface ScheduleContext {
  hasInterruptedDrill: boolean
  activeMisconceptions: string[]
  recentlyRemediated: (mc: string) => boolean
  dueCards: ReviewCard[]
  completedLastSession: boolean
  outerFringe: ConceptState[]
  selectBestFringe: (fringe: ConceptState[]) => ConceptState | null
}

function priority(action: Action): number {
  switch (action.type) {
    case "drill": return 1
    case "review": return 3
    case "phase_content": return 4
    case "new_concept": return 5
    case "session_end": return 6
  }
}

export function nextAction(state: ConceptState, ctx: ScheduleContext): Action {
  if (ctx.hasInterruptedDrill) {
    return { type: "drill", detail: "恢復中斷的 drill session", conceptId: state.conceptId }
  }

  for (const mc of ctx.activeMisconceptions) {
    if (!ctx.recentlyRemediated(mc)) {
      return { type: "drill", detail: `補救 misconception: ${mc}`, conceptId: state.conceptId }
    }
  }

  const due = ctx.dueCards.filter(c => c.retrievability < 0.7)
  if (due.length > 0 && ctx.completedLastSession) {
    return {
      type: "review",
      conceptId: due[0]?.conceptId,
      detail: `FSRS 複習: ${due.length} 張卡片到期`,
    }
  }

  const transition = computePhaseTransition(state)
  if (transition.to !== state.phase) {
    state.phase = transition.to
    const alarmed = detectOscillation(state, transition)
    if (alarmed) {
      return {
        type: "drill",
        detail: `熔斷：${state.conceptId} 反覆 oscillation ≥ 3 次，檢查 prerequisites`,
        conceptId: state.conceptId,
      }
    }
  }

  if (state.phase !== Phase.Mastered && state.phase !== Phase.Locked) {
    return {
      type: "phase_content",
      phase: state.phase,
      detail: `${state.conceptId}: ${state.phase} phase action`,
      conceptId: state.conceptId,
    }
  }

  const next = ctx.selectBestFringe(ctx.outerFringe)
  if (next) {
    return {
      type: "new_concept",
      conceptId: next.conceptId,
      phase: Phase.Learn,
      detail: `新概念: ${next.conceptId}`,
    }
  }

  return { type: "session_end", detail: "所有可學概念已 mastered" }
}

export function applyAnswer(state: ConceptState, correct: boolean, weight: number = 1): void {
  const prevPhase = state.phase

  state.pL = bktUpdate(state.pL, state.bkt, { correct }, weight)

  if (correct) {
    state.consecutiveCorrect++
  } else {
    state.consecutiveCorrect = 0
  }

  const transition = computePhaseTransition(state, correct && state.phase === Phase.Exam)
  state.phase = transition.to

  const alarmed = detectOscillation(state, transition)
  if (alarmed) {
    state.oscillationCount = 0
  }
}

export function selectByInfoGain(fringe: ConceptState[]): ConceptState | null {
  if (fringe.length === 0) return null
  return fringe.reduce((best, c) =>
    Math.abs(c.pL - 0.5) < Math.abs(best.pL - 0.5) ? c : best,
  )
}
