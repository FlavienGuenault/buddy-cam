export default function Logo({ className = '' }: { className?: string }){
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Buddy&Cam">
      <circle cx="60" cy="60" r="56" fill="#fff"/>
      {[...Array(8)].map((_,i)=>{
        const a = (i*45)*Math.PI/180
        const cx = 60 + Math.cos(a)*28
        const cy = 60 + Math.sin(a)*28
        return <circle key={i} cx={cx} cy={cy} r={18} fill="#e11d48" opacity={0.95}/>
      })}
      <circle cx="60" cy="60" r="14" fill="#fff"/>
      <circle cx="60" cy="60" r="8" fill="#e11d48"/>
      <path d="M15 45 Q60 25 105 45 L105 60 Q60 40 15 60 Z" fill="#0f172a"/>
      <circle cx="96" cy="52" r="6" fill="#0f172a"/>
    </svg>
  )
}
