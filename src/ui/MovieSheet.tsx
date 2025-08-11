import { useEffect, useState } from 'react'
import { getMovie, TMDB_IMG } from '../lib/tmdb'
import CandyButton from './CandyButton'
import Stars from './Stars'

export default function MovieSheet({ id, onClose, onDone }:{
  id:number; onClose:()=>void; onDone:(r:{rating:number, review?:string})=>void }){
  const [m, setM] = useState<any>()
  const [rating, setRating] = useState(8)
  const [review, setReview] = useState('')

  useEffect(()=>{ getMovie(id).then(setM) },[id])

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="card max-w-2xl w-full overflow-hidden" onClick={e=>e.stopPropagation()}>
        {m ? (
          <div className="grid md:grid-cols-[220px,1fr] gap-4">
            <img src={TMDB_IMG(m.poster_path,'w342')} alt="poster" className="rounded-2xl shadow"/>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-candy-700">{m.title}</h3>
              <div className="text-sm opacity-70">{m.release_date?.slice(0,4)} · {m.runtime?`${m.runtime} min`:''}</div>
              <p className="text-sm leading-relaxed">{m.overview}</p>
              <div className="pt-2">
                <div className="mb-1 text-sm">Ta note</div>
                <Stars value={rating} onChange={setRating}/>
              </div>
              <textarea className="w-full p-3 rounded-xl border" placeholder="Un mot en sortie de séance…"
                        value={review} onChange={e=>setReview(e.target.value)} />
              <div className="flex gap-2 pt-1">
                <CandyButton onClick={()=>onDone({ rating, review: review||undefined })}>J’ai vu ce film</CandyButton>
                <CandyButton className="btn-outline" onClick={onClose}>Fermer</CandyButton>
              </div>
            </div>
          </div>
        ) : (<div>Chargement…</div>)}
      </div>
    </div>
  )
}
