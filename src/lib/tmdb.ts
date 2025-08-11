const BASE = 'https://api.themoviedb.org/3'
const KEY_V3 = import.meta.env.VITE_TMDB_V3
const TOKEN_V4 = import.meta.env.VITE_TMDB_V4

export type TmdbMovie = { id: number; title: string; release_date?: string; poster_path?: string }

export async function searchMovies(query: string) {
  if (!KEY_V3 && !TOKEN_V4) throw new Error('Missing TMDb key/token')
  const url = `${BASE}/search/movie?language=fr-FR&query=${encodeURIComponent(query)}`
  const res = await fetch(KEY_V3 ? `${url}&api_key=${KEY_V3}` : url, {
    headers: TOKEN_V4 ? { Authorization: `Bearer ${TOKEN_V4}` } : undefined
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`TMDb error: ${res.status} ${t}`)
  }
  return res.json() as Promise<{ results: TmdbMovie[] }>
}