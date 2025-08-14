import { useEffect, useState } from 'react'
import { listMovieIds, listSeriesIds } from '../lib/db'
import { getMovie, getTV, TMDB_IMG } from '../lib/tmdb'

export default function InlinePosters({ listId, type='movies' }: { listId: string; type?: 'movies'|'series' }) {
  const [paths, setPaths] = useState<string[]>([])
  const [total, setTotal] = useState(0)
  const [count, setCount] = useState(3) // nb de vignettes visibles (0..3)

  useEffect(() => {
    let alive = true
    ;(async () => {
      // On prend large pour que le +N soit juste
      const ids = type === 'series'
        ? await listSeriesIds(listId, 50)
        : await listMovieIds(listId, 50)
      if (!alive) return
      setTotal(ids.length)

      // Charge seulement ce qu'on va potentiellement afficher (max 8 pour ne pas spam l'API)
      const sample = ids.slice(0, 8)
      const fetcher = type === 'series' ? getTV : getMovie
      const entries = await Promise.all(sample.map(id => fetcher(id).catch(() => null)))
      const posters = entries.filter(Boolean).map((m: any) => m.poster_path).filter(Boolean)
      if (!alive) return
      setPaths(posters)
    })()
    return () => { alive = false }
  }, [listId, type])

  // Adapte le nb de vignettes à la largeur
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth
      setCount(w < 360 ? 0 : w < 420 ? 1 : w < 520 ? 2 : 3)
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  if (paths.length === 0 || count === 0) return null

  const thumbs = paths.slice(0, count)
  const more = Math.max(0, total - thumbs.length)

  return (
    <div className="ml-2 flex items-center gap-1 min-w-0 max-w-[55%] overflow-hidden shrink-0">
      {thumbs.map((p, i) => (
        <img
          key={i}
          src={TMDB_IMG(p, 'w92')}
          className="w-7 h-10 rounded-md object-cover shadow ring-1 ring-black/5 flex-shrink-0"
          alt=""
          loading="lazy"
        />
      ))}
      {more > 0 && (
        <span className="ml-1 flex-shrink-0 text-[11px] px-2 py-0.5 rounded-full bg-candy-100 text-candy-700">
          +{more}
        </span>
      )}
    </div>
  )
}
