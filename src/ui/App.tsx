import { useEffect, useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import MobileNav from './MobileNav'
import MenuSheet from './MenuSheet'

const ALLOW = new Set(['flavien.guenault@gmail.com','louanedechavanne@gmail.com'])
const logoUrl = `${import.meta.env.BASE_URL}pwa-192x192.png`

export default function App() {
  const [ready, setReady] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [denied, setDenied] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const nav = useNavigate()
  const loc = useLocation()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user.email ?? null
      setUserEmail(email); setDenied(!!email && !ALLOW.has(email)); setReady(true)
      if (!data.session && loc.pathname !== '/login') nav('/login')
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      const email = sess?.user?.email ?? null
      setUserEmail(email); setDenied(!!email && !ALLOW.has(email))
      if (!sess) nav('/login'); else if (loc.pathname === '/login') nav('/')
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!ready) return (
    <div className="min-h-screen grid place-items-center">
      <img src={logoUrl} className="w-16 h-16 animate-spinSlow" alt="logo"/>
      <div className="text-candy-700 font-semibold mt-2">Buddy & Cam</div>
    </div>
  )

  if (denied) return (
    <div className="max-w-sm mx-auto mt-24 text-center card">
      <img src={logoUrl} className="w-14 h-14 mx-auto mb-2" alt="logo"/>
      <h1 className="text-xl font-bold">Accès restreint</h1>
      <p className="opacity-70 mt-2">App privée.</p>
      {userEmail && <button className="btn-outline mt-4" onClick={() => supabase.auth.signOut()}>Se déconnecter ({userEmail})</button>}
    </div>
  )

  return (
    <div className="pb-20">
      <header className="sticky top-0 z-30 p-3">
        <div className="rounded-3xl bg-white/80 backdrop-blur shadow-candy px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoUrl} className="w-8 h-8 animate-float" alt="logo"/>
            <div className="font-extrabold text-candy-700">Buddy & Cam</div>
          </div>
          <div className="flex items-center gap-2">
            {userEmail && <span className="text-xs opacity-70 hidden sm:block">{userEmail}</span>}
            <button className="btn-outline px-3 py-1" onClick={()=>setMenuOpen(true)}>☰</button>
          </div>
        </div>
      </header>

      <main className="px-3 max-w-md mx-auto">
        <RouteTransitions><Outlet /></RouteTransitions>
      </main>

      <MobileNav />

      <MenuSheet open={menuOpen} onClose={()=>setMenuOpen(false)}>
        <div className="grid gap-2">
          <Link className="btn btn-outline" to="/" onClick={()=>setMenuOpen(false)}>🏠 Accueil</Link>
          <Link className="btn btn-outline" to="/about" onClick={()=>setMenuOpen(false)}>ℹ️ À propos</Link>
          {userEmail && <button className="btn" onClick={()=>{setMenuOpen(false); supabase.auth.signOut()}}>🚪 Déconnexion</button>}
        </div>
      </MenuSheet>
    </div>
  )
}

function RouteTransitions({ children }:{ children: React.ReactNode }){
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: .25 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
