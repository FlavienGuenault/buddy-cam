import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useParams } from 'react-router-dom'
import {
  getList, listItems, addActivityItem, addMovieItem,
  markDone, updateItem, deleteItem
} from '../lib/db'
import type { Item, List } from '../lib/types'
import { searchMovies, type TmdbMovie, getMovie, TMDB_IMG } from '../lib/tmdb'
import { supabase } from '../lib/supabase'

import Wheel from './Wheel'
import MovieSheet from './MovieSheet'
import MapPicker from './MapPicker'
import FancyWheelButton from './FancyWheelButton'
import ConfirmModal from './ConfirmModal'
import CandyButton from './CandyButton'

function whoAmI(email?: string|null): 'Buddy'|'Camélia'|'Autre' {
  if (!email) return 'Autre'
  const e = email.toLowerCase()
  if (e.startsWith('flavien')) return 'Buddy'
  if (e.startsWith('louane'))  return 'Camélia'
  return 'Autre'
}

export default function ListDetail() {
  const { id } = useParams()
  const [list, setList] = useState<List | null>(null)
  const [items, setItems] = useState<Item[]>([])

  // création activité
  const [title, setTitle] = useState(''); const [notes, setNotes] = useState('')

  // recherche film dynamique
  const [q, setQ] = useState(''); const [suggests, setSuggests] = useState<TmdbMovie[]>([])
  const [searching, setSearching] = useState(false); const [dropdownOpen, setDropdownOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const debounceRef = useRef<number | undefined>(undefined)

  // UI
  const [showWheel, setShowWheel] = useState(false)
  const [detailItem, setDetailItem] = useState<Item|null>(null)
  const [editingGeo, setEditingGeo] = useState<Item|null>(null)
  const [meEmail, setMeEmail] = useState<string|null>(null)

  // suppression item
  const [toDeleteItem, setToDeleteItem] = useState<Item | null>(null)
  const [busyDelete, setBusyDelete] = useState(false)

  useEffect(() => { supabase.auth.getUser().then(u => setMeEmail(u.data.user?.email ?? null)) }, [])
  useEffect(() => { if (id) boot(id) }, [id])
  async function boot(listId: string) {
    const l = await getList(listId); setList(l)
    const d = await listItems(listId); setItems(d)
  }

  // recherche live (debounce)
  useEffect(() => {
    window.clearTimeout(debounceRef.current)
    if (!q || q.trim().length < 2) { setSuggests([]); setDropdownOpen(false); return }
    setSearching(true)
    debounceRef.current = window.setTimeout(async () => {
      try { const r = await searchMovies(q.trim()); setSuggests(r.results ?? []); setDropdownOpen(true) }
      catch { /* ignore */ }
      finally { setSearching(false) }
    }, 250)
    return () => window.clearTimeout(debounceRef.current)
  }, [q])

  // ferme le dropdown quand on clique ailleurs
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!inputRef.current) return
      const r = inputRef.current.getBoundingClientRect()
      const x = (e as any).clientX, y = (e as any).clientY
      if (x<r.left || x>r.right || y<r.top || y>r.bottom+300) setDropdownOpen(false)
    }
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [])

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
    setSuggests([]); setQ(''); setDropdownOpen(false)
  }

  async function markAsDone(it: Item, r?:{ rating?:number; review?:string }) {
    const now = new Date().toISOString()
    await markDone(it.id, { status:'done', when_at: now, rating: r?.rating ?? null as any, review: r?.review })
    if (id) setItems(await listItems(id))
  }
  async function remise(itemId: string){
    await updateItem(itemId,{ status:'todo', rating:null, review:null, when_at:null })
    if (id) setItems(await listItems(id))
  }

  if (!list) return <div className="card">Chargement…</div>

  const showBigWheelBtn =
    list.type === 'movies' && items.filter(i => i.status === 'todo').length >= 2

  return (
    <div className="grid gap-4">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-candy-700">
          {list.name} <small className="opacity-60 font-normal">({list.type})</small>
        </h2>
      </header>

      {list.type === 'activities' && (
        <section className="card">
          <h3 className="font-bold mb-2">Nouvelle activité</h3>
          <form onSubmit={addActivity} className="grid gap-2">
            <input className="rounded-2xl border px-3 py-3" value={title} onChange={e=>setTitle(e.target.value)} placeholder='Titre' required />
            <input className="rounded-2xl border px-3 py-3" value={notes} onChange={e=>setNotes(e.target.value)} placeholder='Notes (optionnel)' />
            <button className="btn w-full">Ajouter</button>
          </form>
        </section>
      )}

      {list.type === 'movies' && (
        <section className="card">
          <h3 className="font-bold mb-2">Ajouter un film (TMDb)</h3>
          <div className="relative">
            <input
              ref={inputRef}
              className="w-full rounded-2xl border px-4 py-3"
              value={q}
              onChange={e=>setQ(e.target.value)}
              placeholder='Tape pour chercher…'
            />
          </div>
          {dropdownOpen && inputRef.current && createPortal(
            <FloatingResults
              anchor={inputRef.current}
              searching={searching}
              suggests={suggests}
              onPick={m=>addMovie(m)}
            />,
            document.body
          )}
        </section>
      )}

      <section>
        <h3 className="font-bold mb-2">Éléments</h3>
        <div className="grid grid-cols-1 gap-3">
          {items.map(it => (
            <div
              key={it.id}
              className={`card relative hover:animate-bounceSoft ${it.status==='done' ? 'opacity-60 grayscale' : ''}`}
            >
              {/* croix suppression */}
              <button
                className="icon-btn absolute top-2 right-2"
                title="Supprimer l’élément"
                onClick={()=> setToDeleteItem(it)}
              >✕</button>

              <div className="flex gap-3">
                {it.tmdb_id ? <Poster id={it.tmdb_id}/> : null}
                <div className="flex-1">
                  <div className="font-bold">{it.title}</div>

                  {it.status==='done' ? (
                    <div className="text-sm mt-1">
                      ✅ {it.when_at?.slice(0,10)} — {it.rating? `${it.rating}/10` : 'sans note'} {it.review? ` — ${it.review}`:''}
                    </div>
                  ) : <div className="text-sm opacity-60">À voir / faire</div>}

                  {it.location && (it.location.buddy || it.location.camelia) && (
                    <div className="text-xs opacity-70 mt-1">
                      📍 {it.location.buddy ? `Buddy: ${it.location.buddy.lat.toFixed(2)}, ${it.location.buddy.lng.toFixed(2)}` : 'Buddy: —'}
                      {' · '}
                      {it.location.camelia ? `Camélia: ${it.location.camelia.lat.toFixed(2)}, ${it.location.camelia.lng.toFixed(2)}` : 'Camélia: —'}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mt-2">
                    {it.tmdb_id && (
                      <CandyButton onClick={()=> setDetailItem(it)}>Détails</CandyButton>
                    )}
                    {it.status==='todo' ? (
                      <button className="btn-outline" onClick={()=> markAsDone(it)}>Marquer fait</button>
                    ) : (
                      <button className="btn-outline" onClick={()=>remise(it.id)}>Remettre</button>
                    )}
                    <button className="btn-outline" onClick={()=> setEditingGeo(it)}>
                      Lieux Buddy/Camélia
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="card opacity-70">Rien pour l’instant.</div>}
        </div>
      </section>

      {showWheel && (
        <Wheel
          items={items.filter(i=>i.status==='todo').map(i=>({ id:i.id, label:i.title }))}
          onFinish={()=>{}}
          onClose={()=>setShowWheel(false)}
        />
      )}

      {detailItem && detailItem.tmdb_id && (
        <MovieSheet
          id={detailItem.tmdb_id}
          location={detailItem.location ?? null}
          onClose={()=>setDetailItem(null)}
          onDone={async ({ rating, review })=>{
            await markAsDone(detailItem, { rating, review })
            setDetailItem(null)
          }}
        />
      )}

      {editingGeo && meEmail && (
        <MapPicker
          initial={editingGeo.location}
          who={whoAmI(meEmail) as 'Buddy'|'Camélia'}
          onClose={()=>setEditingGeo(null)}
          onSave={async (loc)=>{
            await updateItem(editingGeo.id, { location: loc })
            if (id) setItems(await listItems(id))
            setEditingGeo(null)
          }}
        />
      )}

      {/* bouton roue + spacer pour ne pas gêner le bas */}
      {showBigWheelBtn && (
        <>
          <FancyWheelButton offsetPx={65} onClick={() => { setDropdownOpen(false); setShowWheel(true) }} />
          <div style={{ height: 28 }} />
        </>
      )}

      {/* modal suppression item */}
      <ConfirmModal
        open={!!toDeleteItem}
        title="Supprimer cet élément ?"
        message={toDeleteItem ? <>« <b>{toDeleteItem.title}</b> » sera supprimé de la liste.</> : ''}
        confirmLabel={busyDelete ? '…' : 'Supprimer'}
        onCancel={()=>setToDeleteItem(null)}
        onConfirm={async ()=>{
          if(!toDeleteItem) return
          try{
            setBusyDelete(true)
            await deleteItem(toDeleteItem.id)
            if (id) setItems(await listItems(id))
            setToDeleteItem(null)
          }catch(err:any){ alert(err.message || 'Suppression impossible') }
          finally{ setBusyDelete(false) }
        }}
      />
    </div>
  )
}

function Poster({ id }:{ id:number }){
  const [path, setPath] = useState<string | undefined>()
  useEffect(()=>{ getMovie(id).then(m=>setPath(m.poster_path)).catch(()=>{}) },[id])
  if (!path) return null
  return <img src={TMDB_IMG(path,'w185')} className="w-20 h-28 object-cover rounded-xl" alt="poster"/>
}

function FloatingResults({ anchor, searching, suggests, onPick }:{
  anchor: HTMLInputElement; searching:boolean; suggests: TmdbMovie[]; onPick:(m:TmdbMovie)=>void
}){
  const [style, setStyle] = useState<React.CSSProperties>({})
  useEffect(()=>{
    const place = () => {
      const r = anchor.getBoundingClientRect()
      setStyle({
        position:'fixed', left: r.left, top: r.bottom+8, width: r.width,
        maxHeight: '60vh', overflow: 'auto', zIndex: 10000
      })
    }
    place()
    const obs = new ResizeObserver(place); obs.observe(document.documentElement)
    window.addEventListener('scroll', place, true); window.addEventListener('resize', place)
    return ()=>{ obs.disconnect(); window.removeEventListener('scroll', place, true); window.removeEventListener('resize', place) }
  }, [anchor])

  return (
    <div style={style} className="bg-white rounded-2xl shadow-candy">
      {searching && <div className="px-4 py-2 text-sm opacity-60">Recherche…</div>}
      {!searching && suggests.length===0 && (<div className="px-4 py-2 text-sm opacity-60">Aucun résultat</div>)}
      {suggests.slice(0,10).map(m => (
        <div key={m.id} className="flex gap-3 p-2 items-center hover:bg-candy-50 cursor-pointer"
             onClick={()=>onPick(m)}>
          {m.poster_path ? <img src={`https://image.tmdb.org/t/p/w92${m.poster_path}`} className="w-12 h-16 rounded-xl object-cover" /> : <div className="w-12 h-16 rounded-xl bg-candy-100" />}
          <div className="flex-1">
            <div className="font-semibold">{m.title}</div>
            <div className="text-xs opacity-60">{m.release_date?.slice(0,4) ?? '—'}</div>
          </div>
          <button className="btn">Ajouter</button>
        </div>
      ))}
    </div>
  )
}
