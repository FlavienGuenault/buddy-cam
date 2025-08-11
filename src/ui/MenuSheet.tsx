import { AnimatePresence, motion } from 'framer-motion'

export default function MenuSheet({ open, onClose, children }:{
  open:boolean; onClose:()=>void; children:React.ReactNode
}){
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[2000]" onClick={onClose}>
          <motion.div className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div className="absolute bottom-0 left-0 right-0 p-3"
            onClick={e=>e.stopPropagation()}
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            transition={{ type:'spring', stiffness: 260, damping: 22 }}>
            <div className="card p-4 rounded-3xl">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
