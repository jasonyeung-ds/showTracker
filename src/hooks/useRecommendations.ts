import { useEffect, useMemo, useState } from 'react'
import { getRecommendations } from '../api/tmdb'
import { pickSeeds, rankRecommendations } from '../lib/recommendations'
import type { Recommendation, Show, WatchlistEntry } from '../types'

const recsCache = new Map<number, Promise<Show[]>>()

function cachedRecommendations(showId: number): Promise<Show[]> {
  let pending = recsCache.get(showId)
  if (!pending) {
    pending = getRecommendations(showId)
    pending.catch(() => recsCache.delete(showId))
    recsCache.set(showId, pending)
  }
  return pending
}

interface Result {
  entries: WatchlistEntry[]
  recommendations: Recommendation[]
  error: string | null
}

export function useRecommendations(entries: WatchlistEntry[]) {
  const seeds = useMemo(() => pickSeeds(entries), [entries])
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    if (seeds.length === 0) return
    let cancelled = false

    Promise.allSettled(seeds.map((s) => cachedRecommendations(s.id))).then((settled) => {
      if (cancelled) return
      const fetched = seeds.flatMap((entry, i) => {
        const outcome = settled[i]
        return outcome.status === 'fulfilled' ? [{ entry, recs: outcome.value }] : []
      })
      let error: string | null = null
      if (fetched.length === 0) {
        const failure = settled.find((r) => r.status === 'rejected')
        error =
          failure?.status === 'rejected' && failure.reason instanceof Error
            ? failure.reason.message
            : 'Could not load recommendations.'
      }
      const excludeIds = new Set(entries.map((e) => e.id))
      setResult({ entries, recommendations: rankRecommendations(fetched, excludeIds), error })
    })

    return () => {
      cancelled = true
    }
  }, [seeds, entries])

  const hasSeeds = seeds.length > 0
  const isCurrent = result?.entries === entries
  return {
   
    recommendations: hasSeeds ? (result?.recommendations ?? []) : [],
    loading: hasSeeds && !isCurrent,
    error: isCurrent ? result.error : null,
    hasSeeds,
  }
}
