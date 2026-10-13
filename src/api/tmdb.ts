import type { Show } from '../types'

const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_URL = 'https://image.tmdb.org/t/p'
const token = import.meta.env.VITE_TMDB_READ_TOKEN

export const hasTmdbToken = Boolean(token)

interface TmdbShow {
  id: number
  name: string
  overview: string
  poster_path: string | null
  first_air_date?: string
  genre_ids?: number[]
  vote_average?: number
}

interface TmdbPage {
  results: TmdbShow[]
}

async function request<T>(
  path: string,
  params: Record<string, string> = {},
  signal?: AbortSignal,
): Promise<T> {
  if (!token) {
    throw new Error(
      'Missing VITE_TMDB_READ_TOKEN. Add it to .env.local and restart the dev server.',
    )
  }
  const url = new URL(BASE_URL + path)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    signal,
  })
  if (!res.ok) {
    throw new Error(`TMDB request failed (${res.status} ${res.statusText})`)
  }
  return res.json() as Promise<T>
}

function toShow(show: TmdbShow): Show {
  return {
    id: show.id,
    name: show.name,
    overview: show.overview,
    posterPath: show.poster_path,
    firstAirDate: show.first_air_date ?? '',
    genreIds: show.genre_ids ?? [],
    voteAverage: show.vote_average ?? 0,
  }
}

export async function searchShows(query: string, signal?: AbortSignal): Promise<Show[]> {
  const data = await request<TmdbPage>(
    '/search/tv',
    { query, include_adult: 'false' },
    signal,
  )
  return data.results.map(toShow)
}

export async function getRecommendations(showId: number): Promise<Show[]> {
  const data = await request<TmdbPage>(`/tv/${showId}/recommendations`)
  return data.results.map(toShow)
}

export function posterUrl(path: string | null, size = 'w342'): string | null {
  return path ? `${IMAGE_URL}/${size}${path}` : null
}
