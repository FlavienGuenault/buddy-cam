import { useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'

export default function Wheel({ items, onFinish, onClose }:{
  items:{id:string; label:string}[]; onFinish:(id:string)=>void; onClose:()=>void }){
  const n = Math.max(items.length, 1)
  const [rot, setRot] = useState(0)
  const [winner, setWinner] = useState<string | null>(null)
  const spinning = useRef(false)
  const seg = 360 / n
  const palette = ['#b01535','#e75c7d','#f28aa3','#fac0cd','#fde2e7']
  const slices = useMemo(()=>items.map((it,i)=>({ ...it, start:i*seg })),[items])

  function fireworks(){
    const end = Date.now() + 1000
    ;(function frame(){
      confetti({ particleCount: 22, spread: 70, startVelocity: 38, origin: { y: 0.6 } })
      if (Date.now() < end) requestAnimationFrame(frame)
    })()
  }

  function spin(){
    if (spinning.current || n===0) return
    spinning.current = true; setWinner(null)
    const win = Math.floor(Math.random()*n)
    const target = 360*5 + (360 - (win*seg + seg/2))
    setRot(r => r + target)
    setTimeout(()=>{
      setWinner(items[win].label)
      fireworks()
      onFinish(items[win].id)
      spinning.current=false
    }, 5200)
  }

  return (
    <div className="fixed inset-0 z-[3000] grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="card w-full max-w-xl grid gap-4" onClick={e=>e.stopPropagation()}>
        <div className="relative mx-auto">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-3xl z-10">▼</div>
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
            className="relative px-8 py-3 rounded-full text-white font-black shadow-candy
                      bg-gradient-to-r from-candy-700 via-candy-600 to-candy-700
                      animate-[bounceSoft_1s_both] [animation-iteration-count:infinite]
                      overflow-hidden"
          >
            <span className="relative z-10">🎡 Spin Me!</span>
            <span className="absolute inset-0 opacity-40 bg-gradient-to-r from-white/0 via-white/40 to-white/0
                            -skew-x-12 translate-x-[-120%] animate-[shine_1.8s_infinite]"></span>
          </button>
        </div>
        {winner && <div className="text-center font-bold text-candy-700">🎉 Gagnant : {winner}</div>}
        <div className="flex justify-center">
          <button className="btn-outline" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  )
}
