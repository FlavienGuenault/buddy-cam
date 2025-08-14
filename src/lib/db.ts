import { supabase } from './supabase'
import type { List, Item, Poem } from './types'

export async function getMe() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('not authed')
  return data.user
}

export async function ensureOwnerIsMember(listId: string, userId: string) {
  await supabase.from('list_members').upsert({ list_id: listId, user_id: userId }).throwOnError()
}

export async function createList(name: string, type: 'movies'|'activities'|'courses', partnerUid?: string): Promise<List> {
  const me = await getMe()
  const { data, error } = await supabase.from('lists').insert({ name, type, owner_id: me.id }).select('*').single()
  if (error) throw error
  await ensureOwnerIsMember(data.id, me.id)
  if (partnerUid) {
    await supabase.from('list_members').upsert({ list_id: data.id, user_id: partnerUid })
  }
  return data as List
}

export async function myLists(): Promise<List[]> {
  const me = await getMe()
  const { data: ids, error: e1 } = await supabase.from('list_members').select('list_id').eq('user_id', me.id)
  if (e1) throw e1
  const listIds = (ids ?? []).map((r:any)=> r.list_id)
  if (listIds.length === 0) return []
  const { data, error } = await supabase.from('lists').select('*').in('id', listIds).order('created_at', { ascending: false })
  if (error) throw error
  return data as List[]
}

export async function getList(listId: string): Promise<List> {
  const { data, error } = await supabase.from('lists').select('*').eq('id', listId).single()
  if (error) throw error
  return data as List
}

export async function listItems(listId: string): Promise<Item[]> {
  const { data, error } = await supabase.from('items').select('*').eq('list_id', listId).order('created_at', { ascending: false })
  if (error) throw error
  return data as Item[]
}

export async function addActivityItem(listId: string, title: string, notes?: string) {
  const { data, error } = await supabase.from('items').insert({ list_id: listId, title, notes })
  if (error) throw error
  return data
}

export async function addMovieItem(listId: string, tmdbId: number, title: string) {
  // récupère l’utilisateur courant
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr) throw authErr
  if (!user?.id) throw new Error('Non connecté')

  const { error } = await supabase
    .from('items')
    .insert({
      list_id: listId,
      title,
      tmdb_id: tmdbId,
      status: 'todo',
      creator_id: user.id,          // 👈 important
    })

  if (error) throw error
}

export async function markDone(itemId: string, patch: Partial<Item>) {
  const { data, error } = await supabase.from('items').update({ ...patch, status: 'done' }).eq('id', itemId).select('*').single()
  if (error) throw error
  return data as Item
}

export async function updateItem(itemId: string, patch: Partial<Item>) {
  const { data, error } = await supabase.from('items').update(patch).eq('id', itemId).select('*').single()
  if (error) throw error
  return data as Item
}

