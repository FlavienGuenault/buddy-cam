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

export async function getTV(tvId: number){
  const r = await fetch(`${BASE}/tv/${tvId}?language=fr-FR&api_key=${KEY_V3}`)
  if (!r.ok) throw new Error('tmdb tv')
  return await r.json()
}

export async function getSeason(tvId: number, seasonNumber: number){
  const r = await fetch(`${BASE}/tv/${tvId}/season/${seasonNumber}?language=fr-FR&api_key=${KEY_V3}`)
  if (!r.ok) throw new Error('tmdb season')
  return await r.json()
}

/** Récupère la liste [ {s:1,e:1}, … ] en ignorant la saison 0 (Specials) */
export async function getAllEpisodes(tvId: number): Promise<{s:number;e:number}[]>{
  const tv = await getTV(tvId)
  const seasons: number[] = (tv.seasons||[])
    .map((s:any)=>s.season_number)
    .filter((n:number)=>n>0)
  const out: {s:number;e:number}[] = []
  for (const sn of seasons){
    const sea = await getSeason(tvId, sn)
    for (const ep of (sea.episodes||[])){
      out.push({ s: sn, e: ep.episode_number })
    }
  }
  return out
}

export async function searchTV(q: string){
  const url = `${BASE}/search/tv?language=fr-FR&query=${encodeURIComponent(q)}&api_key=${KEY_V3}`
  const r = await fetch(url)
  if (!r.ok) throw new Error('tmdb search tv')
  return await r.json() as { results: Array<{ id:number; name:string; poster_path?:string; first_air_date?:string }> }
}

export type TmdbTV = {
  id: number
  name: string
  poster_path?: string | null
  first_air_date?: string | null
}