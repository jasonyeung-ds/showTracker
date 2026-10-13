import { useRecommendations } from '../hooks/useRecommendations'
import type { Show, WatchStatus, WatchlistEntry } from '../types'
import { ShowCard } from './ShowCard'

interface RecommendationsPanelProps {
  entries: WatchlistEntry[]
  statusById: Map<number, WatchStatus>
  onSetStatus: (show: Show, status: WatchStatus) => void
  onRemove: (id: number) => void
}

function formatBecause(names: string[]): string {
  const [first, second, ...rest] = names
  if (!second) return `Because you added ${first}`
  if (rest.length === 0) return `Because you added ${first} and ${second}`
  return `Because you added ${first}, ${second} and ${rest.length} more`
}

export function RecommendationsPanel({
  entries,
  statusById,
  onSetStatus,
  onRemove,
}: RecommendationsPanelProps) {
  const { recommendations, loading, error, hasSeeds } = useRecommendations(entries)

  if (!hasSeeds) {
    return (
      <p className="message">
        Add a few shows to Watching or Plan to Watch and recommendations will show up here.
      </p>
    )
  }

  return (
    <section>
      {error && <p className="message message-error">{error}</p>}
      {loading && recommendations.length === 0 && (
        <p className="message">Finding shows you might like…</p>
      )}
      {!loading && !error && recommendations.length === 0 && (
        <p className="message">No recommendations yet. Try adding more shows.</p>
      )}
      <div className="grid">
        {recommendations.map((rec) => (
          <ShowCard
            key={rec.id}
            show={rec}
            status={statusById.get(rec.id)}
            note={formatBecause(rec.because)}
            onSetStatus={onSetStatus}
            onRemove={onRemove}
          />
        ))}
      </div>
    </section>
  )
}