export async function listMovieIds(listId: string, limit = 4): Promise<number[]> {
  const { data, error } = await supabase
    .from('items')
    .select('tmdb_id')
    .eq('list_id', listId)
    .not('tmdb_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []).map((r: any) => r.tmdb_id as number)
}

export async function deleteList(listId: string){
  const { error } = await supabase.from('lists').delete().eq('id', listId)
  if (error) throw error
}

export async function deleteItem(itemId: string){
  const { error } = await supabase.from('items').delete().eq('id', itemId)
  if (error) throw error
}

export async function addCourseItem(listId: string, title: string, qty?: number|null, unit?: string|null) {
  const { error } = await supabase.from('items').insert({
    list_id: listId, title, qty: qty ?? null, unit: unit ?? null, status: 'todo'
  })
  if (error) throw error
}

// POEMS
export async function listPublishedPoems(author?: 'buddy'|'camelia'|'all'): Promise<Poem[]> {
  let q = supabase.from('poems').select('*').eq('is_published', true).order('created_at', { ascending: false })
  if (author && author !== 'all') {
    // filtre par display_name dans profiles ou par email → fais simple: jointure côté client après fetch
  }
  const { data, error } = await q
  if (error) throw error
  return data as Poem[]
}

export async function listMyDrafts(): Promise<Poem[]> {
  const me = await getMe()
  const { data, error } = await supabase.from('poems').select('*').eq('author_id', me.id).eq('is_published', false).order('updated_at', { ascending: false })
  if (error) throw error
  return data as Poem[]
}

export async function createPoem(title: string): Promise<Poem> {
  const me = await getMe()
  const { data, error } = await supabase.from('poems').insert({ author_id: me.id, title, content: '' }).select('*').single()
  if (error) throw error
  return data as Poem
}

export async function updatePoem(id: string, patch: Partial<Pick<Poem,'title'|'content'|'is_published'>>){
  const { error } = await supabase.from('poems').update(patch).eq('id', id)
  if (error) throw error
}

export async function publishPoem(id: string){
  await updatePoem(id, { is_published: true })
}

export async function deletePoem(id: string){
  const { error } = await supabase.from('poems').delete().eq('id', id)
  if (error) throw error
}

export async function getPoemById(id:string){
  const { data, error } = await supabase.from('poems').select('*').eq('id', id).single()
  if (error) throw error
  return data as Poem
}

export async function bulkUpdateItems(ids: string[], patch: Record<string, any>){
  const { error } = await supabase.from('items').update(patch).in('id', ids)
  if (error) throw error
}

export async function bulkDeleteItems(ids: string[]){
  const { error } = await supabase.from('items').delete().in('id', ids)
  if (error) throw error
}

export async function addGiftItem(
  listId: string,
  title: string,
  wrap_color: string,
  is_hidden: boolean
){
  const me = await getMe()
  const { error } = await supabase.from('items').insert({
    list_id: listId, title, status:'todo',
    creator_id: me.id, wrap_color, is_hidden
  })
  if (error) throw error
}

export async function toggleGiftMask(itemId: string, on: boolean){
  const { error } = await supabase.from('items').update({ is_hidden: on }).eq('id', itemId)
  if (error) throw error
}

export async function updateGiftWrap(itemId: string, wrap_color: string){
  const { error } = await supabase.from('items').update({ wrap_color }).eq('id', itemId)
  if (error) throw error
}

export async function updateGiftRevealAt(itemId: string, reveal_at: string | null){
  const { error } = await supabase.from('items').update({ reveal_at }).eq('id', itemId)
  if (error) throw error
}

export async function listEpisodeViews(itemId: string){
  const { data, error } = await supabase
    .from('episode_views')
    .select('user_id, season, episode')
    .eq('item_id', itemId)
  if (error) throw error
  return data as { user_id:string; season:number; episode:number }[]
}

export async function setEpisodeSeen(itemId: string, season: number, episode: number, seen: boolean){
  const me = await getMe()
  if (seen){
    const { error } = await supabase.from('episode_views').insert({ item_id:itemId, user_id:me.id, season, episode })
    if (error && !String(error.message||'').includes('duplicate key')) throw error
  }else{
    const { error } = await supabase
      .from('episode_views')
      .delete()
      .match({ item_id:itemId, user_id:me.id, season, episode })
    if (error) throw error
  }
}

export async function setSeasonSeen(itemId: string, season: number, episodes: number[], seen: boolean){
  const me = await getMe()
  if (seen){
    const rows = episodes.map(e => ({ item_id:itemId, user_id:me.id, season, episode:e }))
    const { error } = await supabase
      .from('episode_views')
      .upsert(rows, { onConflict: 'item_id,user_id,season,episode', ignoreDuplicates: false })
    if (error) throw error
  }else{
    const { error } = await supabase
      .from('episode_views')
      .delete()
      .eq('item_id', itemId)
      .eq('user_id', me.id)
      .eq('season', season)
      .in('episode', episodes)
    if (error) throw error
  }
}

export async function listSeriesIds(listId: string, limit = 50){
  const { data, error } = await supabase
    .from('items')
    .select('tmdb_id')
    .eq('list_id', listId)
    .not('tmdb_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data || []).map((r: any) => r.tmdb_id as number)
}