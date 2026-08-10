#!/usr/bin/env bun
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { dirname } from "node:path"
import { Phase, type ConceptState, type BKTParams, P_LOCKED, P_LEARN, P_PRACTICE, P_MASTERED } from "./types.ts"
import { computePhaseTransition, detectOscillation, reviewCompleted, phaseFromBand } from "./phase.ts"
import { bktUpdate, bktUpdateAfterExam } from "./bkt.ts"
import { nextAction, applyAnswer, selectByInfoGain } from "./schedule.ts"
import { estimateTheta, irt3pl, itemInformation, thetaSE } from "./irt.ts"
import { computeRetrievability, updateAfterRecall, updateAfterForget, createCard, CardType } from "./fsrs.ts"
import { outerFringe, innerFringe, prerequisitesSatisfied, infoGain, fringeInfoGain } from "./kst.ts"
import { ConceptGraph } from "./concept-graph.ts"
import { generateLearnStep3Drills, generatePhaseConsolidationDrills, generateMisconceptionRemediationDrills, generateReviewDrills, advanceDrill, isSessionComplete, estimatePartialCredit } from "./drill.ts"

// ── Engine state persistence ────────────────────────────────────
interface EngineState {
  concepts: Record<string, ConceptState>
  fsrsCards: Record<string, ReturnType<typeof createCard> & { lastReview: number; interval: number }>
  version: number
}

function getStatePath(): string {
  let root = process.env.ALGO_ROOT ?? process.cwd()
  // Walk up from engine/ to project root (find dir containing log/)
  if (!existsSync(`${root}/log`) && existsSync(`${dirname(root)}/log`)) {
    root = dirname(root)
  }
  return `${root}/log/engine-state.json`
}

function loadState(): EngineState {
  const p = getStatePath()
  if (existsSync(p)) {
    try { return JSON.parse(readFileSync(p, "utf8")) } catch { /* fall through */ }
  }
  return { concepts: {}, fsrsCards: {}, version: 1 }
}

function saveState(state: EngineState): void {
  const p = getStatePath()
  writeFileSync(p, JSON.stringify(state, null, 2))
}

function getOrCreateConcept(state: EngineState, conceptId: string): ConceptState {
  if (!state.concepts[conceptId]) {
    state.concepts[conceptId] = {
      conceptId,
      phase: Phase.Learn,
      pL: 0.2,
      bkt: { pL0: 0.2, pT: 0.1, pG: 0.2, pS: 0.1 },
      learnStep: 0,
      fadingStage: 0,
      oscillationCount: 0,
      consecutiveCorrect: 0,
      drillInterrupted: false,
      activeMisconceptions: [],
    }
  }
  return state.concepts[conceptId]
}

const cmd = process.argv[2]

