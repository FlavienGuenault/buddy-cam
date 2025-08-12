import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'

export default function PoemsLayout(){
  const [show, setShow] = useState(true)

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('poems-theme')
    const t = setTimeout(()=>setShow(false), 1400) // durée de l’anim
    return () => { root.classList.remove('poems-theme'); clearTimeout(t) }
  }, [])

  return (
    <div className="min-h-screen">
      {show && <BirdsOverlay/>}
      <Outlet />
    </div>
  )
}

function BirdsOverlay(){
  const logoUrl = `${import.meta.env.BASE_URL}pwa-192x192.png`

  const birds = Array.from({ length: 48 }).map((_, i) => {
    // top entre 0% et 80% => couvre vraiment tout l’écran
    const top = `${Math.round(Math.random()*80)}%`
    const delayMs = i * 60  // étalement
    const dur = 1.45 + (Math.random()*0.6) // 1.45s - 2.05s
    const wing = 0.92 + (Math.random()*0.25) // battement
    return { i, top, delayMs, dur, wing }
  })

  return (
    <div className="fixed inset-0 pointer-events-none z-[999] bg-gradient-to-b from-emerald-50/80 to-transparent">
      <div className="poem-birds-container">
        {birds.map(({ i, top, delayMs, dur, wing }) => (
          <div
            key={i}
            className="bird-container"
            style={{
              top, left: '-18vw',
              animationDelay: `${delayMs}ms`,
              animationDuration: `${dur}s`,
            }}
          >
            <div
              className="bird"
              style={{ animationDuration: `${wing}s` }}
            />
          </div>
        ))}
      </div>

      {/* Fallback logo si réduction des mouvements */}
      <div className="logo-container">
        <img src={logoUrl} className="logo-rise" alt="logo"/>
      </div>
    </div>
  )
}
