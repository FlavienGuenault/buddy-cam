import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { getMovie, TMDB_IMG } from '../lib/tmdb'

type ReelItem = { id: string; title: string; tmdb_id?: number | null }
type Winner = { itemId: string; tmdb_id?: number; title: string }
type Entry = { itemId: string; title: string; img?: string; tmdb_id?: number }

function useReelEntries(items: ReelItem[]) {
  const [entries, setEntries] = useState<Entry[]>([])
  useEffect(() => {
    let alive = true
    ;(async () => {
      const out: Entry[] = []
      for (const it of items) {
        if (it.tmdb_id) {
          try {
            const m = await getMovie(it.tmdb_id)
            if (m?.poster_path) {
              out.push({ itemId: it.id, title: it.title, tmdb_id: it.tmdb_id!, img: TMDB_IMG(m.poster_path, 'w342') })
              continue
            }
          } catch {/* noop */}
        }
        out.push({ itemId: it.id, title: it.title, tmdb_id: it.tmdb_id ?? undefined })
      }
      if (alive) setEntries(out)
    })()
    return () => { alive = false }
  }, [items])
  return entries
}

// Pirate plus grand + œil libre #BBD2E1
function PirateSVG() {
  return (
    <svg width="80" height="80" viewBox="0 0 200 200" aria-hidden>
      {/* Crâne chauve */}
      <ellipse cx="100" cy="100" rx="45" ry="50" fill="#f4c2a1"/>
      {/* Oreilles */}
      <ellipse cx="55" cy="100" rx="12" ry="18" fill="#e8b091"/>
      <ellipse cx="145" cy="100" rx="12" ry="18" fill="#e8b091"/>
      <path d="M58 95 Q60 100, 58 105" stroke="#d4967a" strokeWidth="2" fill="none"/>
      <path d="M142 95 Q140 100, 142 105" stroke="#d4967a" strokeWidth="2" fill="none"/>
      {/* Cache-œil + cordon */}
      <ellipse cx="75" cy="95" rx="18" ry="15" fill="#000000"/>
      <line x1="45" y1="85" x2="57" y2="92" stroke="#000000" strokeWidth="3"/>
      <line x1="93" y1="98" x2="155" y2="108" stroke="#000000" strokeWidth="3"/>
      {/* Œil bleu fumé visible */}
      <ellipse cx="125" cy="95" rx="14" ry="12" fill="#ffffff"/>
      <ellipse cx="125" cy="95" rx="10" ry="10" fill="#4a7c8f"/>
      <ellipse cx="125" cy="95" rx="7" ry="7" fill="#6b95a8"/>
      <circle cx="125" cy="95" r="4" fill="#1a3442"/>
      <circle cx="127" cy="93" r="2" fill="#ffffff" opacity="0.8"/>
      {/* Cicatrices */}
      <path d="M65 75 L72 82" stroke="#c8896a" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M135 110 L142 117" stroke="#c8896a" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M90 80 L95 85" stroke="#c8896a" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Nez */}
      <path d="M100 100 L95 115 Q100 118, 105 115 Z" fill="#e0a182"/>
      <ellipse cx="95" cy="115" rx="3" ry="2" fill="#c8896a" opacity="0.5"/>
      <ellipse cx="105" cy="115" rx="3" ry="2" fill="#c8896a" opacity="0.5"/>
      {/* Moustache rousse */}
      <path d="M85 118 Q100 123, 115 118 Q120 120, 118 126 Q110 123, 100 123 Q90 123, 82 126 Q80 120, 85 118 Z" fill="#b84518"/>
      <path d="M85 119 Q100 122, 115 119" stroke="#9a3815" strokeWidth="1" fill="none"/>
      {/* Barbe rousse touffue */}
      <path d="M70 123 Q60 135, 65 155 Q80 170, 100 170 Q120 170, 135 155 Q140 135, 130 123 Q115 128, 100 128 Q85 128, 70 123 Z" fill="#c84f19"/>
      {/* Détails barbe */}
      <path d="M75 128 Q72 140, 75 150" stroke="#b84518" strokeWidth="2" fill="none"/>
      <path d="M85 130 Q83 142, 85 157" stroke="#b84518" strokeWidth="2" fill="none"/>
      <path d="M95 131 Q94 143, 95 160" stroke="#b84518" strokeWidth="2" fill="none"/>
      <path d="M105 131 Q106 143, 105 160" stroke="#b84518" strokeWidth="2" fill="none"/>
      <path d="M115 130 Q117 142, 115 157" stroke="#b84518" strokeWidth="2" fill="none"/>
      <path d="M125 128 Q128 140, 125 150" stroke="#b84518" strokeWidth="2" fill="none"/>
      {/* Tresses */}
      <circle cx="90" cy="155" r="3" fill="#8a3512"/>
      <circle cx="110" cy="155" r="3" fill="#8a3512"/>
      <path d="M88 158 L90 165 L92 158" stroke="#f4c2a1" strokeWidth="1" fill="none"/>
      <path d="M108 158 L110 165 L112 158" stroke="#f4c2a1" strokeWidth="1" fill="none"/>
      {/* Bouche */}
      <path d="M85 133 Q100 138, 115 133" stroke="#8a3512" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Boucle d'oreille */}
      <circle cx="145" cy="115" r="5" fill="none" stroke="#ffd700" strokeWidth="2"/>
      <circle cx="145" cy="120" r="2" fill="#ffd700"/>
      {/* Sabre (groupe) */}
      <g transform="translate(130 20) scale(0.15 0.15) rotate(-45 250 250)">
        <path fill="#AE938D" d="M165.407,312.526l35.84,35.84c-29.867,41.813-60.587,72.533-93.013,84.48
          c1.707,11.093-0.853,22.187-9.387,30.72c-13.653,13.653-34.987,13.653-47.787,0c-13.653-13.653-13.653-34.987,0-48.64
          c8.533-8.533,19.627-11.093,29.867-9.387C92.874,373.113,129.567,336.42,165.407,312.526"/>
        <path fill="#E4F2DE" d="M382.154,2.767c0,0,130.56,107.52,30.72,207.36c-96.427,96.427-174.933,127.147-174.933,127.147
          l-36.693,11.947l-35.84-35.84l66.56-66.56c23.893-23.893,72.533-72.533,84.48-132.267C374.474,54.82,382.154,2.767,382.154,2.767"/>
        <path fill="#51565F" d="M159.461,502.967c-13.653,0-27.307-5.973-39.253-17.067c-1.707-1.707-1.707-4.267,0-5.973
          c1.707-1.707,4.267-1.707,5.973,0c19.627,19.627,46.933,19.627,66.56,0l35.84-35.84c9.387-9.387,14.507-21.333,14.507-33.28
          s-5.12-23.893-14.507-33.28l-20.48-20.48c-31.573,43.52-59.733,69.12-88.747,80.213c0.853,11.093-3.413,22.187-11.093,30.72
          c-15.36,15.36-39.253,15.36-54.613,0c-15.36-15.36-15.36-39.253,0-54.613c7.68-7.68,19.627-11.947,30.72-11.093
          c11.947-29.013,42.667-63.147,80.213-88.747L132.155,281.1c-1.707-1.707-1.707-4.267,0-5.973c1.707-1.707,4.267-1.707,5.973,0
          l33.28,33.28l63.147-63.147c23.04-23.04,71.68-71.68,83.627-130.56c0-0.853,0.853-1.707,0.853-2.56
          c56.32-56.32,64-107.52,64.853-108.373c0-1.707,0.853-2.56,2.56-3.413s3.413,0,4.267,0.853c2.56,2.56,66.56,55.467,69.973,122.88
          c1.707,32.427-11.093,63.147-38.4,90.453c-96.427,96.427-175.787,127.147-176.64,128c-2.56,0.853-4.267,0-5.12-2.56
          c-0.853-2.56,0-4.267,2.56-5.12c0.853,0,78.507-30.72,173.227-125.44c25.6-25.6,37.547-53.76,36.693-84.48
          c-2.56-52.907-46.08-98.133-61.44-111.787c-4.267,17.067-18.773,58.88-64.853,104.96c-12.8,61.44-61.44,110.08-85.333,133.973
          l-63.147,63.147l57.173,57.173c22.187,22.187,22.187,56.32,0,78.507l-35.84,35.84C186.767,496.993,173.114,502.967,159.461,502.967z"/>
      </g>
    </svg>
  )
}

