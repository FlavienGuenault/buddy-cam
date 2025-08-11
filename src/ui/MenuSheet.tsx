export default function MenuSheet({ open, onClose, children }:{
  open:boolean; onClose:()=>void; children:React.ReactNode
}){
  if(!open) return null
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute bottom-0 left-0 right-0 p-3" onClick={e=>e.stopPropagation()}>
        <div className="card p-4 rounded-3xl">
          {children}
        </div>
      </div>
    </div>
  )
}
