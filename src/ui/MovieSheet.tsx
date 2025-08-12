import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { getMovie, TMDB_IMG } from '../lib/tmdb'
import CandyButton from './CandyButton'
import Stars from './Stars'

export default function MovieSheet({
  id, onClose, onDone, location
}: {
  id: number
  onClose: () => void
  onDone: (r:{rating:number; review?:string}) => void
  location?: { buddy?: {lat:number;lng:number}, camelia?: {lat:number;lng:number} } | null
}) {
  const [m, setM] = useState<any>()
  const [rating, setRating] = useState(8)
  const [review, setReview] = useState('')

  useEffect(()=>{ getMovie(id).then(setM) },[id])

  return (
    <div className="fixed inset-0 z-[2100] grid place-items-center bg-black/40 p-3" onClick={onClose}>
      <div className="card w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
        {m ? (
          <div className="grid md:grid-cols-[220px,1fr] gap-4 p-2">
            <img src={TMDB_IMG(m.poster_path,'w342')} alt="poster" className="rounded-2xl shadow"/>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-candy-700">{m.title}</h3>
              <div className="text-sm opacity-70">{m.release_date?.slice(0,4)} · {m.runtime?`${m.runtime} min`:''}</div>
              <p className="text-sm leading-relaxed">{m.overview}</p>

              {location && (location.buddy || location.camelia) && (
                <div className="mt-3">
                  <div className="text-sm font-semibold mb-1">Où nous étions</div>
                  <div className="h-48 rounded-2xl overflow-hidden">
                    <MapStatic location={location}/>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <div className="mb-1 text-sm">Ta note</div>
                <Stars value={rating} onChange={setRating}/>
              </div>
              <textarea
                className="w-full p-3 rounded-xl border"
                placeholder="Un mot en sortie de séance…"
                value={review}
                onChange={e=>setReview(e.target.value)}
              />
              <div className="flex gap-2 pt-1 pb-2">
                <CandyButton onClick={()=>onDone({ rating, review: review||undefined })}>J’ai vu ce film</CandyButton>
                <CandyButton className="btn-outline" onClick={onClose}>Fermer</CandyButton>
              </div>
            </div>
          </div>
        ) : (<div className="p-6">Chargement…</div>)}
      </div>
    </div>
  )
}

/** Mini-carte non interactive affichant les points Buddy/Camélia */
function MapStatic({ location }:{
  location: { buddy?:{lat:number;lng:number}, camelia?:{lat:number;lng:number} }
}){
  const center: LatLngExpression = (location.buddy ?? location.camelia ?? {lat:48.8566,lng:2.3522}) as any
  const icon1 = new L.Icon({ iconUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', iconAnchor:[12,40] })
  const icon2 = new L.Icon({ iconUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', iconAnchor:[12,40] })

  return (
    <MapContainer
      center={center}
      zoom={4}
      style={{height:'100%', width:'100%'}}
      dragging={false}
      doubleClickZoom={false}
      scrollWheelZoom={false}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {location.buddy && (
        <Marker position={[location.buddy.lat, location.buddy.lng]} icon={icon1}>
          <Popup>Buddy</Popup>
        </Marker>
      )}
      {location.camelia && (
        <Marker position={[location.camelia.lat, location.camelia.lng]} icon={icon2}>
          <Popup>Camélia</Popup>
        </Marker>
      )}
    </MapContainer>
  )
}
