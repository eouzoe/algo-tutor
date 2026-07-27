export const P_LOCKED = 0.6
export const P_LEARN = 0.8
export const P_PRACTICE = 0.9
export const P_MASTERED = 0.99

export enum Phase {
  Locked = "locked",
  Learn = "learn",
  Practice = "practice",
  Exam = "exam",
  Review = "review",
  Mastered = "mastered",
}

export interface BKTParams {
  pL0: number
  pT: number
  pG: number
  pS: number
}

export interface ConceptState {
  conceptId: string
  phase: Phase
  pL: number
  bkt: BKTParams
  learnStep: number
  fadingStage: number
  oscillationCount: number
  consecutiveCorrect: number
  drillInterrupted: boolean
  activeMisconceptions: string[]
}

export interface PhaseTransitionResult {
  from: Phase
  to: Phase
  reason: string
  reviewDrills?: number
}

export const PHASE_LABELS: Record<Phase, string> = {
  [Phase.Locked]: "鎖住",
  [Phase.Learn]: "學習",
  [Phase.Practice]: "練習",
  [Phase.Exam]: "考試",
  [Phase.Review]: "複習補救",
  [Phase.Mastered]: "已掌握",
}
