import { motion } from 'framer-motion'

export default function FancyWheelButton({ onClick }: { onClick: () => void }) {
  return (
    // le wrapper ne capte pas les clics → tu peux scroller dessous
    <div className="fixed left-1/2 -translate-x-1/2 bottom-[max(20px,env(safe-area-inset-bottom))] z-[1300] pointer-events-none">
      <motion.button
        onClick={onClick}
        initial={{ scale: 0.95 }}
        animate={{ scale: [1, 1.06, 1], rotate: [0, -2, 2, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-auto relative px-8 py-4 rounded-full text-white font-black shadow-candy
                   bg-gradient-to-r from-candy-700 via-candy-500 to-candy-700 border-4 border-white/40"
        aria-label="Lance la roue"
      >
        <span className="text-2xl mr-2">🎡</span>
        <span className="text-lg">Lance la roue&nbsp;!</span>
        <span className="absolute inset-0 rounded-full animate-pulseGlow pointer-events-none"></span>
        <span className="absolute inset-0 opacity-40 bg-gradient-to-r from-white/0 via-white/40 to-white/0
                         -skew-x-12 translate-x-[-120%] animate-shine pointer-events-none"></span>
      </motion.button>
    </div>
  )
}
