import { useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { getTV, TMDB_IMG, getAllEpisodes } from '../lib/tmdb'
import { listEpisodeViews } from '../lib/db'

type Entry = { itemId:string; title:string; tvId:number; img?:string }

export default function SeriesReel({
  items, meId, onFinish, onClose
}:{
  items:{ id:string; title:string; tmdb_id:number }[]
  meId: string
  onFinish:(target:{ itemId:string; tvId:number; s:number; e:number; title:string })=>void
  onClose:()=>void
}){
  const [base, setBase] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{ let alive=true; (async()=>{
    const eligible: Entry[] = []
    for (const it of items){
      try{
        const [tv, all, views] = await Promise.all([
          getTV(it.tmdb_id),
          getAllEpisodes(it.tmdb_id),
          listEpisodeViews(it.id)
        ])
        const seenMe = new Set(views.filter(v=>v.user_id===meId).map(v=>`${v.season}:${v.episode}`))
        const total = all.length
        const seenCount = all.filter(ep => seenMe.has(`${ep.s}:${ep.e}`)).length
        const done = total>0 && seenCount>=total
        if (!done){
          eligible.push({
            itemId: it.id,
            title: it.title,
            tvId: it.tmdb_id,
            img: tv.poster_path? TMDB_IMG(tv.poster_path,'w342'): undefined
          })
        }
      }catch{
        // en cas d’erreur TMDB, on la saute (mieux vaut exclure que planter)
      }
    }
    if (alive){ setBase(eligible); setLoading(false) }
  })(); return()=>{ alive=false }},[items, meId])

  const [spinning, setSpinning] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  const ITEM_H = 220
  const CONTAINER_H = Math.round(ITEM_H * 2.6)
  const RENDER_LOOPS = 20
  const rendered = useMemo(()=>{ const reps:Entry[]=[]; for(let i=0;i<RENDER_LOOPS;i++) reps.push(...base); return reps },[base])

  function fireworks(){ const end=Date.now()+1200; (function frame(){ confetti({ particleCount: 24, spread: 70, startVelocity: 34, origin:{ y:.6 } }); if(Date.now()<end) requestAnimationFrame(frame) })() }

  function pickCentered(): Entry | null {
    const c=containerRef.current, l=listRef.current; if(!c||!l||base.length===0) return null
    const cy = c.getBoundingClientRect().top + c.clientHeight/2
    const kids = Array.from(l.children) as HTMLElement[]
    let best=-1, d=1e9
    kids.forEach((k,i)=>{ const r=k.getBoundingClientRect(); const m=Math.abs((r.top+r.bottom)/2 - cy); if(m<d){d=m; best=i} })
    if (best<0) return null
    return base[best % base.length]
  }

  function spin(){
    if (spinning||base.length===0) return
    setSpinning(true)
    if (listRef.current && containerRef.current){
      const centerOffset = (containerRef.current.clientHeight/2) - (ITEM_H/2)
      listRef.current.style.transition='none'
      listRef.current.style.transform=`translateY(-${centerOffset}px)`
      // @ts-ignore reflow
      listRef.current.offsetHeight
      const loops=14
      const dist=(loops*base.length + Math.floor(Math.random()*base.length))*ITEM_H + centerOffset
      const dur=4.6
      requestAnimationFrame(()=>{
        if(!listRef.current) return
        listRef.current.style.transition=`transform ${dur}s cubic-bezier(.12,.6,.05,1)`
        listRef.current.style.transform=`translateY(-${dist}px)`
        setTimeout(async ()=>{
          const w = pickCentered(); if(!w){ setSpinning(false); return }
          fireworks()
          // calcule prochain épisode non vu (pour meId)
          const [all, views] = await Promise.all([ getAllEpisodes(w.tvId), listEpisodeViews(w.itemId) ])
          const seenMe = new Set(views.filter(v=>v.user_id===meId).map(v=>`${v.season}:${v.episode}`))
          const next = all.find(ep => !seenMe.has(`${ep.s}:${ep.e}`)) || all[all.length-1]
          onFinish({ itemId:w.itemId, tvId:w.tvId, s:next.s, e:next.e, title:w.title })
          setSpinning(false)
        }, dur*1000 + 80)
      })
    }
  }

  if (loading){
    return (
      <div className="fixed inset-0 z-[3000] grid place-items-center bg-black/40 p-4" onClick={onClose}>
        <div className="card w-full max-w-sm sm:max-w-md" onClick={e=>e.stopPropagation()}>
          <div className="p-6">Chargement…</div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[3000] grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="card w-full max-w-sm sm:max-w-md" onClick={e=>e.stopPropagation()}>
        {base.length===0 ? (
          <div className="p-6 text-center">
            <div className="text-lg font-semibold">Tout est vu 🎉</div>
            <div className="text-sm opacity-70 mt-1">Aucune série à tirer.</div>
            <div className="mt-4"><button className="btn btn-outline" onClick={onClose}>Fermer</button></div>
          </div>
        ) : (
          <>
            <div ref={containerRef} className="relative overflow-hidden rounded-2xl bg-white" style={{ height: CONTAINER_H }}>
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent z-10" />
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-10" />
              <div className="pointer-events-none absolute top-1/2 left-0 right-0 -translate-y-1/2 border-y-2 border-candy-300/60 z-10" />
              <div ref={listRef}>
                {rendered.map((e,i)=>(
                  <div key={i} className="grid place-items-center" style={{ height: ITEM_H }}>
                    {e.img ? (
                      <img src={e.img} alt="" className="rounded-xl object-cover shadow ring-1 ring-black/5" style={{ height: ITEM_H-10, width:'auto' }}/>
                    ) : (
                      <div className="rounded-xl bg-candy-100 grid place-items-center text-center px-2" style={{ height: ITEM_H-10, width: Math.round((ITEM_H-10)*0.67) }}>
                        <span className="text-xs font-semibold text-candy-700">{e.title}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center mt-3">
              <button onClick={spin} disabled={spinning}
                      className="relative px-8 py-3 rounded-full text-white font-black shadow-candy
                                 bg-gradient-to-r from-candy-700 via-candy-600 to-candy-700
                                 active:scale-95 transition disabled:opacity-50">
                📺 Lancer
              </button>
            </div>
            <div className="flex justify-center mt-2 mb-1">
              <button className="btn-outline" onClick={onClose}>Fermer</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
