import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { getMovie, TMDB_IMG } from '../lib/tmdb'

type ReelItem = { id: string; title: string; tmdb_id?: number | null }
type Winner = { itemId: string; tmdb_id?: number; title: string }
type Entry = { itemId: string; title: string; img?: string; tmdb_id?: number }

// charge les affiches
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

// Pirate (plus grand) + œil libre #BBD2E1
function PirateSVG() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="28" r="14" fill="#f6d2b8"/>
      {/* barbe rousse */}
      <path d="M18,30 C18,42 46,42 46,30 C44,40 40,48 32,48 C24,48 20,40 18,30 Z" fill="#c84f19"/>
      {/* bandeau + cache-oeil côté gauche */}
      <rect x="16" y="24" width="32" height="6" rx="3" fill="#101623"/>
      <circle cx="22" cy="27" r="6" fill="#101623"/>
      {/* œil libre côté droit */}
      <circle cx="42" cy="27" r="4.2" fill="#BBD2E1"/>
      <circle cx="42" cy="27" r="1.6" fill="#0e1320"/>
      {/* sabre */}
      <path d="M6 60 L28 38" stroke="#c0c7d1" strokeWidth="6" strokeLinecap="round"/>
      <path d="M28 38 L35 45" stroke="#aab1bb" strokeWidth="5" strokeLinecap="round"/>
      <path d="M5 62 L11 56" stroke="#8c4912" strokeWidth="7" strokeLinecap="round"/>
    </svg>
  )
}

// FX “slash” (poster coupé en 2) — ralenti x2.5 (durée 1.25s)
function SlashFX({ img, title, height=200 }: { img?: string; title: string; height?: number }) {
  const H = Math.max(170, Math.min(260, height))
  const W = Math.round(H * 0.67)
  const D = 1.25 // secondes (x2.5 vs 0.5)

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
                animate={{ x: -32, rotate: -8, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: D, ease: 'easeOut' }}
                style={{ width: W, height: H, objectFit: 'cover', clipPath: 'inset(0 50% 0 0)', borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,.22)' }}
              />
              <motion.img
                key="right"
                src={img}
                initial={{ x: 0, rotate: 0, opacity: 1 }}
                animate={{ x: 32, rotate: 8, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: D, ease: 'easeOut' }}
                style={{ width: W, height: H, objectFit: 'cover', clipPath: 'inset(0 0 0 50%)', borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,.22)' }}
              />
            </>
          ) : (
            <>
              <motion.div
                initial={{ x: 0, rotate: 0 }}
                animate={{ x: -26, rotate: -6 }}
                transition={{ duration: D, ease: 'easeOut' }}
                className="bg-candy-100 text-candy-700 font-semibold grid place-items-center text-center"
                style={{ width: W, height: H, clipPath: 'inset(0 50% 0 0)', borderRadius: 14, padding: 10 }}
              >
                <span className="text-xs">{title}</span>
              </motion.div>
              <motion.div
                initial={{ x: 0, rotate: 0 }}
                animate={{ x: 26, rotate: 6 }}
                transition={{ duration: D, ease: 'easeOut' }}
                className="bg-candy-100 text-candy-700 font-semibold grid place-items-center text-center"
                style={{ width: W, height: H, clipPath: 'inset(0 0 0 50%)', borderRadius: 14, padding: 10 }}
              >
                <span className="text-xs">{title}</span>
              </motion.div>
            </>
          )}
          {/* pirate ralenti */}
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

  // Posters plus grands, responsive (verrouillés pendant le spin)
  const [ITEM_H, setITEM_H] = useState(Math.max(180, Math.min(260, Math.round(window.innerWidth * 0.6))))
  useEffect(() => {
    if (spinning) return // on ne bouge pas la hauteur pendant l’anim
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
    listRef.current.style.transform = `translateY(-${offset}px)` // aligne centre item sur la ligne centrale
    // reflow
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    listRef.current.offsetHeight
  }

  function fireworks() {
    const end = Date.now() + 1200
    ;(function frame() {
      confetti({ particleCount: 28, spread: 70, startVelocity: 36, origin: { y: 0.6 } })
      if (Date.now() < end) requestAnimationFrame(frame)
    })()
  }

  // calcule l’index réellement centré à partir du transform final
  function winnerFromTransform(finalTranslateY: number, spinH: number, centerOffset: number) {
    // translateY = -(distance + centerOffset)
    const traveled = Math.max(0, -(finalTranslateY) - centerOffset)
    const rows = Math.round(traveled / spinH)
    const idx = ((rows % base.length) + base.length) % base.length
    return base[idx]
  }

  function getCurrentTranslateY(el: HTMLElement) {
    const st = window.getComputedStyle(el)
    const t = st.transform
    if (!t || t === 'none') return 0
    // DOMMatrixReadOnly est supporté large
    const m = new DOMMatrixReadOnly(t)
    return m.m42 // translateY
  }

  function spin() {
    if (spinning || base.length === 0) return
    setWinner(null)
    setSpinning(true)

    // verrouille la hauteur pour tout le spin
    const spinH = ITEM_H

    const containerH = containerRef.current?.clientHeight || CONTAINER_H
    const centerOffset = (containerH / 2) - (spinH / 2)

    // reset centré
    resetTransform(centerOffset)

    // choix gagnant "théorique"
    const winIndex = Math.floor(Math.random() * base.length)
    const LOOPS = 14
    const targetRows = LOOPS * base.length + winIndex
    const distance = targetRows * spinH

    requestAnimationFrame(() => {
      if (!listRef.current) return
      const duration = 3.6 // on garde la même vitesse de défilement
      listRef.current.style.transition = `transform ${duration}s cubic-bezier(.12,.6,.05,1)`
      listRef.current.style.transform = `translateY(-${distance + centerOffset}px)`

      // à la fin…
      setTimeout(() => {
        const el = listRef.current!
        // on lit la position réelle (prise en compte des arrondis)
        const ty = getCurrentTranslateY(el)
        const w = winnerFromTransform(ty, spinH, centerOffset)
        setWinner(w)
        fireworks()
        // laisse le pirate couper (1.25s) puis ouvre la fiche en douceur
        setTimeout(() => {
          onFinish({ itemId: w.itemId, tmdb_id: w.tmdb_id, title: w.title })
          setSpinning(false)
        }, 1250)
      }, duration * 1000 + 60)
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
          {/* masques top/bottom */}
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent z-10" />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-10" />
          {/* ligne centrale */}
          <div className="pointer-events-none absolute top-1/2 left-0 right-0 -translate-y-1/2 border-y-2 border-candy-300/60 z-10" />

          {/* liste */}
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

          {/* FX slash sur le gagnant (calé au centre) */}
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