switch (cmd) {
  case "phase-transition": {
    const state = JSON.parse(process.argv[3])
    const examPassed = process.argv[4] === "true"
    console.log(JSON.stringify(computePhaseTransition(state, examPassed)))
    break
  }
  case "bkt-update": {
    const [pL, pT, pG, pS, correct, weight] = process.argv.slice(3, 9).map(Number)
    console.log(JSON.stringify(bktUpdate(pL, { pL0: pL, pT, pG, pS }, { correct: correct === 1 }, weight)))
    break
  }
  case "bkt-exam": {
    const [pL, pT, pG, pS, correct] = process.argv.slice(3, 8).map(Number)
    console.log(JSON.stringify(bktUpdateAfterExam(pL, { pL0: pL, pT, pG, pS }, correct === 1)))
    break
  }
  case "irt-estimate": {
    const responses = JSON.parse(process.argv[3])
    console.log(JSON.stringify(estimateTheta(responses)))
    break
  }
  case "irt-p": {
    const [theta, a, b, c] = process.argv.slice(3, 7).map(Number)
    console.log(JSON.stringify(irt3pl(theta, a, b, c)))
    break
  }
  case "fsrs-retrievability": {
    const [t, S] = process.argv.slice(3, 5).map(Number)
    console.log(JSON.stringify(computeRetrievability(t, S)))
    break
  }
  case "kst-outer-fringe": {
    const graphJson = process.argv[3]
    const pLMap = JSON.parse(process.argv[4])
    const graph = new ConceptGraph()
    for (const node of JSON.parse(graphJson)) graph.addNode(node)
    console.log(JSON.stringify(outerFringe(graph, new Map(Object.entries(pLMap)))))
    break
  }
  case "kst-inner-fringe": {
    const graphJson = process.argv[3]
    const pLMap = JSON.parse(process.argv[4])
    const graph = new ConceptGraph()
    for (const node of JSON.parse(graphJson)) graph.addNode(node)
    console.log(JSON.stringify(innerFringe(graph, new Map(Object.entries(pLMap)))))
    break
  }
  case "kst-prereqs-satisfied": {
    const [conceptId, graphJson, pLMapJson] = process.argv.slice(3, 6)
    const graph = new ConceptGraph()
    for (const node of JSON.parse(graphJson)) graph.addNode(node)
    console.log(JSON.stringify(prerequisitesSatisfied(conceptId, graph, new Map(Object.entries(JSON.parse(pLMapJson))))))
    break
  }
  case "drill-learn-step3": {
    const [conceptId, subskill] = process.argv.slice(3, 5)
    console.log(JSON.stringify(generateLearnStep3Drills(conceptId, subskill)))
    break
  }
  case "drill-advance": {
    const session = JSON.parse(process.argv[3])
    const correct = process.argv[4] === "true"
    console.log(JSON.stringify(advanceDrill(session, correct)))
    break
  }
  case "drill-partial-credit": {
    const [total, correct, llmScore] = process.argv.slice(3, 6).map(Number)
    console.log(JSON.stringify(estimatePartialCredit(total, correct, isNaN(llmScore) ? undefined : llmScore)))
    break
  }
  // ── Session lifecycle ────────────────────────────────────────
  case "finish-session": {
    // args: problemId, result(ac/partial/fail), topicsJson, tThink, tCode, tDebug
    const [problemId, result, topicsJson, tThink, tCode, tDebug] = process.argv.slice(3, 9)
    const topics = JSON.parse(topicsJson)
    const correct = result === "ac"
    const st = loadState()
    const updates: Array<{ conceptId: string; from: string; to: string; pL: number }> = []

    for (const topic of topics) {
      const concept = getOrCreateConcept(st, topic)
      const oldPhase = concept.phase
      concept.pL = bktUpdate(concept.pL, concept.bkt, { correct }, 1)
      const transition = computePhaseTransition(concept, correct && concept.phase === Phase.Exam)
      concept.phase = transition.to
      if (correct) concept.consecutiveCorrect++
      else concept.consecutiveCorrect = 0
      updates.push({ conceptId: topic, from: oldPhase, to: concept.phase, pL: concept.pL })
    }

    saveState(st)
    console.log(JSON.stringify({ updates, success: true }))
    break
  }
  case "get-due-reviews": {
    const st = loadState()
    const now = Date.now()
    const due: Array<{ cardId: string; conceptId: string; retrievability: number; dueInDays: number }> = []
    for (const [id, card] of Object.entries(st.fsrsCards)) {
      const elapsed = (now - card.lastReview) / 86400000
      const r = computeRetrievability(elapsed, card.stability)
      if (r < 0.7) {
        due.push({ cardId: id, conceptId: card.conceptId, retrievability: r, dueInDays: Math.max(0, -Math.floor(elapsed)) })
      }
    }
    due.sort((a, b) => a.retrievability - b.retrievability)
    console.log(JSON.stringify(due))
    break
  }
  case "reset-progress": {
    const scope = process.argv[3] // "all" or conceptId
    const st = loadState()
    if (scope === "all") {
      st.concepts = {}
      st.fsrsCards = {}
    } else if (st.concepts[scope]) {
      delete st.concepts[scope]
      for (const [id, card] of Object.entries(st.fsrsCards)) {
        if (card.conceptId === scope) delete st.fsrsCards[id]
      }
    }
    saveState(st)
    console.log(JSON.stringify({ success: true, scope }))
    break
  }
  case "get-concept-state": {
    const conceptId = process.argv[3]
    const st = loadState()
    const concept = st.concepts[conceptId]
    console.log(JSON.stringify(concept ?? null))
    break
  }
  default:
    console.error("unknown command:", cmd)
    process.exit(1)
}
