import Logo from './Logo'
export default function Loader({ text='Chargement…'}:{text?:string}){
  return (
    <div className="fixed inset-0 grid place-items-center bg-white/70 backdrop-blur z-50">
      <div className="flex flex-col items-center gap-3">
        <Logo className="w-20 h-20 animate-spinSlow"/>
        <div className="text-candy-700 font-semibold">{text}</div>
      </div>
    </div>
  )
}
