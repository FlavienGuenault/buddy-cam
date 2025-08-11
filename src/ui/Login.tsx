import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState<string | null>(null)
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const redirect = new URL(import.meta.env.BASE_URL || '/', window.location.origin).toString()
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirect } })
    if (error) alert(error.message)
    else setSent(email)
  }
  return (
    <div style={{ padding:16 }}>
      <h1>Connexion</h1>
      {sent ? (
        <p>Un lien a été envoyé à <b>{sent}</b>. Ouvre-le depuis ton téléphone ou ce navigateur.</p>
      ) : (
        <form onSubmit={submit} style={{ display:'flex', gap:8 }}>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="ton email" required />
          <button>Recevoir un lien</button>
        </form>
      )}
    </div>
  )
}