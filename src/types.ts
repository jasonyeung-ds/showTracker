export type WatchStatus = 'plan' | 'watching'

export interface Show {
  id: number
  name: string
  overview: string
  posterPath: string | null
  firstAirDate: string
  genreIds: number[]
  voteAverage: number
}

export interface WatchlistEntry extends Show {
  status: WatchStatus
  addedAt: number
}

export interface Recommendation extends Show {
  score: number

  because: string[]
}
