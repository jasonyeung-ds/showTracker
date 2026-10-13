import type { WatchlistEntry } from '../types'



const STORAGE_KEY = 'show-tracker:watchlist:v1'

export async function loadWatchlist(): Promise<WatchlistEntry[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as WatchlistEntry[]) : []
  } catch (err) {
    console.error('Failed to load watchlist', err)
    return []
  }
}

export async function saveWatchlist(entries: WatchlistEntry[]): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch (err) {
    console.error('Failed to save watchlist', err)
  }
}
