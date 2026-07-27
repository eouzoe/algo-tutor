export enum DrillType {
  Fill = "fill",
  Trace = "trace",
  Transform = "transform",
  Debug = "debug",
}

export const DRILL_BKT_WEIGHT: Record<DrillType, number> = {
  [DrillType.Fill]: 0.3,
  [DrillType.Trace]: 0.5,
  [DrillType.Transform]: 0.7,
  [DrillType.Debug]: 0.5,
}

export enum FillDifficulty {
  Easy = 1,
  Medium = 3,
  Hard = 5,
}

export interface FillBlank {
  id: string
  expected: string
  alternatives: string[]
  subskill: string
  hint: string
  contextLine: number
}

export interface FillInDrill {
  type: DrillType.Fill
  id: string
  conceptId: string
  codeTemplate: string
  blanks: FillBlank[]
  subskill: string
  partialCredit: boolean
  difficulty: FillDifficulty
}

export interface TraceCheckpoint {
  line: number
  question: string
  expected: string
  varName: string
}

export interface TraceDrill {
  type: DrillType.Trace
  id: string
  conceptId: string
  traceCode: string
  input: string
  checkpoints: TraceCheckpoint[]
  subskill: string
  difficulty: number
}

export interface TransformDrill {
  type: DrillType.Transform
  id: string
  conceptId: string
  sourceForm: string
  targetForm: string
  sourceCode: string
  constraints: string[]
  subskill: string
  difficulty: number
}

export interface DebugDrill {
  type: DrillType.Debug
  id: string
  conceptId: string
  misconceptionId: string
  buggyCode: string
  correctCode: string
  subskill: string
  difficulty: number
}

export type AnyDrill = FillInDrill | TraceDrill | TransformDrill | DebugDrill

export interface DrillSession {
  scenario: "learn_step3" | "phase_consolidation" | "misconception_remediation" | "review"
  drills: AnyDrill[]
  currentIndex: number
  consecutiveCorrect: number
  retriesRemaining: number
}

export function drillBKTWeight(drill: AnyDrill): number {
  return DRILL_BKT_WEIGHT[drill.type]
}

export function generateLearnStep3Drills(
  conceptId: string,
  subskill: string,
): DrillSession {
  const fills: FillInDrill[] = [1, 2, 3].map(i => ({
    type: DrillType.Fill,
    id: `${conceptId}-fill-L3-${i}`,
    conceptId,
    codeTemplate: `// ${conceptId} 填空練習 ${i}`,
    blanks: [
      { id: `bl-${i}-1`, expected: "", alternatives: [], subskill, hint: "", contextLine: 0 },
    ],
    subskill,
    partialCredit: true,
    difficulty: FillDifficulty.Easy,
  }))

  const trace: TraceDrill = {
    type: DrillType.Trace,
    id: `${conceptId}-trace-L3`,
    conceptId,
    traceCode: `// ${conceptId} 追蹤練習`,
    input: "",
    checkpoints: [
      { line: 1, question: "", expected: "", varName: "" },
    ],
    subskill,
    difficulty: 1,
  }

  return {
    scenario: "learn_step3",
    drills: [...fills, trace],
    currentIndex: 0,
    consecutiveCorrect: 0,
    retriesRemaining: 1,
  }
}

export function generatePhaseConsolidationDrills(
  conceptId: string,
  subskill: string,
): DrillSession {
  return {
    scenario: "phase_consolidation",
    drills: [
      {
        type: DrillType.Fill,
        id: `${conceptId}-fill-PC-1`,
        conceptId,
        codeTemplate: "",
        blanks: [],
        subskill,
        partialCredit: true,
        difficulty: FillDifficulty.Medium,
      },
      {
        type: DrillType.Fill,
        id: `${conceptId}-fill-PC-2`,
        conceptId,
        codeTemplate: "",
        blanks: [],
        subskill,
        partialCredit: true,
        difficulty: FillDifficulty.Medium,
      },
      {
        type: DrillType.Trace,
        id: `${conceptId}-trace-PC`,
        conceptId,
        traceCode: "",
        input: "",
        checkpoints: [],
        subskill,
        difficulty: 2,
      },
    ],
    currentIndex: 0,
    consecutiveCorrect: 0,
    retriesRemaining: 0,
  }
}

