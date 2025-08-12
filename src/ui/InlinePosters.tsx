import { useEffect, useState } from 'react'
import { listMovieIds } from '../lib/db'
import { getMovie, TMDB_IMG } from '../lib/tmdb'

export default function InlinePosters({ listId }: { listId: string }) {
  const [posters, setPosters] = useState<string[]>([])
  const [count, setCount] = useState(3) // 0..3 vignettes visibles

  useEffect(() => {
    (async () => {
      const ids = await listMovieIds(listId, 8)
      const movies = await Promise.all(ids.map(id => getMovie(id).catch(() => null)))
      setPosters(movies.filter(Boolean).map((m: any) => m.poster_path).filter(Boolean))
    })()
  }, [listId])

  // montre moins de vignettes sur petits écrans
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth
      // règle simple: très petit => 0, petit => 1, moyen => 2, sinon 3
      setCount(w < 360 ? 0 : w < 420 ? 1 : w < 520 ? 2 : 3)
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  if (posters.length === 0 || count === 0) return null

  const thumbs = posters.slice(0, count)
  const more = posters.length - thumbs.length

  return (
    <div className="flex items-center gap-1 shrink-0 ml-2 overflow-hidden">
      {thumbs.map((p, i) => (
        <img
          key={i}
          src={TMDB_IMG(p, 'w92')}
          className="w-7 h-10 rounded-md object-cover shadow"
          alt=""
          loading="lazy"
        />
      ))}
      {more > 0 && <span className="ml-1 text-xs opacity-60">+{more}</span>}
    </div>
  )
}
