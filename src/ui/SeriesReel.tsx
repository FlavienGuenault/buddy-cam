import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { getTV, TMDB_IMG, getAllEpisodes } from '../lib/tmdb'
import { listEpisodeViews } from '../lib/db'

type Entry = { itemId:string; title:string; tvId:number; img?:string }

function PirateSVG() {
  return (
    <svg width="80" height="80" viewBox="0 0 200 200" aria-hidden>
      <ellipse cx="100" cy="100" rx="45" ry="50" fill="#f4c2a1"/>
      <ellipse cx="55" cy="100" rx="12" ry="18" fill="#e8b091"/>
      <ellipse cx="145" cy="100" rx="12" ry="18" fill="#e8b091"/>
      <path d="M58 95 Q60 100, 58 105" stroke="#d4967a" strokeWidth="2" fill="none"/>
      <path d="M142 95 Q140 100, 142 105" stroke="#d4967a" strokeWidth="2" fill="none"/>
      <ellipse cx="75" cy="95" rx="18" ry="15" fill="#000000"/>
      <line x1="45" y1="85" x2="57" y2="92" stroke="#000000" strokeWidth="3"/>
      <line x1="93" y1="98" x2="155" y2="108" stroke="#000000" strokeWidth="3"/>
      <ellipse cx="125" cy="95" rx="14" ry="12" fill="#ffffff"/>
      <ellipse cx="125" cy="95" rx="10" ry="10" fill="#4a7c8f"/>
      <ellipse cx="125" cy="95" rx="7" ry="7" fill="#6b95a8"/>
      <circle cx="125" cy="95" r="4" fill="#1a3442"/>
      <circle cx="127" cy="93" r="2" fill="#ffffff" opacity="0.8"/>
      <path d="M65 75 L72 82" stroke="#c8896a" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M135 110 L142 117" stroke="#c8896a" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M90 80 L95 85" stroke="#c8896a" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M100 100 L95 115 Q100 118, 105 115 Z" fill="#e0a182"/>
      <ellipse cx="95" cy="115" rx="3" ry="2" fill="#c8896a" opacity="0.5"/>
      <ellipse cx="105" cy="115" rx="3" ry="2" fill="#c8896a" opacity="0.5"/>
      <path d="M85 118 Q100 123, 115 118 Q120 120, 118 126 Q110 123, 100 123 Q90 123, 82 126 Q80 120, 85 118 Z" fill="#b84518"/>
      <path d="M85 119 Q100 122, 115 119" stroke="#9a3815" strokeWidth="1" fill="none"/>
      <path d="M70 123 Q60 135, 65 155 Q80 170, 100 170 Q120 170, 135 155 Q140 135, 130 123 Q115 128, 100 128 Q85 128, 70 123 Z" fill="#c84f19"/>
      <path d="M75 128 Q72 140, 75 150" stroke="#b84518" strokeWidth="2" fill="none"/>
      <path d="M85 130 Q83 142, 85 157" stroke="#b84518" strokeWidth="2" fill="none"/>
      <path d="M95 131 Q94 143, 95 160" stroke="#b84518" strokeWidth="2" fill="none"/>
      <path d="M105 131 Q106 143, 105 160" stroke="#b84518" strokeWidth="2" fill="none"/>
      <path d="M115 130 Q117 142, 115 157" stroke="#b84518" strokeWidth="2" fill="none"/>
      <path d="M125 128 Q128 140, 125 150" stroke="#b84518" strokeWidth="2" fill="none"/>
      <circle cx="90" cy="155" r="3" fill="#8a3512"/>
      <circle cx="110" cy="155" r="3" fill="#8a3512"/>
      <path d="M88 158 L90 165 L92 158" stroke="#f4c2a1" strokeWidth="1" fill="none"/>
      <path d="M108 158 L110 165 L112 158" stroke="#f4c2a1" strokeWidth="1" fill="none"/>
      <path d="M85 133 Q100 138, 115 133" stroke="#8a3512" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="145" cy="115" r="5" fill="none" stroke="#ffd700" strokeWidth="2"/>
      <circle cx="145" cy="120" r="2" fill="#ffd700"/>
      <g transform="translate(130 20) scale(0.15 0.15) rotate(-45 250 250)">
        <path fill="#AE938D" d="M165.407,312.526l35.84,35.84c-29.867,41.813-60.587,72.533-93.013,84.48 ..."/>
      </g>
    </svg>
  )
}

