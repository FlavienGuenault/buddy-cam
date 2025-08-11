import { useEffect, useState } from 'react'
import { getMovie, TMDB_IMG } from '../lib/tmdb'

export default function MoviePoster({ id, className='' }:{ id:number; className?:string }){
  const [path, setPath] = useState<string | undefined>()
  useEffect(()=>{ getMovie(id).then(m=>setPath(m.poster_path)).catch(()=>{}) },[id])
  return path ? <img src={TMDB_IMG(path,'w185')} className={className} alt="poster"/> : null
}
