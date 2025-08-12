import { useEffect, useMemo, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'

const BIRDS_COUNT = 36
const DELAY_STEP_MS = 35      // écart entre départs
const DURATION_MS   = 1200    // durée identique → vitesse constante
const SAFETY_MS     = (BIRDS_COUNT-1)*DELAY_STEP_MS + DURATION_MS + 1500;     // filet de sécurité (au cas où)

export default function PoemsLayout(){
  const [show, setShow] = useState(true)

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('poems-theme')
    return () => { root.classList.remove('poems-theme') }
  }, [])

  return (
    <div className="min-h-screen">
      {show && <BirdsOverlay onDone={()=>setShow(false)} />}
      <Outlet />
    </div>
  )
}

function BirdsOverlay({ onDone }: { onDone: () => void }){
  const logoUrl = `${import.meta.env.BASE_URL}pwa-192x192.png`
  const containerRef = useRef<HTMLDivElement>(null)
  const doneRef = useRef(false)

  const birds = useMemo(() => {
    return Array.from({ length: BIRDS_COUNT }).map((_, i) => {
      const top = `${Math.round(Math.random()*80)}%` // couvre haut/bas
      const delayMs = i * DELAY_STEP_MS
      return { i, top, delayMs }
    })
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const nodes = Array.from(el.querySelectorAll('.bird-container'))
    let finished = 0

    const onAnimEnd = (e: Event) => {
      // ⛔ ignore les animationend qui viennent des enfants (les ailes)
      if (e.target !== e.currentTarget) return

      finished += 1
      if (!doneRef.current && finished >= nodes.length) {
        doneRef.current = true
        // petite marge pour être sûr que tout est sorti de l’écran
        setTimeout(onDone, 120)
      }
    }

    nodes.forEach(n => n.addEventListener('animationend', onAnimEnd as any))
    // filet de sécu (ne sert normalement jamais)
    const safety = setTimeout(() => { if (!doneRef.current) onDone() }, SAFETY_MS)

    return () => {
      clearTimeout(safety)
      nodes.forEach(n => n.removeEventListener('animationend', onAnimEnd as any))
    }
  }, [onDone])

  return (
    <div className="fixed inset-0 pointer-events-none z-[999] bg-gradient-to-b from-emerald-50/80 to-transparent">
      <div ref={containerRef} className="poem-birds-container">
        {birds.map(({ i, top, delayMs }) => (
          <div
            key={i}
            className="bird-container"
            style={{
              top, left: '-18vw',
              animationDelay: `${delayMs}ms`,
              animationDuration: `${DURATION_MS}ms`,
            }}
          >
            {/* battement d’ailes (indépendant, mais finit avant la trajectoire) */}
            <div className="bird" style={{ animationDuration: '650ms' }} />
          </div>
        ))}
      </div>

      {/* Fallback logo si reduce motion */}
      <div className="logo-container">
        <img src={logoUrl} className="logo-rise" alt="logo"/>
      </div>
    </div>
  )
}