function SlashFX({ img, title, height=200 }: { img?: string; title: string; height?: number }) {
  const H = Math.max(170, Math.min(260, height))
  const W = Math.round(H * 0.67)
  const D = 1
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-30">
      <div className="relative" style={{ width: W, height: H }}>
        <AnimatePresence>
          {img ? (
            <>
              <motion.img key="left" src={img} initial={{ x: 0, rotate: 0, opacity: 1 }} animate={{ x: -38, rotate: -8, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: D, ease: 'easeOut' }} style={{ width: W, height: H, objectFit: 'cover', clipPath: 'inset(0 50% 0 0)', borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,.22)' }}/>
              <motion.img key="right" src={img} initial={{ x: 0, rotate: 0, opacity: 1 }} animate={{ x: 38, rotate: 8, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: D, ease: 'easeOut' }} style={{ width: W, height: H, objectFit: 'cover', clipPath: 'inset(0 0 0 50%)', borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,.22)' }}/>
            </>
          ) : (
            <>
              <motion.div initial={{ x: 0, rotate: 0 }} animate={{ x: -30, rotate: -6 }} transition={{ duration: D, ease: 'easeOut' }} className="bg-candy-100 text-candy-700 font-semibold grid place-items-center text-center" style={{ width: W, height: H, clipPath: 'inset(0 50% 0 0)', borderRadius: 14, padding: 10 }}>
                <span className="text-xs">{title}</span>
              </motion.div>
              <motion.div initial={{ x: 0, rotate: 0 }} animate={{ x: 30, rotate: 6 }} transition={{ duration: D, ease: 'easeOut' }} className="bg-candy-100 text-candy-700 font-semibold grid place-items-center text-center" style={{ width: W, height: H, clipPath: 'inset(0 0 0 50%)', borderRadius: 14, padding: 10 }}>
                <span className="text-xs">{title}</span>
              </motion.div>
            </>
          )}
          <motion.div key="pirate" initial={{ x: -W, y: H/2, rotate: -20, opacity: 0.95 }} animate={{ x: W, y: -H/2, rotate: -20, opacity: 1 }} transition={{ duration: D, ease: 'easeOut' }} className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>
            <PirateSVG />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

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
        const done = all.length>0 && all.every(ep => seenMe.has(`${ep.s}:${ep.e}`))
        if (!done){
          eligible.push({ itemId: it.id, title: it.title, tvId: it.tmdb_id, img: tv.poster_path? TMDB_IMG(tv.poster_path,'w342'): undefined })
        }
      }catch{/* skip on error */}
    }
    if (alive){ setBase(eligible); setLoading(false) }
  })(); return()=>{ alive=false }},[items, meId])

  // === même sizing que la roue films ===
  const [ITEM_H, setITEM_H] = useState(Math.max(180, Math.min(260, Math.round(window.innerWidth * 0.6))))
  useEffect(() => {
    const onR = () => setITEM_H(Math.max(180, Math.min(260, Math.round(window.innerWidth * 0.6))))
    window.addEventListener('resize', onR)
    return () => window.removeEventListener('resize', onR)
  }, [])
  const CONTAINER_H = Math.round(ITEM_H * 2.6)
  const RENDER_LOOPS = 20

  const containerRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<Entry | null>(null)

  const rendered = useMemo(()=>{ if (base.length===0) return []; const reps:Entry[]=[]; for(let i=0;i<RENDER_LOOPS;i++) reps.push(...base); return reps },[base])

  function resetTransform(offset:number){
    if (!listRef.current) return
    listRef.current.style.transition='none'
    listRef.current.style.transform=`translateY(-${offset}px)`
    listRef.current.offsetHeight
  }
  function fireworks(){ const end=Date.now()+1400; (function frame(){ confetti({ particleCount: 28, spread: 70, startVelocity: 36, origin:{ y:.6 } }); if(Date.now()<end) requestAnimationFrame(frame) })() }

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
    if (spinning || base.length===0) return
    setWinner(null)
    setSpinning(true)

    const centerOffset = ( (containerRef.current?.clientHeight || CONTAINER_H) / 2 ) - (ITEM_H/2)
    resetTransform(centerOffset)

    const LOOPS = 15
    const distance = (LOOPS * base.length + Math.floor(Math.random() * base.length)) * ITEM_H

    requestAnimationFrame(()=>{
      if(!listRef.current) return
      const duration = 5.0
      listRef.current.style.transition=`transform ${duration}s cubic-bezier(.12,.6,.05,1)`
      listRef.current.style.transform=`translateY(-${distance + centerOffset}px)`

      setTimeout(async ()=>{
        const w = pickCentered(); if(!w){ setSpinning(false); return }
        setWinner(w)
        fireworks()
        // calcule le prochain épisode non vu pour meId
        const [all, views] = await Promise.all([ getAllEpisodes(w.tvId), listEpisodeViews(w.itemId) ])
        const seenMe = new Set(views.filter(v=>v.user_id===meId).map(v=>`${v.season}:${v.episode}`))
        const next = all.find(ep => !seenMe.has(`${ep.s}:${ep.e}`)) || all[all.length-1]

        const AFTER_WIN_MS = 1750
        setTimeout(()=>{ onFinish({ itemId:w.itemId, tvId:w.tvId, s:next.s, e:next.e, title:w.title }); setSpinning(false) }, AFTER_WIN_MS)
      }, duration*1000 + 80)
    })
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

          <AnimatePresence>
            {winner && (
              <motion.div
                key="slash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0"
              >
                <SlashFX img={winner.img} title={winner.title} height={ITEM_H - 10} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-center mt-3">
          <button
            onClick={spin}
            disabled={spinning || base.length===0}
            className="relative px-8 py-3 rounded-full text-white font-black shadow-candy
                       bg-gradient-to-r from-candy-700 via-candy-600 to-candy-700
                       active:scale-95 transition disabled:opacity-50"
          >
            🎬 Lancer
          </button>
        </div>

        {winner && (
          <div className="text-center font-bold text-candy-700 mt-2">
            🎉 Gagnant : {winner.title}
          </div>
        )}

        <div className="flex justify-center mt-2 mb-1">
          <button className="btn-outline" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  )
}
