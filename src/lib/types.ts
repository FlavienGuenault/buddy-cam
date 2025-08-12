export type List = { id: string; type: 'movies'|'activities'|'courses'; name: string; owner_id: string; created_at: string }
export type Point = { lat:number; lng:number; label?:string }
export type DuoLocation = { buddy?: Point; camelia?: Point }

export type Item = {
  id: string; list_id: string; title: string; notes?: string | null; status: 'todo'|'done';
  rating?: number | null; review?: string | null; when_at?: string | null;
  location?: DuoLocation | null; attendees?: string[] | null; tmdb_id?: number | null;qty?: number | null;
  unit?: string | null;
  created_at: string
}

export type Poem = {
  id: string;
  author_id: string;
  title: string;
  content: string;          // markdown + un peu de HTML
  is_published: boolean;
  created_at: string;
  updated_at: string;
}