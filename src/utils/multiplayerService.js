/*
  Run this SQL in the Supabase SQL editor before using multiplayer:

  create table rooms (
    code text primary key,
    host_id text,
    guest_id text,
    status text default 'waiting',
    board_state jsonb,
    current_player text default 'red',
    last_move jsonb,
    updated_at timestamptz default now()
  );
  alter table rooms enable row level security;
  create policy "Anyone can read and write rooms" on rooms for all using (true);
*/

import { supabase } from './supabase'

export async function createRoom(roomCode, hostId) {
  const { error } = await supabase.from('rooms').insert({
    code: roomCode,
    host_id: hostId,
    status: 'waiting',
    current_player: 'red',
  })
  if (error) throw error
}

export async function joinRoom(roomCode, guestId) {
  const { data, error } = await supabase
    .from('rooms')
    .update({ guest_id: guestId, status: 'active' })
    .eq('code', roomCode)
    .eq('status', 'waiting')
    .select()
  if (error) throw error
  if (!data || data.length === 0) throw new Error('Room not found or already in progress.')
}

export function subscribeToRoom(roomCode, onUpdate) {
  const channel = supabase
    .channel(`room:${roomCode}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `code=eq.${roomCode}` },
      (payload) => onUpdate(payload.new),
    )
    .subscribe()
  return () => supabase.removeChannel(channel)
}

export async function broadcastMove(roomCode, move, boardState, nextPlayer) {
  const { error } = await supabase.from('rooms').update({
    board_state: boardState,
    current_player: nextPlayer,
    last_move: move,
    updated_at: new Date().toISOString(),
  }).eq('code', roomCode)
  if (error) throw error
}

export async function leaveRoom(roomCode) {
  const { error } = await supabase.from('rooms')
    .update({ status: 'finished', updated_at: new Date().toISOString() })
    .eq('code', roomCode)
  if (error) console.error('leaveRoom:', error)
}
