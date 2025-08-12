import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listPublishedPoems, listMyDrafts } from '../lib/db'
import type { Poem } from '../lib/types'
import { supabase } from '../lib/supabase'

const PARTNER_UID = import.meta.env.VITE_PARTNER_UID as string | undefined

export default function PoemsList(){
  const [tab, setTab] = useState<'pub'|'drafts'>('pub')
  const [pub, setPub] = useState<Poem[]>([])
  const [drafts, setDrafts] = useState<Poem[]>([])
  const [meId, setMeId] = useState<string|undefined>(undefined)
  const [meEmail, setMeEmail] = useState<string|undefined>(undefined)
  const partnerId = PARTNER_UID ?? localStorage.getItem('partner_uid') ?? undefined

  useEffect(() => { (async () => {
    const u = await supabase.auth.getUser()
    setMeId(u.data.user?.id); setMeEmail(u.data.user?.email ?? undefined)
    setPub(await listPublishedPoems('all'))
    setDrafts(await listMyDrafts())
  })() }, [])

  function badge(authorId: string){
  if (!meId) return <span className="inline-flex items-center gap-1 text-white text-[11px] px-2 py-0.5 rounded-full bg-gray-500">• Auteur</span>
  return authorId === meId
    ? <span className="inline-flex items-center gap-1 text-white text-[11px] px-2 py-0.5 rounded-full bg-amber-600">• Buddy</span>
    : <span className="inline-flex items-center gap-1 text-white text-[11px] px-2 py-0.5 rounded-full bg-rose-900">• Camélia</span>
}

  const list = tab==='pub' ? pub : drafts

  return (
    <div className="container grid gap-3">
      <div className="flex gap-2">
        <button className={`btn ${tab==='pub'&&'btn-primary'}`} onClick={()=>setTab('pub')}>Publiés</button>
        <button className={`btn ${tab==='drafts'&&'btn-primary'}`} onClick={()=>setTab('drafts')}>Brouillons (moi)</button>
        <Link className="btn ml-auto" to="/poems/new">Nouveau</Link>
      </div>

      {list.length === 0 ? (
        <div className="card opacity-70">{tab==='pub' ? 'Aucun poème publié.' : 'Aucun brouillon.'}</div>
      ) : (
        <ul className="grid gap-2">
          {list.map(p => (
            <li key={p.id} className="card">
              <Link to={`/poems/${p.id}`} className="block">
                <div className="flex items-center gap-2">
                  <div className="font-bold text-lg">{p.title}</div>
                  {badge(p.author_id)}
                </div>
                <div className="text-xs opacity-60">{new Date(p.created_at).toLocaleString()}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
