/**
 * FSRS module — wrapper around the official ts-fsrs (v5.4.1, FSRS-5 algorithm).
 * Maintains the same API as the previous custom implementation so downstream
 * consumers (schedule.ts, engine tools) require no changes.
 *
 * Reference: https://github.com/open-spaced-repetition/ts-fsrs
 * Formula: R(t,S) = (1 + FACTOR * t/(9*S))^DECAY
 */

import { FSRS, createEmptyCard, Rating, type Card as FSRSCard } from "ts-fsrs"

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

// Singleton FSRS scheduler with default parameters (FSRS-5 defaults)
const fsrs = new FSRS({})

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
    difficulty: difficulty ?? 5,
    stability: 1,
    retrievability: 1,
    lastReview: Date.now(),
    interval: 0,
    reviewCount: 0,
  }
}

/**
 * Compute retrievability R(t, S) — probability of recall after t days
 * given stability S. Uses the official FSRS-5 forgetting curve.
 */
export function computeRetrievability(t: number, S: number): number {
  if (S <= 0) return 0
  const past = new Date(Date.now() - t * 86400000)
  const probe: FSRSCard = {
    due: past,
    stability: S,
    difficulty: 5,
    elapsed_days: 0,
    scheduled_days: 0,
    reps: 0,
    lapses: 0,
    state: 1,
    last_review: past,
    learning_steps: 0,
  }
  return fsrs.get_retrievability(probe, new Date(), false)
}

/**
 * Update card after a successful recall. Grade maps to FSRS Rating:
 *   0-1 → Again, 2 → Hard, 3 → Good, 4 → Easy
 */
export function updateAfterRecall(
  card: Card,
  grade: number,
  _responseTimeMs?: number,
): Card {
  const fCard = toFsrsCard(card)
  const rating = gradeToRating(grade)
  const record = fsrs.next(fCard, new Date(), rating)
  return fromFsrsCard(card, record.card)
}

/**
 * Update card after a failed recall (forgot).
 * Applies Rating.Again to decrease stability and increase difficulty.
 */
export function updateAfterForget(card: Card): Card {
  const fCard = toFsrsCard(card)
  const record = fsrs.next(fCard, new Date(), Rating.Again)
  return fromFsrsCard(card, record.card)
}

/**
 * Compute the next interval (in days) for the card to target retention.
 * Uses the FSRS-5 interval modifier formula: I(R,S) = S * (R^(1/DECAY) - 1) / FACTOR
 */
export function nextInterval(card: Card, targetR: number = 0.7): number {
  if (card.stability <= 0) return 1
  const decay = -0.5  // FSRS-5 default w[20]
  const factor = Math.exp(Math.pow(decay, -1) * Math.log(0.9)) - 1.0
  const modifier = (Math.pow(targetR, 1 / decay) - 1) / factor
  return Math.max(1, Math.round(card.stability * modifier))
}

/**
 * Probability of recall if reviewed `futureDays` from now.
 */
export function recallProbAt(card: Card, futureDays: number): number {
  const fCard = toFsrsCard(card)
  const future = new Date(Date.now() + futureDays * 86400000)
  return fsrs.get_retrievability(fCard, future, false)
}

// ── Private helpers ──────────────────────────────────────────────

function toFsrsCard(card: Card): FSRSCard {
  return {
    due: new Date(card.lastReview),
    stability: Math.max(0.001, card.stability),
    difficulty: Math.max(1, Math.min(10, card.difficulty)),
    elapsed_days: 0,
    scheduled_days: card.interval,
    reps: card.reviewCount,
    lapses: 0,
    state: 1,
    last_review: new Date(card.lastReview),
    learning_steps: 0,
  }
}

function fromFsrsCard(original: Card, fCard: FSRSCard): Card {
  return {
    ...original,
    difficulty: fCard.difficulty,
    stability: fCard.stability,
    retrievability: fsrs.get_retrievability(fCard, new Date(), false),
    lastReview: fCard.due.getTime(),
    interval: fCard.scheduled_days,
    reviewCount: fCard.reps,
  }
}

function gradeToRating(grade: number): Rating {
  if (grade <= 1) return Rating.Again
  if (grade <= 2) return Rating.Hard
  if (grade <= 3) return Rating.Good
  return Rating.Easy
}
