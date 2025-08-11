import { motion } from 'framer-motion'
export default function Stars({ value=8, onChange }:{ value:number; onChange:(n:number)=>void }){
  const N = 10
  return (
    <div className="flex gap-1">
      {Array.from({length:N},(_,i)=>i+1).map(n=>{
        const active = n <= value
        return (
          <motion.button key={n} whileTap={{ scale: .9 }}
            className={`text-2xl ${active?'text-candy-500':'text-gray-300'}`}
            onClick={()=>onChange(n)} aria-label={`${n}/10`}>
            ★
          </motion.button>
        )
      })}
    </div>
  )
}
