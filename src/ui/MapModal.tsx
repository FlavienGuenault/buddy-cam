import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function MapModal({
  point, label, onClose
}: { point:{lat:number; lng:number}; label:string; onClose:()=>void }) {

  const center: LatLngExpression = [point.lat, point.lng]

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="card w-full max-w-2xl" onClick={e=>e.stopPropagation()}>
        <div className="h-[60vh] rounded-2xl overflow-hidden">
          <MapContainer center={center} zoom={5} style={{height:'100%', width:'100%'}}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <CircleMarker center={center} radius={10} color="#ff4f8a">
              <Popup>{label}</Popup>
            </CircleMarker>
          </MapContainer>
        </div>
      </div>
    </div>
  )
}
