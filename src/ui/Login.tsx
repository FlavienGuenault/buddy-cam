import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import Logo from './Logo'
import CandyButton from './CandyButton'

export default function Login() {
  const [mode, setMode] = useState<'password'|'otp'>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sent, setSent] = useState<string | null>(null)
  const nav = useNavigate()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (mode === 'password') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { alert(error.message); return }
      nav('/') // redirection immédiate
      return
    }
    const redirect = new URL(import.meta.env.BASE_URL || '/', window.location.origin).toString()
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirect } })
    if (error) alert(error.message)
    else setSent(email)
  }

  return (
    <div className="min-h-[75vh] grid place-items-center px-3">
      <div className="card w-full max-w-sm text-center">
        <Logo className="w-14 h-14 mx-auto mb-2"/>
        <h1 className="text-xl font-black text-candy-700">Buddy & Cam</h1>
        <p className="text-sm opacity-70 mb-4">Espace privé</p>

        <div className="mb-2">
          <label className="mr-2 text-sm">Mode :</label>
          <select value={mode} onChange={e=>setMode(e.target.value as any)} className="rounded-xl border px-2 py-1">
            <option value='password'>Mot de passe</option>
            <option value='otp'>Lien magique</option>
          </select>
        </div>

        <form onSubmit={submit} className="grid gap-2">
          <input className="rounded-2xl border px-3 py-2" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" required />
          {mode === 'password' ? (
            <input className="rounded-2xl border px-3 py-2" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="mot de passe" required />
          ) : sent ? (
            <p>Un lien a été envoyé à <b>{sent}</b>.</p>
          ) : null}
          <CandyButton>Se connecter</CandyButton>
        </form>
      </div>
    </div>
  )
}
