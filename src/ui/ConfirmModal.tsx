import { motion } from 'framer-motion'

export default function ConfirmModal({
  open, title='Confirmer', message, confirmLabel='Supprimer',
  onConfirm, onCancel
}:{
  open: boolean
  title?: string
  message: string | React.ReactNode
  confirmLabel?: string
  onConfirm: ()=>void
  onCancel: ()=>void
}){
  if(!open) return null
  return (
    <div className="fixed inset-0 z-[2200] bg-black/40 grid place-items-center p-4" onClick={onCancel}>
      <motion.div
        initial={{ scale:.9, opacity:0 }} animate={{ scale:1, opacity:1 }}
        className="card w-full max-w-sm" onClick={e=>e.stopPropagation()}
      >
        <h3 className="text-lg font-black text-candy-700 mb-1">{title}</h3>
        <div className="text-sm mb-3">{message}</div>
        <div className="flex justify-end gap-2">
          <button className="btn-outline" onClick={onCancel}>Annuler</button>
          <button className="btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </motion.div>
    </div>
  )
}