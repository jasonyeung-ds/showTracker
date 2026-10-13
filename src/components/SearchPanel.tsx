import { useEffect, useState } from 'react'
import { searchShows } from '../api/tmdb'
import type { Show, WatchStatus } from '../types'
import { ShowCard } from './ShowCard'

interface SearchPanelProps {
  statusById: Map<number, WatchStatus>
  onSetStatus: (show: Show, status: WatchStatus) => void
  onRemove: (id: number) => void
}

const DEBOUNCE_MS = 350

interface SearchResult {
  query: string
  shows: Show[]
  error: string | null
}

export function SearchPanel({ statusById, onSetStatus, onRemove }: SearchPanelProps) {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<SearchResult | null>(null)
  const trimmed = query.trim()

  useEffect(() => {
    if (!trimmed) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      searchShows(trimmed, controller.signal)
        .then((shows) => setResult({ query: trimmed, shows, error: null }))
        .catch((err: unknown) => {
          if (controller.signal.aborted) return
          const error = err instanceof Error ? err.message : 'Search failed.'
          setResult({ query: trimmed, shows: [], error })
        })
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [trimmed])

  const isCurrent = result?.query === trimmed
  const loading = Boolean(trimmed) && !isCurrent
  const error = isCurrent ? result.error : null
  // Keep showing the previous results while the next search is in flight.
  const results = trimmed ? (result?.shows ?? []) : []

  return (
    <section>
      <input
        className="search-input"
        type="search"
        placeholder="Search for a TV show…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      {error && <p className="message message-error">{error}</p>}
      {loading && <p className="message">Searching…</p>}
      {isCurrent && !error && results.length === 0 && (
        <p className="message">No shows found for “{trimmed}”.</p>
      )}
      <div className="grid">
        {results.map((show) => (
          <ShowCard
            key={show.id}
            show={show}
            status={statusById.get(show.id)}
            onSetStatus={onSetStatus}
            onRemove={onRemove}
          />
        ))}
      </div>
    </section>
  )
}
