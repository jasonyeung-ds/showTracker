import { posterUrl } from '../api/tmdb'
import type { Show, WatchStatus } from '../types'

interface ShowCardProps {
  show: Show
  status?: WatchStatus
  note?: string
  onSetStatus: (show: Show, status: WatchStatus) => void
  onRemove: (id: number) => void
}

const STATUS_LABELS: Record<WatchStatus, string> = {
  plan: 'Plan to watch',
  watching: 'Watching',
}

export function ShowCard({ show, status, note, onSetStatus, onRemove }: ShowCardProps) {
  const poster = posterUrl(show.posterPath)
  const year = show.firstAirDate.slice(0, 4)

  return (
    <article className="card">
      <div className="card-poster">
        {poster ? (
          <img src={poster} alt="" loading="lazy" />
        ) : (
          <span className="card-poster-fallback">{show.name}</span>
        )}
      </div>
      <div className="card-body">
        <h3 className="card-title">{show.name}</h3>
        <p className="card-meta">
          {year || 'Unknown year'}
          {show.voteAverage > 0 && <> · ★ {show.voteAverage.toFixed(1)}</>}
        </p>
        {note && <p className="card-note">{note}</p>}
        {show.overview && <p className="card-overview">{show.overview}</p>}
        <div className="card-actions">
          {(Object.keys(STATUS_LABELS) as WatchStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              className="btn"
              aria-pressed={status === s}
              onClick={() => onSetStatus(show, s)}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
          {status && (
            <button type="button" className="btn btn-ghost" onClick={() => onRemove(show.id)}>
              Remove
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
