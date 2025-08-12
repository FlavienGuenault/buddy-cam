import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import L from 'leaflet'

function MapStatic({ location }:{
  location: { buddy?:{lat:number;lng:number}, camelia?:{lat:number;lng:number} }
}){
  const center: LatLngExpression = location.buddy ?? location.camelia ?? {lat:48.8566,lng:2.3522}
  const icon = new L.Icon({ iconUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', iconAnchor:[12,40] })
  const icon2 = new L.Icon({ iconUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', iconAnchor:[12,40] })

  return (
    <MapContainer center={center} zoom={4} style={{height:'100%', width:'100%'}} dragging={false} doubleClickZoom={false} scrollWheelZoom={false} zoomControl={false}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
      {location.buddy && <Marker position={[location.buddy.lat, location.buddy.lng]} icon={icon}><Popup>Buddy</Popup></Marker>}
      {location.camelia && <Marker position={[location.camelia.lat, location.camelia.lng]} icon={icon2}><Popup>Camélia</Popup></Marker>}
    </MapContainer>
  )
}
