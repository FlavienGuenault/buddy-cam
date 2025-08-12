import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { myLists, createList } from '../lib/db'
import type { List } from '../lib/types'
import ListPreview from './ListPreview'
import InlinePosters from './InlinePosters'


const PARTNER_UID = import.meta.env.VITE_PARTNER_UID as string | undefined

export default function Lists() {
  const [lists, setLists] = useState<List[]>([])
  const [name, setName] = useState('')
  const [type, setType] = useState<'movies'|'activities'>('movies')
  const [partnerId, setPartnerId] = useState(PARTNER_UID ?? localStorage.getItem('partner_uid') ?? '')

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
      <section className="card">
        <h2 className="font-black text-candy-700 mb-2">Créer une liste</h2>
        <form onSubmit={onCreate} className="grid gap-2">
          <input className="rounded-2xl border px-4 py-3" value={name} onChange={e=>setName(e.target.value)} placeholder="Nom de la liste" required />
          <select className="rounded-2xl border px-4 py-3" value={type} onChange={e=>setType(e.target.value as any)}>
            <option value="movies">Films</option>
            <option value="activities">Activités</option>
          </select>
          <button className="btn w-full">Créer</button>
        </form>
      </section>


      <section>
        <h2 className="font-bold mb-2">Mes listes</h2>
        {lists.length === 0 ? <p className="opacity-70">Aucune liste pour l’instant.</p> : (
          <div className="grid gap-3">
            {lists.map(l => (
              <Link key={l.id} to={`/list/${l.id}`} className="card block hover:animate-bounceSoft">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{l.name}</div>
                    <div className="text-xs opacity-60">{l.type}</div>
                  </div>
                  {l.type === 'movies' && <InlinePosters listId={l.id} />}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
