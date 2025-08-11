import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getList, listItems, addActivityItem, addMovieItem, markDone, updateItem } from '../lib/db'
import type { Item, List } from '../lib/types'
import { searchMovies, type TmdbMovie } from '../lib/tmdb'
import { getCurrentPosition } from '../lib/geo'
import { pickRandom } from '../lib/random'
import { supabase } from '../lib/supabase'

const PARTNER_UID = import.meta.env.VITE_PARTNER_UID as string | undefined

export default function ListDetail() {
  const { id } = useParams()
  const [list, setList] = useState<List | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [q, setQ] = useState('')
  const [results, setResults] = useState<TmdbMovie[]>([])
  const [loading, setLoading] = useState(false)
  const [attendeesMode, setAttendeesMode] = useState<'nous'|'moi'|'elle'>('nous')

  useEffect(() => { if (id) boot(id) }, [id])
  async function boot(listId: string) {
    const l = await getList(listId); setList(l)
    const d = await listItems(listId); setItems(d)
  }

  async function addActivity(e: React.FormEvent) {
    e.preventDefault(); if (!id) return
    await addActivityItem(id, title.trim(), notes.trim() || undefined)
    setTitle(''); setNotes('');
    setItems(await listItems(id))
  }

  async function onSearch(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    try { const r = await searchMovies(q.trim()); setResults(r.results ?? []) }
    finally { setLoading(false) }
  }

  async function addMovie(m: TmdbMovie) {
    if (!id) return
    await addMovieItem(id, m.id, m.title)
    setItems(await listItems(id))
  }

  async function toggleDone(item: Item) {
    const now = new Date().toISOString()
    const me = (await supabase.auth.getUser()).data.user!
    const attendees = attendeesMode === 'nous' && PARTNER_UID ? [me.id, PARTNER_UID] : attendeesMode === 'elle' && PARTNER_UID ? [PARTNER_UID] : [me.id]
    const ratingStr = window.prompt('Note sur 10 (optionnel)')
    const review = window.prompt('Un mot sur cette activité/ce film ? (optionnel)') || undefined
    const rating = ratingStr ? Math.max(1, Math.min(10, parseInt(ratingStr))) : undefined
    await markDone(item.id, { when_at: now, rating, review, attendees })
    if (id) setItems(await listItems(id))
  }

  async function geotag(item: Item) {
    try {
      const pos = await getCurrentPosition()
      await updateItem(item.id, { location: pos })
      if (id) setItems(await listItems(id))
    } catch (e:any) { alert(e.message) }
  }

  const todos = useMemo(() => items.filter(i => i.status === 'todo'), [items])

  function drawRandom() {
    const pick = pickRandom(todos)
    if (!pick) return alert('Aucun élément à tirer.')
    alert(`Tirage → ${pick.title}`)
  }

  if (!list) return <div>Chargement…</div>

  return (
    <div style={{ display:'grid', gap:12 }}>
      <header style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2>{list.name} <small style={{ opacity:.6, fontWeight:400 }}>({list.type})</small></h2>
        {list.type === 'movies' && (
          <button onClick={drawRandom}>🎲 Tirer au sort</button>
        )}
      </header>

      <section style={{ display:'flex', gap:12, alignItems:'center' }}>
        <label>Présence :</label>
        <select value={attendeesMode} onChange={e=>setAttendeesMode(e.target.value as any)}>
          <option value='nous'>Nous deux</option>
          <option value='moi'>Moi</option>
          <option value='elle'>Elle/Lui (partenaire)</option>
        </select>
      </section>

      {list.type === 'activities' && (
        <section style={{ border:'1px solid #eee', borderRadius:8, padding:12 }}>
          <h3>Nouvelle activité</h3>
          <form onSubmit={addActivity} style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder='Titre' required />
            <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder='Notes (optionnel)' />
            <button>Ajouter</button>
          </form>
        </section>
      )}

      {list.type === 'movies' && (
        <section style={{ border:'1px solid #eee', borderRadius:8, padding:12 }}>
          <h3>Ajouter un film (TMDb)</h3>
          <form onSubmit={onSearch} style={{ display:'flex', gap:8 }}>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder='Rechercher…' />
            <button disabled={loading}>{loading ? '…' : 'Rechercher'}</button>
          </form>
          <ul style={{ listStyle:'none', padding:0, marginTop:8 }}>
            {results.slice(0,8).map(m => (
              <li key={m.id} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px dotted #eee' }}>
                <span>{m.title} {m.release_date ? `(${m.release_date.slice(0,4)})` : ''}</span>
                <button onClick={()=>addMovie(m)}>Ajouter</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3>Éléments</h3>
        <ul style={{ listStyle:'none', padding:0, display:'grid', gap:8 }}>
          {items.map(it => (
            <li key={it.id} style={{ border:'1px solid #eee', borderRadius:8, padding:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight:600 }}>{it.title}</div>
                  <div style={{ fontSize:12, opacity:.8 }}>{it.notes}</div>
                  {it.status === 'done' && (
                    <div style={{ fontSize:12 }}>
                      ✅ Vu/Fait {it.when_at?.slice(0,10)}{it.rating ? ` — ${it.rating}/10` : ''}
                      {it.review ? ` — ${it.review}` : ''}
                    </div>
                  )}
                  {it.location && (
                    <div style={{ fontSize:12, opacity:.8 }}>
                      📍 {it.location.label ?? `${it.location.lat.toFixed(4)}, ${it.location.lng.toFixed(4)}`}
                    </div>
                  )}
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  {it.status === 'todo' ? (
                    <button onClick={()=>toggleDone(it)}>Marquer fait/vu</button>
                  ) : (
                    <button onClick={()=>updateItem(it.id, { status:'todo', rating:null, review:null, when_at:null })}>Remettre en à‑faire</button>
                  )}
                  <button onClick={()=>geotag(it)}>Géolocaliser</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}