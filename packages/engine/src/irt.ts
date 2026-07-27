export interface ItemResponse {
  u: number
  a: number
  b: number
  c: number
}

export interface ItemInfo {
  a: number
  b: number
  c: number
  information: number
}

export function irt3pl(theta: number, a: number, b: number, c: number): number {
  const exponent = -a * (theta - b)
  if (exponent > 700) return c
  if (exponent < -700) return 1
  return c + (1 - c) / (1 + Math.exp(exponent))
}

export function irt2pl(theta: number, a: number, b: number): number {
  return irt3pl(theta, a, b, 0)
}

export function estimateTheta(
  responses: ItemResponse[],
  initialTheta: number = 0,
  maxIter: number = 20,
  tol: number = 1e-6,
): number {
  if (responses.length === 0) return initialTheta
  let theta = initialTheta
  for (let iter = 0; iter < maxIter; iter++) {
    let score = 0
    let info = 0
    for (const r of responses) {
      const P = irt3pl(theta, r.a, r.b, r.c)
      if (P <= 0 || P >= 1) continue
      const Q = 1 - P
      const Pc = (P - r.c) / (1 - r.c)
      score += r.a * Pc * (r.u - P) / P
      info += r.a * r.a * Pc * Pc * Q / P
    }
    if (info < 1e-12) break
    const step = score / info
    theta += step
    if (Math.abs(step) < tol) break
  }
  return clamp(theta, -4, 4)
}

export function thetaSE(theta: number, items: ItemInfo[]): number {
  let info = 0
  for (const item of items) {
    const I = itemInformation(item.a, item.b, item.c, theta)
    info += I
  }
  if (info < 1e-12) return Infinity
  return 1 / Math.sqrt(info)
}

export function itemInformation(a: number, b: number, c: number, theta: number): number {
  const P = irt3pl(theta, a, b, c)
  const Q = 1 - P
  if (P <= 0 || Q <= 0) return 0
  const Pc = (P - c) / (1 - c)
  return a * a * Pc * Pc * Q / P
}

export function expectedScore(theta: number, items: ItemInfo[]): number {
  let total = 0
  for (const item of items) {
    total += irt3pl(theta, item.a, item.b, item.c)
  }
  return total
}

export function logLikelihood(theta: number, responses: ItemResponse[]): number {
  let ll = 0
  for (const r of responses) {
    const P = irt3pl(theta, r.a, r.b, r.c)
    if (P <= 0 || P >= 1) return -Infinity
    ll += r.u * Math.log(P) + (1 - r.u) * Math.log(1 - P)
  }
  return ll
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}
