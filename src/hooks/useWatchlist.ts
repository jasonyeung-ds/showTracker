import { useCallback, useEffect, useMemo, useState } from 'react'
import { loadWatchlist, saveWatchlist } from '../storage/watchlist'
import type { Show, WatchStatus, WatchlistEntry } from '../types'

export function useWatchlist() {
  const [entries, setEntries] = useState<WatchlistEntry[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadWatchlist().then((stored) => {
      if (cancelled) return
      setEntries(stored)
      setLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  
  useEffect(() => {
    if (loaded) void saveWatchlist(entries)
  }, [entries, loaded])

  const setStatus = useCallback((show: Show, status: WatchStatus) => {
    setEntries((prev) => {
      if (prev.some((e) => e.id === show.id)) {
        return prev.map((e) => (e.id === show.id ? { ...e, status } : e))
      }
      const entry: WatchlistEntry = {
        id: show.id,
        name: show.name,
        overview: show.overview,
        posterPath: show.posterPath,
        firstAirDate: show.firstAirDate,
        genreIds: show.genreIds,
        voteAverage: show.voteAverage,
        status,
        addedAt: Date.now(),
      }
      return [entry, ...prev]
    })
  }, [])

  const remove = useCallback((id: number) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const statusById = useMemo(
    () => new Map(entries.map((e) => [e.id, e.status])),
    [entries],
  )

  return { entries, loaded, statusById, setStatus, remove }
}
