import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useParams } from 'react-router-dom'
import {
  getList, listItems, addActivityItem, addMovieItem,
  markDone, updateItem, deleteItem, addCourseItem, bulkDeleteItems, bulkUpdateItems
} from '../lib/db'
import type { Item, List } from '../lib/types'
import { searchMovies, type TmdbMovie, getMovie, TMDB_IMG } from '../lib/tmdb'
import { supabase } from '../lib/supabase'

import Reel from './Reel'
import MovieSheet from './MovieSheet'
import MapPicker from './MapPicker'
import FancyWheelButton from './FancyWheelButton'
import ConfirmModal from './ConfirmModal'

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
  const [courseTitle, setCourseTitle] = useState('')
  const [qty, setQty] = useState<number | ''>('')
  const [unit, setUnit] = useState('')

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
  async function addCourse(e: React.FormEvent) {
  e.preventDefault()
    if (!id || !courseTitle.trim()) return
    await addCourseItem(id, courseTitle.trim(), qty === '' ? null : Number(qty), unit || null)
    setCourseTitle(''); setQty(''); setUnit('')
    setItems(await listItems(id))
    pushSug(courseTitle, unit||null)
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

  // --- COURSES UX ---
const [hideDone, setHideDone] = useState(false)

// suggestions locales
type Suggestion = { t: string, u?: string|null }
function readSug(): Suggestion[] {
  try { return JSON.parse(localStorage.getItem('course_sug')||'[]') } catch { return [] }
}
function writeSug(s: Suggestion[]){
  localStorage.setItem('course_sug', JSON.stringify(s.slice(0,30)))
}
const [sug, setSug] = useState<Suggestion[]>(readSug())
function pushSug(title:string, unit?:string|null){
  const t = title.trim()
  if(!t) return
  const next = [{ t, u: unit||null }, ...sug.filter(x=>x.t.toLowerCase()!==t.toLowerCase())]
  setSug(next); writeSug(next)
}

// stepper qty
async function stepQty(it:any, delta:number){
  const next = Math.max(0, Number(it.qty||0) + delta)
  await updateItem(it.id, { qty: next === 0 ? null : next })
  setItems(await listItems(id!))
}

// tout cocher/décocher
async function toggleAll(toDone:boolean){
  const ids = items.filter(x => toDone ? x.status==='todo' : x.status==='done').map(x=>x.id)
  if(ids.length===0) return
  await bulkUpdateItems(ids, { status: toDone ? 'done' : 'todo' })
  setItems(await listItems(id!))
}

// supprimer faits
async function clearDone(){
  const ids = items.filter(x=>x.status==='done').map(x=>x.id)
  if(ids.length===0) return
  const ok = confirm(`Supprimer ${ids.length} article(s) fait(s) ?`)
  if(!ok) return
  await bulkDeleteItems(ids)
  setItems(await listItems(id!))
}


  if (!list) return <div className="card">Chargement…</div>

  const showBigWheelBtn =
    list.type === 'movies' && items.filter(i => i.status === 'todo').length >= 2
  
  const orderedItems = items.slice().sort((a, b) => {
    // 1) d'abord les TODO, ensuite les DONE
    if (a.status !== b.status) return a.status === 'done' ? 1 : -1

    // 2) si tu es sur une liste de films, trie par date (when_at ou created_at), puis titre
    const ad = (a.when_at ?? a.created_at ?? '')
    const bd = (b.when_at ?? b.created_at ?? '')
    if (ad !== bd) return bd.localeCompare(ad)

  return (a.title ?? '').localeCompare(b.title ?? '')
})

  return (
    <div className="grid gap-4">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-candy-700">
          {list.name} <small className="opacity-60 font-normal">({list.type})</small>
        </h2>
      </header>
      {list?.type==='courses' && sug.length>0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {sug.map(s => (
            <button key={s.t} className="px-3 py-1.5 rounded-full border shadow-candy text-sm active:scale-95"
              onClick={()=>{ setCourseTitle(s.t); setUnit(s.u||'') }}>
              {s.t}{s.u?` · ${s.u}`:''}
            </button>
          ))}
        </div>
      )}
      {list?.type === 'courses' && (
        <section className="card p-0">
          <form onSubmit={addCourse} className="grid gap-3 p-3">
            <h3 className="font-bold">Nouvel article</h3>

            <input
              className="w-full rounded-2xl border px-4 py-3"
              value={courseTitle}
              onChange={e=>setCourseTitle(e.target.value)}
              placeholder="Ex: Lait"
              required
            />

            <div className="grid grid-cols-2 gap-2">
              <input
                className="w-full rounded-2xl border px-4 py-3"
                type="number" min="0" step="0.01"
                value={qty}
                onChange={e=>setQty(e.target.value===''?'':Number(e.target.value))}
                placeholder="Qté"
              />
              <input
                className="w-full rounded-2xl border px-4 py-3"
                value={unit}
                onChange={e=>setUnit(e.target.value)}
                placeholder="Unité (L, kg, boîte…)"
              />
            </div>

            <button className="btn w-full">Ajouter</button>
          </form>
        </section>
      )}


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
        <div className="sticky top-[calc(env(safe-area-inset-top)+8px)] z-10 bg-white/90 backdrop-blur rounded-2xl border px-3 py-2 flex items-center gap-2 mb-2">
          <span className="text-sm opacity-70">
            {items.filter(x=>x.status==='todo').length} à acheter · {items.filter(x=>x.status==='done').length} faits
          </span>
          <label className="ml-auto flex items-center gap-1 text-sm">
            <input type="checkbox" checked={hideDone} onChange={e=>setHideDone(e.target.checked)} /> Masquer faits
          </label>
          <button className="btn text-xs" onClick={()=>toggleAll(true)}>Tout cocher</button>
          <button className="btn text-xs" onClick={()=>toggleAll(false)}>Tout décocher</button>
          <button className="btn btn-outline text-xs" onClick={clearDone}>Supprimer faits</button>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {orderedItems
            .filter(it => hideDone ? it.status!=='done' : true)
            .map(it => (
            list?.type === 'courses' ? (
              // --- RENDU SPÉCIAL COURSES (case à cocher + qté/unité) ---
              <label
                key={it.id}
                className={`card relative flex items-center gap-3 ${it.status==='done' ? 'opacity-60 grayscale' : ''}`}
              >
                {/* stepper qty */}
                <div className="flex items-center gap-1">
                  <button className="w-8 h-8 rounded-full border" onClick={()=>stepQty(it, -1)}>-</button>
                  <div className="w-10 text-center text-sm">{it.qty ?? 0}</div>
                  <button className="w-8 h-8 rounded-full border" onClick={()=>stepQty(it, +1)}>+</button>
                </div>
                {/* checkbox done/todo */}
                <input
                  type="checkbox"
                  className="w-5 h-5"
                  checked={it.status === 'done'}
                  onChange={() => it.status==='done' ? remise(it.id) : markAsDone(it)}
                  title={it.status==='done' ? 'Remettre en TODO' : 'Marquer fait'}
                />

                <div className="flex-1">
                  <div className="font-bold">{it.title}</div>
                  {(it.qty || it.unit) && (
                    <div className="text-sm opacity-70 mt-1">
                      {it.qty ?? ''} {it.unit ?? ''}
                    </div>
                  )}
                </div>

                {/* croix suppression */}
                <button
                  className="icon-btn absolute top-2 right-2"
                  title="Supprimer l’élément"
                  onClick={()=> setToDeleteItem(it)}
                >✕</button>
              </label>
            ) : (
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

                    {it.notes && (
                      <div className="text-sm opacity-75 mt-1">
                        {it.notes}
                      </div>
                    )}

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
                        <button
                          onClick={() => setDetailItem(it)}
                          className="rounded-full px-3 py-1.5 text-sm font-semibold text-white bg-candy-500 hover:bg-candy-600 shadow-candy active:scale-95 transition"
                        >
                          Détails
                        </button>
                      )}

                      {it.status === 'todo' ? (
                        <button
                          onClick={() => markAsDone(it)}
                          className="rounded-full px-3 py-1.5 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 shadow-candy active:scale-95 transition"
                        >
                          Marquer fait
                        </button>
                      ) : (
                        <button
                          onClick={() => remise(it.id)}
                          className="rounded-full px-3 py-1.5 text-sm font-semibold bg-white border border-candy-300 text-candy-700 hover:bg-candy-50 shadow-candy active:scale-95 transition"
                        >
                          Remettre
                        </button>
                      )}

                      <button
                        onClick={() => setEditingGeo(it)}
                        className="rounded-full px-3 py-1.5 text-sm font-semibold text-white bg-candy-700 hover:bg-candy-800 shadow-candy active:scale-95 transition"
                      >
                        Lieux Buddy/Camélia
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          ))}
          {items.length === 0 && <div className="card opacity-70">Rien pour l’instant.</div>}
        </div>
      </section>

      {showWheel && (
        <Reel
          items={items
            .filter(i => i.status === 'todo')
            .map(i => ({ id: i.id, title: i.title, tmdb_id: i.tmdb_id ?? undefined }))}
          onFinish={(w) => {
            // on ferme le reel en douceur
            setShowWheel(false)

            // on récupère l'Item complet (pour MovieSheet)
            const it = items.find(i => i.id === w.itemId)
            if (it) {
              // petit délai pour laisser respirer l'anim & confettis
              setTimeout(() => setDetailItem(it), 450)
            }
          }}
          onClose={() => setShowWheel(false)}
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
          <div style={{ height: 28 + 85 }} />
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
