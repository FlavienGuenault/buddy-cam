export type List = { id: string; type: 'movies'|'activities'; name: string; owner_id: string; created_at: string }
export type Point = { lat:number; lng:number; label?:string }
export type DuoLocation = { buddy?: Point; camelia?: Point }

export type Item = {
  id: string; list_id: string; title: string; notes?: string | null; status: 'todo'|'done';
  rating?: number | null; review?: string | null; when_at?: string | null;
  location?: DuoLocation | null; attendees?: string[] | null; tmdb_id?: number | null;
  created_at: string
}
