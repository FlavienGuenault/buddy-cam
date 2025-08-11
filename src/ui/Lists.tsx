import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { myLists, createList } from '../lib/db'
import type { List } from '../lib/types'

const PARTNER_UID = import.meta.env.VITE_PARTNER_UID as string | undefined

export default function Lists() {
  const [lists, setLists] = useState<List[]>([])
  const [name, setName] = useState('')
  const [type, setType] = useState<'movies'|'activities'>('movies')
  const [partnerId, setPartnerId] = useState(PARTNER_UID ?? localStorage.getItem('partner_uid') ?? '')

  useEffect(() => { load() }, [])
  async function load() {
    const d = await myLists(); setLists(d)
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    const l = await createList(name.trim(), type, partnerId || undefined)
    if (partnerId) localStorage.setItem('partner_uid', partnerId)
    setName(''); setType('movies');
    setLists([l, ...lists])
  }

  return (
    <div style={{ display:'grid', gap:12 }}>
      <section style={{ padding:12, border:'1px solid #ddd', borderRadius:8 }}>
        <h2>Nouvelle liste</h2>
        <form onSubmit={onCreate} style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nom de la liste" required />
          <select value={type} onChange={e=>setType(e.target.value as any)}>
            <option value="movies">Films</option>
            <option value="activities">Activités</option>
          </select>
          <input value={partnerId} onChange={e=>setPartnerId(e.target.value)} placeholder="UID partenaire (optionnel)" style={{ minWidth:280 }} />
          <button>Créer</button>
        </form>
        <p style={{ opacity:.8, marginTop:8 }}>
          Astuce : une fois que ta/ton partenaire s'est connecté·e, récupère son <i>UID</i> (elle/il te l’envoie depuis sa page profil bientôt) et colle-le ici pour partager.
        </p>
      </section>

      <section>
        <h2>Mes listes</h2>
        {lists.length === 0 ? <p>Aucune liste pour l’instant.</p> : (
          <ul style={{ display:'grid', gap:8, listStyle:'none', padding:0 }}>
            {lists.map(l => (
              <li key={l.id} style={{ border:'1px solid #eee', borderRadius:8, padding:12 }}>
                <Link to={`/list/${l.id}`}>{l.name}</Link>
                <div style={{ fontSize:12, opacity:.8 }}>{l.type}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}