// FX slash — ralenti
function SlashFX({ img, title, height=200 }: { img?: string; title: string; height?: number }) {
  const H = Math.max(170, Math.min(260, height))
  const W = Math.round(H * 0.67)
  const D = 1    // secondes

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-30">
      <div className="relative" style={{ width: W, height: H }}>
        <AnimatePresence>
          {img ? (
            <>
              <motion.img
                key="left"
                src={img}
                initial={{ x: 0, rotate: 0, opacity: 1 }}
                animate={{ x: -38, rotate: -8, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: D, ease: 'easeOut' }}
                style={{ width: W, height: H, objectFit: 'cover', clipPath: 'inset(0 50% 0 0)', borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,.22)' }}
              />
              <motion.img
                key="right"
                src={img}
                initial={{ x: 0, rotate: 0, opacity: 1 }}
                animate={{ x: 38, rotate: 8, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: D, ease: 'easeOut' }}
                style={{ width: W, height: H, objectFit: 'cover', clipPath: 'inset(0 0 0 50%)', borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,.22)' }}
              />
            </>
          ) : (
            <>
              <motion.div
                initial={{ x: 0, rotate: 0 }}
                animate={{ x: -30, rotate: -6 }}
                transition={{ duration: D, ease: 'easeOut' }}
                className="bg-candy-100 text-candy-700 font-semibold grid place-items-center text-center"
                style={{ width: W, height: H, clipPath: 'inset(0 50% 0 0)', borderRadius: 14, padding: 10 }}
              >
                <span className="text-xs">{title}</span>
              </motion.div>
              <motion.div
                initial={{ x: 0, rotate: 0 }}
                animate={{ x: 30, rotate: 6 }}
                transition={{ duration: D, ease: 'easeOut' }}
                className="bg-candy-100 text-candy-700 font-semibold grid place-items-center text-center"
                style={{ width: W, height: H, clipPath: 'inset(0 0 0 50%)', borderRadius: 14, padding: 10 }}
              >
                <span className="text-xs">{title}</span>
              </motion.div>
            </>
          )}
          <motion.div
            key="pirate"
            initial={{ x: -W, y: H/2, rotate: -20, opacity: 0.95 }}
            animate={{ x: W, y: -H/2, rotate: -20, opacity: 1 }}
            transition={{ duration: D, ease: 'easeOut' }}
            className="absolute"
            style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}
          >
            <PirateSVG />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function Reel({
  items,
  onFinish,
  onClose
}: {
  items: ReelItem[]
  onFinish: (w: Winner) => void
  onClose: () => void
}) {
  const base = useReelEntries(items)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<Entry | null>(null)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  // Posters plus grands, responsive; on fige pendant le spin
  const [ITEM_H, setITEM_H] = useState(Math.max(180, Math.min(260, Math.round(window.innerWidth * 0.6))))
  useEffect(() => {
    if (spinning) return
    const onR = () => setITEM_H(Math.max(180, Math.min(260, Math.round(window.innerWidth * 0.6))))
    window.addEventListener('resize', onR)
    return () => window.removeEventListener('resize', onR)
  }, [spinning])

  const CONTAINER_H = Math.round(ITEM_H * 2.6)
  const RENDER_LOOPS = 20

  const rendered = useMemo(() => {
    if (base.length === 0) return []
    const reps: Entry[] = []
    for (let i = 0; i < RENDER_LOOPS; i++) reps.push(...base)
    return reps
  }, [base])

  function resetTransform(offset: number) {
    if (!listRef.current) return
    listRef.current.style.transition = 'none'
    listRef.current.style.transform = `translateY(-${offset}px)`
    // reflow
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    listRef.current.offsetHeight
  }

  function fireworks() {
    const end = Date.now() + 1400
    ;(function frame() {
      confetti({ particleCount: 28, spread: 70, startVelocity: 36, origin: { y: 0.6 } })
      if (Date.now() < end) requestAnimationFrame(frame)
    })()
  }

  // 🔥 Sélection DOM : on prend l'enfant dont le centre est le plus proche de la ligne centrale
  function pickCenteredByDOM(): Entry | null {
    const container = containerRef.current
    const list = listRef.current
    if (!container || !list || base.length === 0) return null

    const centerY = container.getBoundingClientRect().top + container.clientHeight / 2
    let bestIdx = -1
    let bestDist = Infinity
    const children = Array.from(list.children) as HTMLElement[]

    for (let i = 0; i < children.length; i++) {
      const r = children[i].getBoundingClientRect()
      const c = r.top + r.height / 2
      const d = Math.abs(c - centerY)
      if (d < bestDist) { bestDist = d; bestIdx = i }
    }
    if (bestIdx < 0) return null
    const idxInBase = bestIdx % base.length
    return base[idxInBase]
  }

  function spin() {
    if (spinning || base.length === 0) return
    setWinner(null)
    setSpinning(true)

    const spinH = ITEM_H // figé
    const containerH = containerRef.current?.clientHeight || CONTAINER_H
    const centerOffset = (containerH / 2) - (spinH / 2)

    // centre le premier item
    resetTransform(centerOffset)

    // défilement (on se moque de compter les rangs; on lira le DOM à la fin)
    const LOOPS = 15
    const distance = (LOOPS * base.length + Math.floor(Math.random() * base.length)) * spinH

    requestAnimationFrame(() => {
      if (!listRef.current) return
      const duration = 5.0 // ralentit encore le scroll
      listRef.current.style.transition = `transform ${duration}s cubic-bezier(.12,.6,.05,1)`
      listRef.current.style.transform = `translateY(-${distance + centerOffset}px)`

      setTimeout(() => {
        // ➜ lit le DOM pour prendre l’affiche centrée (plus d’off-by-one)
        const w = pickCenteredByDOM()
        if (!w) { setSpinning(false); return }
        setWinner(w)
        fireworks()
        // laisse le pirate couper (3.75s), puis onFinish
        const AFTER_WIN_MS = 1750
        setTimeout(() => {
        onFinish({ itemId: w.itemId, tmdb_id: w.tmdb_id, title: w.title })
        setSpinning(false)
        }, AFTER_WIN_MS)
      }, duration * 1000 + 80)
    })
  }

  return (
    <div className="fixed inset-0 z-[3000] grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="card w-full max-w-sm sm:max-w-md" onClick={(e)=>e.stopPropagation()}>
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-2xl bg-white"
          style={{ height: CONTAINER_H }}
        >
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent z-10" />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-10" />
          <div className="pointer-events-none absolute top-1/2 left-0 right-0 -translate-y-1/2 border-y-2 border-candy-300/60 z-10" />

          <div ref={listRef}>
            {rendered.map((e, i) => (
              <div key={i} className="grid place-items-center" style={{ height: ITEM_H }}>
                {e.img ? (
                  <img
                    src={e.img}
                    alt=""
                    className="rounded-xl object-cover shadow ring-1 ring-black/5"
                    style={{ height: ITEM_H - 10, width: 'auto' }}
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="rounded-xl bg-candy-100 grid place-items-center text-center px-2"
                    style={{ height: ITEM_H - 10, width: Math.round((ITEM_H - 10) * 0.67) }}
                  >
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
            disabled={spinning || base.length === 0}
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