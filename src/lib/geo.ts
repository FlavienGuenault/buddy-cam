export function getCurrentPosition(): Promise<{lat:number; lng:number; label?:string}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('geolocation unavailable'))
    navigator.geolocation.getCurrentPosition(pos => {
      resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    }, reject, { enableHighAccuracy: true, timeout: 10000 })
  })
}