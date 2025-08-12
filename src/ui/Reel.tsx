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
              out.push({ itemId: it.id, title: it.title, tmdb_id: it.tmdb_id, img: TMDB_IMG(m.poster_path, 'w342') })
              continue
            }
          } catch { /* ignore */ }
        }
        out.push({ itemId: it.id, title: it.title, tmdb_id: it.tmdb_id ?? undefined })
      }
      if (alive) setEntries(out)
    })()
    return () => { alive = false }
  }, [items])
  return entries
}

// --- Petit pirate (chauve + barbe rousse) ---
function PirateSVG() {
  return (
    <svg width="40" height="40" viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="28" r="14" fill="#f6d2b8"/>
      {/* barbe rousse */}
      <path d="M18,30 C18,42 46,42 46,30 C44,40 40,46 32,46 C24,46 20,40 18,30 Z" fill="#c84f19"/>
      {/* cache-oeil */}
      <rect x="18" y="24" width="28" height="6" rx="3" fill="#101623"/>
      <circle cx="24" cy="27" r="5" fill="#101623"/>
      {/* sabre */}
      <path d="M8 57 L28 37" stroke="#c0c7d1" strokeWidth="5" strokeLinecap="round"/>
      <path d="M28 37 L34 43" stroke="#aab1bb" strokeWidth="4" strokeLinecap="round"/>
      <path d="M6 59 L10 55" stroke="#8c4912" strokeWidth="6" strokeLinecap="round"/>
    </svg>
  )
}

// FX “slash” : coupe l’affiche en deux (si pas d’affiche, on slash le bloc titre)
function SlashFX({ img, title, height=160 }: { img?: string; title: string; height?: number }) {
  const H = Math.max(140, Math.min(220, height))
  const W = Math.round(H * 0.67)
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-30">
      <div className="relative" style={{ width: W, height: H }}>
        <AnimatePresence>
          {img ? (
            <>
              {/* moitié gauche */}
              <motion.img
                key="left"
                src={img}
                initial={{ x: 0, rotate: 0 }}
                animate={{ x: -26, rotate: -8 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{ width: W, height: H, objectFit: 'cover', clipPath: 'inset(0 50% 0 0)', borderRadius: 12, boxShadow: '0 6px 20px rgba(0,0,0,.2)' }}
              />
              {/* moitié droite */}
              <motion.img
                key="right"
                src={img}
                initial={{ x: 0, rotate: 0 }}
                animate={{ x: 26, rotate: 8 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{ width: W, height: H, objectFit: 'cover', clipPath: 'inset(0 0 0 50%)', borderRadius: 12, boxShadow: '0 6px 20px rgba(0,0,0,.2)' }}
              />
            </>
          ) : (
            <>
              <motion.div
                initial={{ x: 0, rotate: 0 }}
                animate={{ x: -20, rotate: -6 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-candy-100 text-candy-700 font-semibold grid place-items-center text-center"
                style={{ width: W, height: H, clipPath: 'inset(0 50% 0 0)', borderRadius: 12, padding: 8 }}
              >
                <span className="text-xs">{title}</span>
              </motion.div>
              <motion.div
                initial={{ x: 0, rotate: 0 }}
                animate={{ x: 20, rotate: 6 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-candy-100 text-candy-700 font-semibold grid place-items-center text-center"
                style={{ width: W, height: H, clipPath: 'inset(0 0 0 50%)', borderRadius: 12, padding: 8 }}
              >
                <span className="text-xs">{title}</span>
              </motion.div>
            </>
          )}
          {/* pirate qui traverse en diagonale */}
          <motion.div
            key="pirate"
            initial={{ x: -W, y: H/2, rotate: -20, opacity: 0.9 }}
            animate={{ x: W, y: -H/2, rotate: -20, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
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

  // hauteur d’un item (affiche) responsive → lisible sur mobile
  const [ITEM_H, setITEM_H] = useState( Math.max(150, Math.min(210, Math.round(window.innerWidth * 0.45))) )
  useEffect(() => {
    const onR = () => setITEM_H(Math.max(150, Math.min(210, Math.round(window.innerWidth * 0.45))))
    window.addEventListener('resize', onR)
    return () => window.removeEventListener('resize', onR)
  }, [])

  const CONTAINER_H = Math.round(ITEM_H * 2.6) // zone visible
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
    listRef.current.style.transform = `translateY(-${offset}px)` // aligne le centre item sur la ligne centrale dès le départ
    // reflow
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    listRef.current.offsetHeight
  }

  function fireworks() {
    const end = Date.now() + 900
    ;(function frame() {
      confetti({ particleCount: 28, spread: 70, startVelocity: 36, origin: { y: 0.6 } })
      if (Date.now() < end) requestAnimationFrame(frame)
    })()
  }

  function spin() {
    if (spinning || base.length === 0) return
    setWinner(null)
    setSpinning(true)

    const containerH = containerRef.current?.clientHeight || CONTAINER_H
    const centerOffset = (containerH / 2) - (ITEM_H / 2) // ➜ corrige l’alignement sur la ligne centrale

    // remet au point de départ *centré*
    resetTransform(centerOffset)

    // choix gagnant
    const winIndex = Math.floor(Math.random() * base.length)
    const LOOPS = 14
    const targetRows = LOOPS * base.length + winIndex
    const distance = targetRows * ITEM_H // déplacement cumulé des lignes

    requestAnimationFrame(() => {
      if (!listRef.current) return
      const duration = 3.6
      listRef.current.style.transition = `transform ${duration}s cubic-bezier(.12,.6,.05,1)`
      listRef.current.style.transform = `translateY(-${distance + centerOffset}px)`
      // fin de scroll
      setTimeout(() => {
        const w = base[winIndex]
        setWinner(w)
        fireworks()
        // laisse jouer le slash FX, puis notifie le parent pour ouvrir la fiche
        setTimeout(() => {
          onFinish({ itemId: w.itemId, tmdb_id: w.tmdb_id, title: w.title })
          setSpinning(false)
        }, 700)
      }, duration * 1000 + 50)
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
          {/* ligne de sélection */}
          <div className="pointer-events-none absolute top-1/2 left-0 right-0 -translate-y-1/2 border-y-2 border-candy-300/60 z-10" />

          {/* liste qui défile */}
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

          {/* FX slash sur le gagnant */}
          <AnimatePresence>
            {winner && (
              <motion.div
                key="slash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
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