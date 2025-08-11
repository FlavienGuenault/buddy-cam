import { useMemo, useRef, useState } from 'react'
import CandyButton from './CandyButton'
import confetti from 'canvas-confetti'

export default function Wheel({ items, onFinish, onClose }:{
  items:{id:string; label:string}[]; onFinish:(id:string)=>void; onClose:()=>void }){
  const n = Math.max(items.length, 1)
  const [rot, setRot] = useState(0)
  const spinning = useRef(false)
  const seg = 360 / n
  const palette = ['#ff4f8a','#ff6fa1','#ff99bb','#ffc9da','#ffe4ec']
  const slices = useMemo(()=>items.map((it,i)=>({ ...it, start:i*seg })),[items])

  function fireworks(){
    const end = Date.now() + 800
    ;(function frame(){
      confetti({ particleCount: 16, spread: 70, startVelocity: 35, origin: { y: 0.6 } })
      if (Date.now() < end) requestAnimationFrame(frame)
    })()
  }

  function spin(){
    if (spinning.current || n===0) return
    spinning.current = true
    const win = Math.floor(Math.random()*n)
    const target = 360*5 + (360 - (win*seg + seg/2))
    setRot(r => r + target)
    setTimeout(()=>{
      fireworks()
      onFinish(items[win].id)
      spinning.current=false
    }, 5200)
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="card w-full max-w-xl grid gap-4" onClick={e=>e.stopPropagation()}>
        <div className="relative mx-auto">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-3xl">▼</div>
          <svg viewBox="0 0 100 100" className="w-80 h-80"
               style={{ transform:`rotate(${rot}deg)`, transition:'transform 5.2s cubic-bezier(.22,.61,.36,1)' }}>
            {slices.map((s,i)=>{
              const a0 = (s.start-90)*Math.PI/180, a1 = (s.start+seg-90)*Math.PI/180
              const x0 = 50+50*Math.cos(a0), y0=50+50*Math.sin(a0)
              const x1 = 50+50*Math.cos(a1), y1=50+50*Math.sin(a1)
              const large = seg>180?1:0
              return (
                <g key={i}>
                  <path d={`M50,50 L${x0},${y0} A50,50 0 ${large} 1 ${x1},${y1} Z`} fill={palette[i%palette.length]} />
                  <text x="50" y="50" fontSize="4" fill="#0f172a" textAnchor="middle" dominantBaseline="middle"
                        transform={`rotate(${s.start+seg/2} 50 50) translate(0 -32)`}>
                    {s.label.slice(0,12)}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
        <div className="flex justify-center">
          <button
            onClick={spin}
            className="px-6 py-3 rounded-full text-white font-black shadow-candy
                       bg-gradient-to-r from-candy-500 via-candy-400 to-candy-500
                       animate-[bounceSoft_1s_both] [animation-iteration-count:infinite]"
            style={{ filter:'hue-rotate(10deg)' }}
          >
            🎡 Spin Me!
          </button>
        </div>
        <div className="flex justify-center">
          <CandyButton className="btn-outline" onClick={onClose}>Fermer</CandyButton>
        </div>
      </div>
    </div>
  )
}
