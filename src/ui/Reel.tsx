import { useEffect, useMemo, useRef, useState } from 'react'
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

  const listRef = useRef<HTMLDivElement | null>(null)
  const ITEM_H = 120
  const RENDER_LOOPS = 20

  const rendered = useMemo(() => {
    if (base.length === 0) return []
    const reps: Entry[] = []
    for (let i = 0; i < RENDER_LOOPS; i++) reps.push(...base)
    return reps
  }, [base])

  function resetTransform() {
    if (!listRef.current) return
    listRef.current.style.transition = 'none'
    listRef.current.style.transform = 'translateY(0px)'
    // reflow
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    listRef.current.offsetHeight
  }

  function fireworks() {
    const end = Date.now() + 900
    ;(function frame() {
      confetti({ particleCount: 24, spread: 70, startVelocity: 36, origin: { y: 0.6 } })
      if (Date.now() < end) requestAnimationFrame(frame)
    })()
  }

  function spin() {
    if (spinning || base.length === 0) return
    setWinner(null)
    setSpinning(true)
    resetTransform()

    const win = Math.floor(Math.random() * base.length)
    const LOOPS = 14
    const targetRows = LOOPS * base.length + win
    const distance = targetRows * ITEM_H
    const duration = 3.8 // s

    requestAnimationFrame(() => {
      if (!listRef.current) return
      listRef.current.style.transition = `transform ${duration}s cubic-bezier(.12,.6,.05,1)`
      listRef.current.style.transform = `translateY(-${distance}px)`
    })

    setTimeout(() => {
      const w = base[win]
      setWinner(w)
      fireworks()
      // laisse respirer 380 ms avant de notifier le parent (ouverture fiche)
      setTimeout(() => {
        onFinish({ itemId: w.itemId, tmdb_id: w.tmdb_id, title: w.title })
      }, 380)
      setSpinning(false)
    }, duration * 1000 + 60)
  }

  return (
    <div className="fixed inset-0 z-[3000] grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="card w-full max-w-sm sm:max-w-md" onClick={(e)=>e.stopPropagation()}>
        <div className="relative h-[320px] overflow-hidden rounded-2xl bg-white">
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent z-10" />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-10" />
          <div className="pointer-events-none absolute top-1/2 left-0 right-0 -translate-y-1/2 border-y-2 border-candy-300/60 z-10" />

          <div ref={listRef}>
            {rendered.map((e, i) => (
              <div key={i} className="h-[120px] grid place-items-center">
                {e.img ? (
                  <img
                    src={e.img}
                    alt=""
                    className="h-[110px] w-auto rounded-xl object-cover shadow ring-1 ring-black/5"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-[110px] w-[76px] rounded-xl bg-candy-100 grid place-items-center text-center px-2">
                    <span className="text-xs font-semibold text-candy-700 line-clamp-3">{e.title}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
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