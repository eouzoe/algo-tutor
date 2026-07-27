#!/usr/bin/env bun
import { Phase } from "./types.ts"
import { computePhaseTransition, detectOscillation, reviewCompleted, phaseFromBand } from "./phase.ts"
import { bktUpdate, bktUpdateAfterExam } from "./bkt.ts"
import { nextAction, applyAnswer, selectByInfoGain } from "./schedule.ts"
import { estimateTheta, irt3pl, itemInformation, thetaSE } from "./irt.ts"
import { computeRetrievability, updateAfterRecall, updateAfterForget, createCard } from "./fsrs.ts"
import { outerFringe, innerFringe, prerequisitesSatisfied, infoGain, fringeInfoGain } from "./kst.ts"
import { ConceptGraph } from "./concept-graph.ts"
import { generateLearnStep3Drills, generatePhaseConsolidationDrills, generateMisconceptionRemediationDrills, generateReviewDrills, advanceDrill, isSessionComplete, estimatePartialCredit } from "./drill.ts"

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
  default:
    console.error("unknown command:", cmd)
    process.exit(1)
}
