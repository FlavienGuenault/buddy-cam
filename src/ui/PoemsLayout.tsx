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
  return (
    <div className="fixed inset-0 pointer-events-none z-[999] bg-gradient-to-b from-emerald-50/80 to-transparent">
      <div className="poem-birds-container">
        {/* 12 oiseaux, timings variés */}
        <div className="bird-container bird-container--1"><div className="bird bird--1"/></div>
        <div className="bird-container bird-container--2"><div className="bird bird--2"/></div>
        <div className="bird-container bird-container--3"><div className="bird bird--3"/></div>
        <div className="bird-container bird-container--4"><div className="bird bird--4"/></div>
        <div className="bird-container bird-container--5"><div className="bird bird--5"/></div>
        <div className="bird-container bird-container--6"><div className="bird bird--6"/></div>
        <div className="bird-container bird-container--7"><div className="bird bird--7"/></div>
        <div className="bird-container bird-container--8"><div className="bird bird--8"/></div>
        <div className="bird-container bird-container--9"><div className="bird bird--9"/></div>
        <div className="bird-container bird-container--10"><div className="bird bird--10"/></div>
        <div className="bird-container bird-container--11"><div className="bird bird--11"/></div>
        <div className="bird-container bird-container--12"><div className="bird bird--12"/></div>
      </div>

      {/* Fallback logo si réduction des mouvements */}
      <div className="logo-container">
        <img src={logoUrl} className="logo-rise" alt="logo"/>
      </div>
    </div>
  )
}
