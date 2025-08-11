const BASE = 'https://api.themoviedb.org/3'
const KEY = import.meta.env.VITE_TMDB_KEY

export type TmdbMovie = { id: number; title: string; release_date?: string; poster_path?: string }

export async function searchMovies(query: string) {
  if (!KEY) throw new Error('Missing TMDb key')
  const res = await fetch(`${BASE}/search/movie?api_key=${KEY}&language=fr-FR&query=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error('TMDb')
  return res.json() as Promise<{ results: TmdbMovie[] }>
}