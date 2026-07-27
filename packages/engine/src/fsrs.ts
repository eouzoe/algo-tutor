export enum CardType {
  Concept = "concept",
  Drill = "drill",
  Problem = "problem",
  Debug = "debug",
}

export interface Card {
  cardId: string
  conceptId: string
  type: CardType
  difficulty: number
  stability: number
  retrievability: number
  lastReview: number
  interval: number
  reviewCount: number
}

export const DECAY = 1.5
const MIN_STABILITY = 0.1
const MAX_STABILITY = 3650
const INITIAL_STABILITY = 1
const INITIAL_DIFFICULTY = 5

export function createCard(
  cardId: string,
  conceptId: string,
  type: CardType,
  difficulty?: number,
): Card {
  return {
    cardId,
    conceptId,
    type,
    difficulty: difficulty ?? INITIAL_DIFFICULTY,
    stability: INITIAL_STABILITY,
    retrievability: 1,
    lastReview: Date.now(),
    interval: 0,
    reviewCount: 0,
  }
}

export function computeRetrievability(t: number, S: number): number {
  if (S <= 0) return 0
  return 1 / (1 + Math.pow(t / S, DECAY))
}

export function updateAfterRecall(
  card: Card,
  grade: number,
  responseTimeMs?: number,
): Card {
  const clampedGrade = clamp(grade, 0, 4)
  const stabilityFactor = Math.exp(clampedGrade * 0.3)
  const newStability = clamp(card.stability * stabilityFactor, MIN_STABILITY, MAX_STABILITY)
  const now = Date.now()
  const elapsed = (now - card.lastReview) / 86400000
  const newR = computeRetrievability(0, newStability)
  const newInterval = Math.max(1, Math.round(newStability))

  return {
    ...card,
    stability: newStability,
    retrievability: newR,
    lastReview: now,
    interval: newInterval,
    reviewCount: card.reviewCount + 1,
    difficulty: updateDifficulty(card.difficulty, clampedGrade, responseTimeMs),
  }
}

export function updateAfterForget(card: Card): Card {
  const newStability = clamp(card.stability * Math.exp(-card.difficulty / 20), MIN_STABILITY, card.stability)
  const now = Date.now()
  const newR = computeRetrievability(0, newStability)

  return {
    ...card,
    stability: newStability,
    retrievability: newR,
    lastReview: now,
    interval: 0,
    reviewCount: card.reviewCount + 1,
    difficulty: Math.min(10, card.difficulty + 0.5),
  }
}

export function nextInterval(card: Card, targetR: number = 0.7): number {
  if (card.stability <= 0) return 1
  return Math.max(1, Math.round(card.stability * Math.pow((1 - targetR) / targetR, 1 / DECAY)))
}

export function recallProbAt(card: Card, futureDays: number): number {
  return computeRetrievability(futureDays, card.stability)
}

function updateDifficulty(current: number, grade: number, responseTimeMs?: number): number {
  let delta = 0
  if (grade >= 3) {
    delta = -0.2
  } else if (grade >= 1) {
    delta = 0.1
  } else {
    delta = 0.5
  }
  if (responseTimeMs !== undefined && responseTimeMs > 300000) {
    delta += 0.3
  }
  return clamp(current + delta, 1, 10)
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}
