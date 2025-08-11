import { Link, useLocation } from 'react-router-dom'

export default function MobileNav(){
  const { pathname } = useLocation()
  const is = (p:string)=> pathname===p
  return (
    <nav className="fixed bottom-3 left-3 right-3 z-40 rounded-3xl bg-white/90 backdrop-blur shadow-candy px-3 py-2 flex justify-around">
      <Link to="/" className={`px-3 py-2 rounded-2xl ${is('/')?'bg-candy-100 text-candy-700':'text-pirate/70'}`}>Listes</Link>
      <Link to="/about" className={`px-3 py-2 rounded-2xl ${is('/about')?'bg-candy-100 text-candy-700':'text-pirate/70'}`}>À propos</Link>
      <a className="btn btn-outline" href="https://www.wattpad.com/story/398318534-l%27%C3%A9pouse-de-l%27%C3%A9cume" target="_blank">
        📖 L'épouse de l'écume
      </a>
    </nav>
  )
}
