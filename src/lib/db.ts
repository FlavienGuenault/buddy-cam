import { supabase } from './supabase'
import type { List, Item } from './types'

export async function getMe() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('not authed')
  return data.user
}

export async function ensureOwnerIsMember(listId: string, userId: string) {
  await supabase.from('list_members').upsert({ list_id: listId, user_id: userId }).throwOnError()
}

export async function createList(name: string, type: 'movies'|'activities', partnerUid?: string): Promise<List> {
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

export async function addMovieItem(listId: string, tmdb_id: number, title: string) {
  const { data, error } = await supabase.from('items').insert({ list_id: listId, tmdb_id, title })
  if (error) throw error
  return data
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