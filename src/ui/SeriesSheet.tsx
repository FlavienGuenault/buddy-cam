import { useEffect, useMemo, useState } from 'react'
import { getAllEpisodes, getSeason, getTV, TMDB_IMG } from '../lib/tmdb'
import { listEpisodeViews, setEpisodeSeen, setSeasonSeen } from '../lib/db'
import TVPoster from './TVPoster'

type SeenSet = Set<string> // 'userId:s:e'

function key(userId:string, s:number, e:number){ return `${userId}:${s}:${e}` }

export default function SeriesSheet({
  itemId, tmdbId, onClose, meId, partnerId, meLabel='Moi', partnerLabel='L’autre'
}:{
  itemId: string
  tmdbId: number
  onClose: ()=>void
  meId: string
  partnerId?: string
  meLabel?: 'Buddy'|'Camélia'|'Moi'
  partnerLabel?: 'Buddy'|'Camélia'|'L’autre'
}){
  const [tv, setTV] = useState<any>()
  const [episodes, setEpisodes] = useState<{s:number;e:number}[]>([])
  const [seen, setSeen] = useState<SeenSet>(new Set())

  useEffect(()=>{
    let alive=true
    ;(async()=>{
      const [t, eps, views] = await Promise.all([
        getTV(tmdbId),
        getAllEpisodes(tmdbId),
        listEpisodeViews(itemId)
      ])
      if (!alive) return
      setTV(t); setEpisodes(eps)
      const s = new Set<string>()
      for (const v of views) s.add(key(v.user_id, v.season, v.episode))
      setSeen(s)
    })().catch(()=>{})
    return()=>{ alive=false }
  },[tmdbId, itemId])

  const seasons = useMemo(()=>{
    const xs = new Map<number, number[]>() // season -> [episodes]
    for (const {s,e} of episodes){
      if (!xs.has(s)) xs.set(s, [])
      xs.get(s)!.push(e)
    }
    xs.forEach(arr=>arr.sort((a,b)=>a-b))
    return Array.from(xs.entries()).sort((a,b)=>a[0]-b[0])
  },[episodes])

  function meHas(s:number,e:number){ return seen.has(key(meId,s,e)) }
  function partnerHas(s:number,e:number){ return partnerId ? seen.has(key(partnerId,s,e)) : false }

  const total = episodes.length
  const meCount = episodes.filter(ep => meHas(ep.s, ep.e)).length
  const partnerCount = partnerId ? episodes.filter(ep => partnerHas(ep.s, ep.e)).length : 0

  return (
    <div className="fixed inset-0 z-[2200] grid place-items-center bg-black/40 p-3" onClick={onClose}>
      <div className="card w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
        {tv ? (
          <div className="p-3 grid gap-3">
            <div className="flex gap-3">
              <TVPoster id={tmdbId} className="w-28 h-40 object-cover rounded-xl"/>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-candy-700">{tv.name}</h3>
                <div className="text-sm opacity-70">{tv.first_air_date?.slice(0,4)} · {tv.number_of_seasons} saison(s)</div>

                {/* double barre de progression (toi / l’autre) */}
                <div className="mt-2">
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${(meCount/Math.max(total,1))*100}%` }} />
                  </div>
                  {partnerId && (
                    <div className="h-2 rounded-full bg-gray-200 overflow-hidden mt-1">
                      <div className="h-full bg-rose-900" style={{ width: `${(partnerCount/Math.max(total,1))*100}%` }} />
                    </div>
                  )}
                  <div className="text-xs opacity-70 mt-1">
                    {meLabel}: {meCount}/{total} {partnerId ? `· ${partnerLabel}: ${partnerCount}/${total}` : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* saisons */}
            <div className="grid gap-3">
              {seasons.map(([sn, eps])=>(
                <SeasonRow key={sn}
                  sn={sn} eps={eps}
                  checkedMe={new Set(eps.filter(e=>meHas(sn,e)))}
                  checkedPartner={partnerId ? new Set(eps.filter(e=>partnerHas(sn,e))) : new Set()}
                  onToggle={async (e, on) => {
                    await setEpisodeSeen(itemId, sn, e, on)
                    setSeen(prev=>{
                      const nxt = new Set(prev)
                      const k = key(meId, sn, e)
                      on ? nxt.add(k) : nxt.delete(k)
                      return nxt
                    })
                  }}
                  onToggleAll={async (on)=>{
                    await setSeasonSeen(itemId, sn, eps, on)
                    setSeen(prev=>{
                      const nxt = new Set(prev)
                      for (const ep of eps){
                        const k = key(meId, sn, ep)
                        on ? nxt.add(k) : nxt.delete(k)
                      }
                      return nxt
                    })
                  }}
                />
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button className="btn btn-outline" onClick={onClose}>Fermer</button>
            </div>
          </div>
        ) : (<div className="p-6">Chargement…</div>)}
      </div>
    </div>
  )
}

function SeasonRow({
  sn, eps, checkedMe, checkedPartner, onToggle, onToggleAll
}:{
  sn:number
  eps:number[]
  checkedMe:Set<number>
  checkedPartner:Set<number>
  onToggle:(e:number, on:boolean)=>void|Promise<void>
  onToggleAll:(on:boolean)=>void|Promise<void>
}){
  const allOn = checkedMe.size === eps.length
  return (
    <div className="rounded-2xl border p-2">
      <div className="flex items-center justify-between px-1">
        <div className="font-semibold">Saison {sn}</div>
        <div className="flex items-center gap-2">
          <button className="text-xs btn" onClick={()=>onToggleAll(!allOn)}>{allOn?'Tout décocher':'Tout cocher'}</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {eps.map(e => (
          <button key={e}
            className={`px-2 py-1 rounded-lg border text-sm ${checkedMe.has(e)?'bg-amber-100 border-amber-300':'bg-white'}`}
            onClick={()=>onToggle(e, !checkedMe.has(e))}
            title={`Épisode ${e}`}
          >
            E{e}
            {checkedPartner.has(e) && <span className="ml-1 text-[10px] px-1 rounded bg-rose-900 text-white">Cam</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
