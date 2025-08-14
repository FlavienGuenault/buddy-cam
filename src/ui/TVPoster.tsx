import { useEffect, useState } from 'react'
import { getTV, TMDB_IMG } from '../lib/tmdb'

export default function TVPoster({ id, className='' }:{ id:number; className?:string }){
  const [path, setPath] = useState<string | undefined>()
  useEffect(()=>{ getTV(id).then(tv=>setPath(tv.poster_path)).catch(()=>{}) },[id])
  return path ? <img src={TMDB_IMG(path,'w185')} className={className} alt="poster"/> : null
}
