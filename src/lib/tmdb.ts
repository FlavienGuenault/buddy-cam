const BASE = 'https://api.themoviedb.org/3'
const KEY_V3 = import.meta.env.VITE_TMDB_V3 as string | undefined
const TOKEN_V4 = import.meta.env.VITE_TMDB_V4 as string | undefined

export type TmdbMovie = { id: number; title: string; release_date?: string; poster_path?: string }

export const TMDB_IMG = (path?: string, size: 'w92'|'w154'|'w185'|'w342'|'w500'|'w780'|'original'='w342') =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : ''

export async function searchMovies(query: string, signal?: AbortSignal) {
  if (!KEY_V3 && !TOKEN_V4) throw new Error('Missing TMDb key/token')
  const url = `${BASE}/search/movie?language=fr-FR&query=${encodeURIComponent(query)}`
  const res = await fetch(KEY_V3 ? `${url}&api_key=${KEY_V3}` : url, {
    headers: TOKEN_V4 ? { Authorization: `Bearer ${TOKEN_V4}` } : undefined,
    signal
  })
  if (!res.ok) throw new Error(`TMDb error ${res.status}`)
  return res.json() as Promise<{ results: TmdbMovie[] }>
}

export async function getMovie(id: number) {
  const url = `${BASE}/movie/${id}?language=fr-FR`
  const res = await fetch(KEY_V3 ? `${url}&api_key=${KEY_V3}` : url, {
    headers: TOKEN_V4 ? { Authorization: `Bearer ${TOKEN_V4}` } : undefined
  })
  if (!res.ok) throw new Error('TMDb movie error')
  return res.json() as Promise<any>
}
