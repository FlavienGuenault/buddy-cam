import { useEffect, useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const ALLOW = new Set(['flavien.guenault@gmail.com','louanedechavanne@gmail.com'])

export default function App() {
  const [ready, setReady] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [denied, setDenied] = useState(false)
  const nav = useNavigate()
  const loc = useLocation()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user.email ?? null
      setUserEmail(email)
      setDenied(!!email && !ALLOW.has(email))
      setReady(true)
      if (!data.session && loc.pathname !== '/login') nav('/login')
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      const email = sess?.user?.email ?? null
      setUserEmail(email)
      setDenied(!!email && !ALLOW.has(email))
      if (!sess) nav('/login')
      else if (loc.pathname === '/login') nav('/')
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!ready) return <div style={{ padding: 16 }}>Chargement…</div>
  if (denied) return (
    <div style={{ maxWidth: 600, margin: '20vh auto', textAlign: 'center' }}>
      <h1>Accès restreint</h1>
      <p>Cette application est privée. Si tu n'es pas sur la liste autorisée, la connexion est refusée.</p>
      {userEmail && <button onClick={() => supabase.auth.signOut()}>Se déconnecter ({userEmail})</button>}
    </div>
  )

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: 12 }}>
      <header style={{ display:'flex', gap:12, alignItems:'center', justifyContent:'space-between' }}>
        <nav style={{ display:'flex', gap:12 }}>
          <Link to="/">Listes</Link>
          <Link to="/about">À propos</Link>
        </nav>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {userEmail && <span style={{ opacity:.8 }}>{userEmail}</span>}
          {userEmail && <button onClick={() => supabase.auth.signOut()}>Se déconnecter</button>}
        </div>
      </header>
      <main style={{ paddingTop: 12 }}>
        <Outlet />
      </main>
    </div>
  )
}