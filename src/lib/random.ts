export function pickRandom<T extends { id?: string; tmdb_id?: number | null; title?: string }>(
  items: T[],
  excludeIds: Set<string | number> = new Set()
): T | null {
  const pool = items.filter((x: any) => x && !excludeIds.has(x.id ?? x.tmdb_id ?? ''))
  if (pool.length === 0) return null
  const idx = Math.floor(Math.random() * pool.length)
  return pool[idx]
}
