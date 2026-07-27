import { Phase, type ConceptState, type PhaseTransitionResult, P_LOCKED, P_LEARN, P_PRACTICE, P_MASTERED } from "./types.ts"

const OSCILLATION_THRESHOLD = 3
const EXAM_PASS_WEIGHT = 1.5

function pLBand(pL: number): number {
  if (pL < P_LOCKED) return 0
  if (pL < P_LEARN) return 1
  if (pL < P_PRACTICE) return 2
  if (pL < P_MASTERED) return 3
  return 4
}

export function phaseFromBand(band: number): Phase {
  switch (band) {
    case 0: return Phase.Locked
    case 1: return Phase.Learn
    case 2: return Phase.Practice
    case 3: return Phase.Exam
    case 4: return Phase.Mastered
    default: return Phase.Locked
  }
}

type TransitionRow = Record<number, { to: Phase; reason: string; reviewDrills?: number }>

const TRANSITION_MATRIX: Record<Phase, TransitionRow> = {
  [Phase.Locked]: {
    0: { to: Phase.Locked, reason: "locked: P(L) 過低" },
    1: { to: Phase.Learn, reason: "locked → learn" },
    2: { to: Phase.Learn, reason: "locked → learn" },
    3: { to: Phase.Practice, reason: "locked → practice (跳過 learn)" },
    4: { to: Phase.Mastered, reason: "locked → mastered (初始已掌握)" },
  },
  [Phase.Learn]: {
    0: { to: Phase.Locked, reason: "learn → locked (退回)" },
    1: { to: Phase.Learn, reason: "learn: 持續學習" },
    2: { to: Phase.Practice, reason: "learn → practice (升級)" },
    3: { to: Phase.Practice, reason: "learn → practice (跳過 exam 直接練習)" },
    4: { to: Phase.Mastered, reason: "learn → mastered" },
  },
  [Phase.Practice]: {
    0: { to: Phase.Locked, reason: "practice → locked (退回)" },
    1: { to: Phase.Learn, reason: "practice → learn (退回)" },
    2: { to: Phase.Practice, reason: "practice: 持續練習" },
    3: { to: Phase.Exam, reason: "practice → exam (升級)" },
    4: { to: Phase.Mastered, reason: "practice → mastered" },
  },
  [Phase.Exam]: {
    0: { to: Phase.Practice, reason: "exam → practice (大幅退回)" },
    1: { to: Phase.Practice, reason: "exam → practice (退回)" },
    2: { to: Phase.Review, reason: "exam → review (輕量補救)", reviewDrills: 4 },
    3: { to: Phase.Exam, reason: "exam: 持續考試" },
    4: { to: Phase.Mastered, reason: "exam → mastered (通過)" },
  },
  [Phase.Review]: {
    0: { to: Phase.Practice, reason: "review → practice (補救失敗)" },
    1: { to: Phase.Practice, reason: "review → practice (補救失敗)" },
    2: { to: Phase.Practice, reason: "review → practice (補救未回升)" },
    3: { to: Phase.Exam, reason: "review → exam (補救成功)" },
    4: { to: Phase.Mastered, reason: "review → mastered" },
  },
  [Phase.Mastered]: {
    0: { to: Phase.Mastered, reason: "mastered: 維持" },
    1: { to: Phase.Mastered, reason: "mastered: 維持" },
    2: { to: Phase.Mastered, reason: "mastered: 維持" },
    3: { to: Phase.Mastered, reason: "mastered: 維持" },
    4: { to: Phase.Mastered, reason: "mastered: 維持" },
  },
}

export function computePhaseTransition(state: ConceptState, examPassed?: boolean): PhaseTransitionResult {
  const band = examPassed && state.phase === Phase.Exam
    ? Math.max(pLBand(state.pL), 4)
    : pLBand(state.pL)

  const row = TRANSITION_MATRIX[state.phase]
  if (!row) throw new Error(`unknown phase: ${state.phase}`)

  const cell = row[band]
  if (!cell) throw new Error(`no transition for phase=${state.phase} band=${band}`)

  return { from: state.phase, to: cell.to, reason: cell.reason, reviewDrills: cell.reviewDrills }
}

export function detectOscillation(state: ConceptState, transition: PhaseTransitionResult): boolean {
  const cycle = (transition.from === Phase.Learn && transition.to === Phase.Practice)
    || (transition.from === Phase.Practice && transition.to === Phase.Learn)
    || (transition.from === Phase.Exam && transition.to === Phase.Practice)
    || (transition.from === Phase.Practice && transition.to === Phase.Exam)

  if (cycle) {
    state.oscillationCount++
  } else if (transition.to === state.phase) {
    // same phase: reset
    state.oscillationCount = 0
  }

  return state.oscillationCount >= OSCILLATION_THRESHOLD
}

export function reviewCompleted(state: ConceptState): PhaseTransitionResult {
  const band = pLBand(state.pL)
  if (band >= 3) {
    return { from: Phase.Review, to: Phase.Exam, reason: "review → exam (補救成功)" }
  }
  return { from: Phase.Review, to: Phase.Practice, reason: "review → practice (補救不足)" }
}
