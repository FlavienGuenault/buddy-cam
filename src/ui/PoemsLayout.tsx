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
  return (
    <div className="fixed inset-0 pointer-events-none z-[999] bg-gradient-to-b from-emerald-50/80 to-transparent">
      {/* 5 oiseaux SVG avec décalages */}
      <svg className="bird" style={{left:'-10vw', top:'70%', animationDelay:'0ms'}} viewBox="0 0 24 16" fill="none">
        <path d="M2,8 C6,6 6,2 12,6 C18,10 18,6 22,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <svg className="bird" style={{left:'-15vw', top:'60%', animationDelay:'150ms'}} viewBox="0 0 24 16" fill="none">
        <path d="M2,8 C6,5 6,2 12,6 C18,10 18,6 22,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <svg className="bird" style={{left:'-20vw', top:'50%', animationDelay:'300ms'}} viewBox="0 0 24 16" fill="none">
        <path d="M2,8 C6,6 6,2 12,6 C18,10 18,6 22,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <svg className="bird" style={{left:'-25vw', top:'40%', animationDelay:'450ms'}} viewBox="0 0 24 16" fill="none">
        <path d="M2,8 C6,5 6,2 12,6 C18,10 18,6 22,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <svg className="bird" style={{left:'-30vw', top:'65%', animationDelay:'600ms'}} viewBox="0 0 24 16" fill="none">
        <path d="M2,8 C6,6 6,2 12,6 C18,10 18,6 22,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>

      {/* Fallback logo si “réduction des mouvements” */}
      <div className="logo-container">
        <img src="/pwa-512x512.png" alt="" className="logo-rise" />
      </div>
    </div>
  )
}