export function generateMisconceptionRemediationDrills(
  conceptId: string,
  misconceptionId: string,
  subskill: string,
  buggyCode: string,
  correctCode: string,
): DrillSession {
  return {
    scenario: "misconception_remediation",
    drills: [
      {
        type: DrillType.Fill,
        id: `${conceptId}-fill-MR-${misconceptionId}`,
        conceptId,
        codeTemplate: "",
        blanks: [],
        subskill,
        partialCredit: true,
        difficulty: FillDifficulty.Easy,
      },
      {
        type: DrillType.Trace,
        id: `${conceptId}-trace-MR-${misconceptionId}`,
        conceptId,
        traceCode: buggyCode,
        input: "",
        checkpoints: [],
        subskill,
        difficulty: 2,
      },
      {
        type: DrillType.Debug,
        id: `${conceptId}-debug-${misconceptionId}`,
        conceptId,
        misconceptionId,
        buggyCode,
        correctCode,
        subskill,
        difficulty: 3,
      },
    ],
    currentIndex: 0,
    consecutiveCorrect: 0,
    retriesRemaining: 0,
  }
}

export function generateReviewDrills(
  conceptId: string,
  previousErrors: Array<{ drillType: DrillType; correct: boolean }>,
): DrillSession {
  const drills: AnyDrill[] = previousErrors.map((err, i) => {
    const nextType = err.drillType === DrillType.Fill
      ? DrillType.Trace
      : err.drillType === DrillType.Trace && err.correct
        ? DrillType.Transform
        : err.drillType

    const makeDrill = (t: DrillType): AnyDrill => {
      switch (t) {
        case DrillType.Trace:
          return { type: DrillType.Trace as const, id: `${conceptId}-trace-RV-${i}`, conceptId, traceCode: "", input: "", checkpoints: [], subskill: "", difficulty: 3 }
        case DrillType.Transform:
          return { type: DrillType.Transform as const, id: `${conceptId}-transform-RV-${i}`, conceptId, sourceForm: "", targetForm: "", sourceCode: "", constraints: [], subskill: "", difficulty: 1 }
        default:
          return { type: DrillType.Fill as const, id: `${conceptId}-fill-RV-${i}`, conceptId, codeTemplate: "", blanks: [], subskill: "", partialCredit: true, difficulty: FillDifficulty.Medium }
      }
    }
    return makeDrill(nextType)
  })

  return {
    scenario: "review",
    drills,
    currentIndex: 0,
    consecutiveCorrect: 0,
    retriesRemaining: 0,
  }
}

export function advanceDrill(session: DrillSession, correct: boolean): DrillSession {
  const nextIndex = session.currentIndex + 1
  const isLast = nextIndex >= session.drills.length

  if (!correct && session.retriesRemaining > 0) {
    return { ...session, retriesRemaining: session.retriesRemaining - 1 }
  }

  return {
    ...session,
    currentIndex: isLast ? session.currentIndex : nextIndex,
    consecutiveCorrect: correct ? session.consecutiveCorrect + 1 : 0,
    retriesRemaining: 1,
  }
}

export function isSessionComplete(session: DrillSession): boolean {
  return session.currentIndex >= session.drills.length - 1
}

export function totalDrillWeight(session: DrillSession): number {
  return session.drills.reduce((sum, d) => sum + drillBKTWeight(d), 0)
}

export function estimatePartialCredit(
  blanksTotal: number,
  blanksCorrect: number,
  llmScore?: number,
): number {
  if (llmScore !== undefined) return llmScore
  return 0.5 + 0.5 * (blanksCorrect / Math.max(1, blanksTotal))
}
