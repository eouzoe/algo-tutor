import type { BKTParams } from "./types.ts"

export interface BKTObservation {
  correct: boolean
  softEvidence?: {
    probCorrect: number
    weight: number
  }
}

export function bktPrior(pL: number, pT: number): number {
  return pL + (1 - pL) * pT
}

export function bktPosterior(prior: number, observation: BKTObservation, pG: number, pS: number): number {
  const pObsGivenMastered = observation.softEvidence
    ? observation.softEvidence.probCorrect * (1 - pS) + (1 - observation.softEvidence.probCorrect) * pS
    : observation.correct
      ? 1 - pS
      : pS

  const pObsGivenNot = observation.softEvidence
    ? observation.softEvidence.probCorrect * pG + (1 - observation.softEvidence.probCorrect) * (1 - pG)
    : observation.correct
      ? pG
      : 1 - pG

  const pObs = prior * pObsGivenMastered + (1 - prior) * pObsGivenNot

  if (pObs === 0) return prior
  return (prior * pObsGivenMastered) / pObs
}

export function bktUpdate(
  pL: number,
  params: BKTParams,
  observation: BKTObservation,
  weight: number = 1,
): number {
  const prior = bktPrior(pL, params.pT)
  let posterior = bktPosterior(prior, observation, params.pG, params.pS)

  const effectiveWeight = observation.softEvidence
    ? observation.softEvidence.weight
    : weight

  const clampedWeight = Math.min(effectiveWeight, 2.0)
  if (clampedWeight !== 1) {
    posterior = prior + (posterior - prior) * clampedWeight
  }

  return Math.max(0, Math.min(1, posterior))
}

export function bktUpdateAfterExam(pL: number, params: BKTParams, correct: boolean): number {
  return bktUpdate(pL, params, { correct }, 1.5)
}
