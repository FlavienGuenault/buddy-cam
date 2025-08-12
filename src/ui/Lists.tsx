import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { myLists, createList } from '../lib/db'
import type { List } from '../lib/types'
import InlinePosters from './InlinePosters'
import ConfirmModal from './ConfirmModal'
import { deleteList } from '../lib/db'


const PARTNER_UID = import.meta.env.VITE_PARTNER_UID as string | undefined

export default function Lists() {
  const [lists, setLists] = useState<List[]>([])
  const [name, setName] = useState('')
  const [type, setType] = useState<'movies'|'activities'|'courses'>('movies')
  const [partnerId, setPartnerId] = useState(PARTNER_UID ?? localStorage.getItem('partner_uid') ?? '')
  const [toDelete, setToDelete] = useState<List | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => { load() }, [])
  async function load() { const d = await myLists(); setLists(d) }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    const l = await createList(name.trim(), type, partnerId || undefined)
    if (partnerId) localStorage.setItem('partner_uid', partnerId)
    setName(''); setType('movies'); setLists([l, ...lists])
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center">
      <div className="text-sm opacity-70">Espace</div>
        <Link to="/poems" className="ml-auto rounded-2xl bg-candy-600 text-white px-4 py-2 shadow-candy active:scale-95 transition">
          ✍️ Poèmes
        </Link>
      </div>
      <section className="card">
        <h2 className="font-black text-candy-700 mb-2">Créer une liste</h2>
        <form onSubmit={onCreate} className="grid gap-2">
          <input className="rounded-2xl border px-4 py-3" value={name} onChange={e=>setName(e.target.value)} placeholder="Nom de la liste" required />
          <select className="rounded-2xl border px-4 py-3" value={type} onChange={e=>setType(e.target.value as any)}>
            <option value="movies">Films</option>
            <option value="activities">Activités</option>
            <option value="courses">Courses</option>
          </select>
          <button className="btn w-full">Créer</button>
        </form>
      </section>


      <section>
        <h2 className="font-bold mb-2">Mes listes</h2>
        {lists.length === 0 ? <p className="opacity-70">Aucune liste pour l’instant.</p> : (
          <div className="grid gap-3">
            {lists.map((l) => (
              <div key={l.id} className="card relative hover:animate-bounceSoft">
                {/* bouton croix */}
                <button
                  className="icon-btn absolute top-2 right-2 z-10"
                  title="Supprimer la liste"
                  onClick={(e) => {
                    e.preventDefault(); // évite de suivre le lien
                    e.stopPropagation();
                    setToDelete(l);
                  }}
                >
                  ✕
                </button>

                <Link to={`/list/${l.id}`} className="block min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="font-semibold truncate">{l.name}</div>
                    {l.type === 'movies' && <InlinePosters listId={l.id} />}
                  </div>
                  <div className="text-xs opacity-60">{l.type}</div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
      <ConfirmModal
        open={!!toDelete}
        title="Supprimer la liste ?"
        message={toDelete ? <>La liste <b>{toDelete.name}</b> et tous ses éléments seront supprimés.</> : ''}
        confirmLabel={busy ? '…' : 'Supprimer'}
        onCancel={()=>setToDelete(null)}
        onConfirm={async ()=>{
          if(!toDelete) return
          try{
            setBusy(true)
            await deleteList(toDelete.id)
            setLists(prev => prev.filter(x => x.id !== toDelete.id))
            setToDelete(null)
          }catch(err:any){ alert(err.message || 'Suppression impossible (droits ?)') }
          finally{ setBusy(false) }
        }}
      />
    </div>
  )
}
