import { useEffect, useState } from 'react'
import { listMovieIds } from '../lib/db'
import { getMovie, TMDB_IMG } from '../lib/tmdb'

export default function InlinePosters({ listId }: { listId: string }) {
  const [posters, setPosters] = useState<string[]>([])

  useEffect(() => {
    (async () => {
      const ids = await listMovieIds(listId, 6)
      const movies = await Promise.all(ids.map(id => getMovie(id).catch(() => null)))
      setPosters(movies.filter(Boolean).map((m: any) => m.poster_path).filter(Boolean))
    })()
  }, [listId])

  if (posters.length === 0) return null

  const thumbs = posters.slice(0, 3)
  const more = posters.length - thumbs.length

  return (
    // caché sur écrans très étroits
    <div className="hidden xs:flex items-center gap-1 shrink-0">
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
