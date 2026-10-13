import { useState } from 'react'
import { hasTmdbToken } from './api/tmdb'
import { RecommendationsPanel } from './components/RecommendationsPanel'
import { SearchPanel } from './components/SearchPanel'
import { ShowCard } from './components/ShowCard'
import { useWatchlist } from './hooks/useWatchlist'
import type { WatchStatus } from './types'

type Tab = WatchStatus | 'recommendations' | 'search'

function App() {
  const { entries, loaded, statusById, setStatus, remove } = useWatchlist()
  const [tab, setTab] = useState<Tab>('watching')

  const watching = entries.filter((e) => e.status === 'watching')
  const planned = entries.filter((e) => e.status === 'plan')

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'watching', label: 'Watching', count: watching.length },
    { id: 'plan', label: 'Plan to Watch', count: planned.length },
    { id: 'recommendations', label: 'Recommended' },
    { id: 'search', label: 'Search' },
  ]

  const listForTab = tab === 'watching' ? watching : tab === 'plan' ? planned : null

  return (
    <div className="app">
      <header className="header">
        <h1 className="logo">Show Tracker</h1>
        <nav className="tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className="tab"
              aria-current={tab === t.id ? 'page' : undefined}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              {t.count !== undefined && <span className="tab-count">{t.count}</span>}
            </button>
          ))}
        </nav>
      </header>

      <main className="main">
        {!hasTmdbToken && (
          <p className="message message-error">
            No TMDB token found. Copy <code>.env.example</code> to <code>.env.local</code>, add
            your token, and restart <code>npm run dev</code>.
          </p>
        )}

        {listForTab &&
          loaded &&
          (listForTab.length === 0 ? (
            <div className="message">
              <p>Nothing here yet.</p>
              <button type="button" className="btn" onClick={() => setTab('search')}>
                Find a show
              </button>
            </div>
          ) : (
            <div className="grid">
              {listForTab.map((entry) => (
                <ShowCard
                  key={entry.id}
                  show={entry}
                  status={entry.status}
                  onSetStatus={setStatus}
                  onRemove={remove}
                />
              ))}
            </div>
          ))}

        {tab === 'recommendations' && loaded && (
          <RecommendationsPanel
            entries={entries}
            statusById={statusById}
            onSetStatus={setStatus}
            onRemove={remove}
          />
        )}

        {tab === 'search' && (
          <SearchPanel statusById={statusById} onSetStatus={setStatus} onRemove={remove} />
        )}
      </main>
    </div>
  )
}

export default App
