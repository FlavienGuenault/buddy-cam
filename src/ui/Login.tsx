import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'   // 👈

export default function Login() {
  const [mode, setMode] = useState<'password'|'otp'>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sent, setSent] = useState<string | null>(null)
  const nav = useNavigate()                      // 👈

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (mode === 'password') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { alert(error.message); return }
      nav('/')                                    // 👈 redirection immédiate (basename géré)
      return
    }
    const redirect = new URL(import.meta.env.BASE_URL || '/', window.location.origin).toString()
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirect } })
    if (error) alert(error.message)
    else setSent(email)
  }

  return (
    <div style={{ padding:16 }}>
      <h1>Connexion</h1>
      <div style={{ marginBottom: 8 }}>
        <label style={{ marginRight: 8 }}>Mode :</label>
        <select value={mode} onChange={e=>setMode(e.target.value as any)}>
          <option value='password'>Mot de passe</option>
          <option value='otp'>Lien magique</option>
        </select>
      </div>
      <form onSubmit={submit} style={{ display:'grid', gap:8, maxWidth: 360 }}>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" required />
        {mode === 'password' ? (
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="mot de passe" required />
        ) : sent ? (
          <p>Un lien a été envoyé à <b>{sent}</b>.</p>
        ) : null}
        <button>Se connecter</button>
      </form>
    </div>
  )
}