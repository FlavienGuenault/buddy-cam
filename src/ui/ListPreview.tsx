import { useEffect, useState } from 'react'
import { listMovieIds } from '../lib/db'
import { getMovie, TMDB_IMG } from '../lib/tmdb'

export default function ListPreview({ listId }: { listId: string }) {
  const [posters, setPosters] = useState<string[]>([])
  useEffect(() => {
    (async () => {
      const ids = await listMovieIds(listId, 4)
      const movies = await Promise.all(ids.map(id => getMovie(id).catch(()=>null)))
      setPosters(movies.filter(Boolean).map(m => (m as any).poster_path).filter(Boolean))
    })()
  }, [listId])

  if (posters.length === 0) return <div className="h-20 rounded-2xl bg-candy-50" />

  // grille 2x2
  return (
    <div className="relative h-20 rounded-2xl overflow-hidden">
      <div className="grid grid-cols-2 grid-rows-2 h-full w-full">
        {posters.slice(0,4).map((p, i) => (
          <img key={i} src={TMDB_IMG(p,'w185')} className="w-full h-full object-cover" />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
    </div>
  )
}
