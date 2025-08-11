import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { DuoLocation, Point } from '../lib/types'

const iconBuddy = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconAnchor: [12, 40], popupAnchor: [0, -30]
})
const iconCam = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconAnchor: [12, 40], popupAnchor: [0, -30]
})

function ClickCatcher({ onPick }:{ onPick:(lat:number,lng:number)=>void }){
  useMapEvents({
    click(e){ onPick(e.latlng.lat, e.latlng.lng) }
  })
  return null
}

export default function MapPicker({
  initial, who, onSave, onClose
}: { initial?: DuoLocation|null; who: 'Buddy'|'Camélia'; onSave:(loc:DuoLocation)=>void; onClose:()=>void }) {

  const center: LatLngExpression = (initial?.buddy ?? initial?.camelia ?? { lat:48.8566, lng:2.3522 }) as any
  const [buddy, setBuddy] = useState<Point|undefined>(initial?.buddy ?? undefined)
  const [camelia, setCamelia] = useState<Point|undefined>(initial?.camelia ?? undefined)

  function setAt(w:'Buddy'|'Camélia', p:Point){
    if (w==='Buddy') setBuddy(p); else setCamelia(p)
  }

  return (
    <div className="fixed inset-0 z-[2500] grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="card w-full max-w-3xl h-[70vh] grid" onClick={e=>e.stopPropagation()}>
        <div className="text-sm mb-2">
          Place ton point <b>{who}</b> (tape sur la carte). Tu ne peux modifier que ton point.
        </div>
        <div className="rounded-2xl overflow-hidden">
          <MapContainer center={center} zoom={4} style={{height:'60vh', width:'100%'}}>
            <ClickCatcher onPick={(lat,lng)=> setAt(who,{lat,lng}) }/>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
            {buddy && (
              <Marker position={[buddy.lat, buddy.lng]} draggable={who==='Buddy'} icon={iconBuddy}
                      eventHandlers={{ dragend:(e:any)=>setBuddy({ lat:e.target.getLatLng().lat, lng:e.target.getLatLng().lng }) }}>
                <Popup>Buddy</Popup>
              </Marker>
            )}
            {camelia && (
              <Marker position={[camelia.lat, camelia.lng]} draggable={who==='Camélia'} icon={iconCam}
                      eventHandlers={{ dragend:(e:any)=>setCamelia({ lat:e.target.getLatLng().lat, lng:e.target.getLatLng().lng }) }}>
                <Popup>Camélia</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
        <div className="mt-3 flex gap-2 justify-end">
          <button className="btn-outline" onClick={onClose}>Annuler</button>
          <button className="btn" onClick={()=>onSave({ buddy, camelia })}>Enregistrer</button>
        </div>
      </div>
    </div>
  )
}
