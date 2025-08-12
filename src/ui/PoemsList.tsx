import { useEffect, useState } from 'react'
import { listPublishedPoems } from '../lib/db'
import type { Poem } from '../lib/types'
import { Link } from 'react-router-dom'

export default function PoemsList(){
  const [poems, setPoems] = useState<Poem[]>([])
  const [filter, setFilter] = useState<'all'|'camelia'|'buddy'>('all')

  useEffect(() => { (async () => {
    const all = await listPublishedPoems('all')
    setPoems(all)
  })() }, [])

  const filtered = poems.filter(p => {
    // heuristique simple: map email affiché dans profiles ailleurs si tu veux
    // Ici, on regarde un display_name stocké côté client si tu l’as
    return filter === 'all'
      ? true
      : (p.title.toLowerCase().includes(filter === 'camelia' ? 'camélia' : 'buddy')) // remplace par un vrai auteur si tu ajoutes un join
  })

  return (
    <div className="container grid gap-3">
      <div className="flex gap-2">
        <button className={`btn ${filter==='all'&&'btn-primary'}`} onClick={()=>setFilter('all')}>Tous</button>
        <button className={`btn ${filter==='camelia'&&'btn-primary'}`} onClick={()=>setFilter('camelia')}>Camélia</button>
        <button className={`btn ${filter==='buddy'&&'btn-primary'}`} onClick={()=>setFilter('buddy')}>Buddy</button>
        <Link className="btn ml-auto" to="/poems/new">Nouveau</Link>
      </div>

      <ul className="grid gap-2">
        {filtered.map(p => (
          <li key={p.id} className="card">
            <Link to={`/poems/${p.id}`} className="block">
              <div className="font-bold">{p.title}</div>
              <div className="text-xs opacity-60">{new Date(p.created_at).toLocaleString()}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}