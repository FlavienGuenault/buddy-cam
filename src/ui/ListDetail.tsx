import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getList, listItems, addActivityItem, addMovieItem, markDone, updateItem } from '../lib/db'
import type { Item, List } from '../lib/types'
import { searchMovies, type TmdbMovie, getMovie, TMDB_IMG } from '../lib/tmdb'
import { getCurrentPosition } from '../lib/geo'
import { pickRandom } from '../lib/random'
import { supabase } from '../lib/supabase'
import CandyButton from './CandyButton'
import Wheel from './Wheel'
import MovieSheet from './MovieSheet'
import MapModal from './MapModal'

const PARTNER_UID = import.meta.env.VITE_PARTNER_UID as string | undefined

export default function ListDetail() {
  const { id } = useParams()
  const [list, setList] = useState<List | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [title, setTitle] = useState(''); const [notes, setNotes] = useState('')

  // recherche dynamique
  const [q, setQ] = useState('')
  const [suggests, setSuggests] = useState<TmdbMovie[]>([])
  const [searching, setSearching] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const [attendeesMode, setAttendeesMode] = useState<'nous'|'moi'|'elle'>('nous')
  const [showWheel, setShowWheel] = useState(false)
  const [sheetId, setSheetId] = useState<number|null>(null)
  const [mapAt, setMapAt] = useState<{lat:number;lng:number}|null>(null)

  useEffect(() => { if (id) boot(id) }, [id])
  async function boot(listId: string) {
    const l = await getList(listId); setList(l)
    const d = await listItems(listId); setItems(d)
  }

  // 🔎 suggestions live avec debounce + AbortController + FIX z-index
  useEffect(() => {
    if (!q || q.trim().length < 2) { setSuggests([]); return }
    if (abortRef.current) abortRef.current.abort()
    const ac = new AbortController(); abortRef.current = ac
    const t = setTimeout(async () => {
      setSearching(true)
      try { const r = await searchMovies(q.trim(), ac.signal); setSuggests(r.results ?? []) }
      catch { /* noop */ }
      finally { setSearching(false) }
    }, 250)
    return () => { clearTimeout(t); ac.abort() }
  }, [q])

  async function addActivity(e: React.FormEvent) {
    e.preventDefault(); if (!id) return
    await addActivityItem(id, title.trim(), notes.trim() || undefined)
    setTitle(''); setNotes('');
    setItems(await listItems(id))
  }
  async function addMovie(m: TmdbMovie) {
    if (!id) return
    await addMovieItem(id, m.id, m.title)
    setItems(await listItems(id))
    setSuggests([]); setQ('')
  }

  async function geotag(item: Item) {
    try {
      const pos = await getCurrentPosition()
      await updateItem(item.id, { location: pos })
      if (id) setItems(await listItems(id))
    } catch (e:any) { alert(e.message) }
  }

  async function toggleDone(item: Item) {
    const now = new Date().toISOString()
    const me = (await supabase.auth.getUser()).data.user!
    const attendees = attendeesMode === 'nous' && PARTNER_UID ? [me.id, PARTNER_UID]
                    : attendeesMode === 'elle' && PARTNER_UID ? [PARTNER_UID] : [me.id]
    await markDone(item.id, { when_at: now, attendees, status:'done' })
    if (id) setItems(await listItems(id))
  }
  async function remise(itemId: string){
    await updateItem(itemId,{ status:'todo', rating:null, review:null, when_at:null })
    if (id) setItems(await listItems(id))       // ✅ refresh visible
  }

  const todos = useMemo(() => items.filter(i => i.status === 'todo'), [items])

  if (!list) return <div className="card">Chargement…</div>

  return (
    <div className="grid gap-4">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-candy-700">{list.name} <small className="opacity-60 font-normal">({list.type})</small></h2>
        {list.type === 'movies' && <CandyButton className="btn-outline" onClick={()=>setShowWheel(true)}>🎡 Roue</CandyButton>}
      </header>

      <section className="flex gap-3 items-center">
        <span className="text-sm opacity-70">Présence :</span>
        <select className="rounded-xl border px-2 py-1"
          value={attendeesMode} onChange={e=>setAttendeesMode(e.target.value as any)}>
          <option value='nous'>Nous deux</option>
          <option value='moi'>Moi</option>
          <option value='elle'>Camélia/Buddy seul·e</option>
        </select>
      </section>

      {list.type === 'activities' && (
        <section className="card">
          <h3 className="font-bold mb-2">Nouvelle activité</h3>
          <form onSubmit={addActivity} className="flex gap-2 flex-wrap">
            <input className="rounded-2xl border px-3 py-2" value={title} onChange={e=>setTitle(e.target.value)} placeholder='Titre' required />
            <input className="rounded-2xl border px-3 py-2 min-w-[240px]" value={notes} onChange={e=>setNotes(e.target.value)} placeholder='Notes (optionnel)' />
            <CandyButton>Ajouter</CandyButton>
          </form>
        </section>
      )}

      {list.type === 'movies' && (
        <section className="card">
          <h3 className="font-bold mb-2">Ajouter un film (TMDb)</h3>
          <div className="relative z-50"> {/* ✅ parent relatif + z élevé */}
            <input className="w-full rounded-2xl border px-4 py-3"
                   value={q} onChange={e=>setQ(e.target.value)} placeholder='Tape pour chercher…' />
            {q && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-candy max-h-96 overflow-auto z-50">
                {searching && <div className="px-4 py-2 text-sm opacity-60">Recherche…</div>}
                {!searching && suggests.length===0 && q.trim().length>=2 && (
                  <div className="px-4 py-2 text-sm opacity-60">Aucun résultat</div>
                )}
                {suggests.slice(0,10).map(m => (
                  <div key={m.id} className="flex gap-3 p-2 items-center hover:bg-candy-50 cursor-pointer"
                       onClick={()=>addMovie(m)}>
                    {m.poster_path ? <img src={`https://image.tmdb.org/t/p/w92${m.poster_path}`} className="w-12 h-16 rounded-xl object-cover" /> : <div className="w-12 h-16 rounded-xl bg-candy-100" />}
                    <div className="flex-1">
                      <div className="font-semibold">{m.title}</div>
                      <div className="text-xs opacity-60">{m.release_date?.slice(0,4) ?? '—'}</div>
                    </div>
                    <CandyButton>Ajouter</CandyButton>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section>
        <h3 className="font-bold mb-2">Éléments</h3>
        <div className="grid grid-cols-1 gap-3">
          {items.map(it => (
            <div key={it.id} className="card hover:animate-bounceSoft">
              <div className="flex gap-3">
                {it.tmdb_id ? <Poster id={it.tmdb_id}/> : null}
                <div className="flex-1">
                  <div className="font-bold">{it.title}</div>
                  {it.status==='done' ? (
                    <div className="text-sm mt-1">
                      ✅ {it.when_at?.slice(0,10)} — {it.rating? `${it.rating}/10` : 'sans note'} {it.review? ` — ${it.review}`:''}
                    </div>
                  ) : <div className="text-sm opacity-60">À voir / faire</div>}
                  <div className="flex gap-2 mt-2">
                    {it.status==='todo' ? (
                      <CandyButton onClick={()=> it.tmdb_id ? setSheetId(it.tmdb_id) : toggleDone(it)}>
                        {it.tmdb_id ? "Voir la fiche" : 'Marquer fait'}
                      </CandyButton>
                    ) : (
                      <CandyButton className="btn-outline" onClick={()=>remise(it.id)}>Remettre</CandyButton>
                    )}
                    <CandyButton className="btn-outline" onClick={()=> it.location? setMapAt(it.location) : geotag(it)}>
                      {it.location? 'Voir la carte' : 'Géolocaliser'}
                    </CandyButton>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {showWheel && (
        <Wheel items={items.filter(i=>i.status==='todo').map(i=>({ id:i.id, label:i.title }))}
          onFinish={(itemId)=>{ const w = items.find(x=>x.id===itemId); if(w) alert('Gagnant : '+w.title); setShowWheel(false) }}
          onClose={()=>setShowWheel(false)} />
      )}

      {sheetId && (
        <MovieSheet id={sheetId} onClose={()=>setSheetId(null)} onDone={async ({ rating, review }: { rating:number; review?:string })=>{
          const it = items.find(x=>x.tmdb_id===sheetId); if(!it) return
          const now = new Date().toISOString()
          const me = (await supabase.auth.getUser()).data.user!
          const attendees = PARTNER_UID ? [me.id, PARTNER_UID] : [me.id]
          await markDone(it.id,{ status:'done', when_at:now, rating, review, attendees })
          if(id) setItems(await listItems(id))
          setSheetId(null)
        }}/>
      )}

      {mapAt && (
        <MapModal point={mapAt} label={'Buddy & Camélia étaient ici'} onClose={()=>setMapAt(null)}/>
      )}
    </div>
  )
}

function Poster({ id }:{ id:number }){
  const [path, setPath] = useState<string | undefined>()
  useEffect(()=>{ getMovie(id).then(m=>setPath(m.poster_path)).catch(()=>{}) },[id])
  if (!path) return null
  return <img src={TMDB_IMG(path,'w185')} className="w-20 h-28 object-cover rounded-xl" alt="poster"/>
}
