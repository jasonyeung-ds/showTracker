import type { Recommendation, Show, WatchStatus, WatchlistEntry } from '../types'


const SEED_WEIGHT: Record<WatchStatus, number> = { watching: 2, plan: 1 }

const GENRE_BONUS = 1

export const MAX_SEEDS = 10
const MAX_RESULTS = 20


export function pickSeeds(entries: WatchlistEntry[]): WatchlistEntry[] {
  return [...entries]
    .sort(
      (a, b) =>
        SEED_WEIGHT[b.status] - SEED_WEIGHT[a.status] || b.addedAt - a.addedAt,
    )
    .slice(0, MAX_SEEDS)
}


export function rankRecommendations(
  seeds: { entry: WatchlistEntry; recs: Show[] }[],
  excludeIds: Set<number>,
): Recommendation[] {
  const genreWeight = new Map<number, number>()
  let totalWeight = 0
  for (const { entry } of seeds) {
    const weight = SEED_WEIGHT[entry.status]
    totalWeight += weight
    for (const genre of entry.genreIds) {
      genreWeight.set(genre, (genreWeight.get(genre) ?? 0) + weight)
    }
  }

  const candidates = new Map<number, Recommendation>()
  for (const { entry, recs } of seeds) {
    const weight = SEED_WEIGHT[entry.status]
    recs.forEach((show, rank) => {
      if (excludeIds.has(show.id)) return
      let candidate = candidates.get(show.id)
      if (!candidate) {
        candidate = { ...show, score: 0, because: [] }
        candidates.set(show.id, candidate)
      }
      candidate.score += weight * (1 - rank / recs.length)
      candidate.because.push(entry.name)
    })
  }

  for (const candidate of candidates.values()) {
    if (totalWeight === 0 || candidate.genreIds.length === 0) continue
    const matched = candidate.genreIds.reduce(
      (sum, genre) => sum + (genreWeight.get(genre) ?? 0),
      0,
    )
    candidate.score += GENRE_BONUS * (matched / (totalWeight * candidate.genreIds.length))
  }

  return [...candidates.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
}
