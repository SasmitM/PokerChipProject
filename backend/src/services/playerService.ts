import { supabase } from '../config/supabaseClient.js';
import { Player } from '../models/Player.js';
import { Session } from '../models/Session.js';

export async function addPlayer(tableId: string, playerName: string, initialChips: number = 1000) {
  // Create player
  const { data: player, error: playerError } = await supabase
    .from('players')
    .insert({
      table_id: tableId,
      name: playerName,
      money_count: initialChips,
      is_active: true,
      last_seen: new Date().toISOString()
    })
    .select()
    .single();

  if (playerError) throw playerError;

  // Create session
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .insert({
      table_id: tableId,
      player_id: player.id,
      last_active_at: new Date().toISOString()
    })
    .select()
    .single();

  if (sessionError) throw sessionError;

  return {
    player,
    sessionId: session.id
  };
}

export async function getPlayerById(playerId: string): Promise<Player | null> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function getPlayersByTable(tableId: string): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('table_id', tableId)
    .eq('is_active', true)
    .order('last_seen', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function updatePlayerChips(playerId: string, newAmount: number): Promise<Player> {
  const { data, error } = await supabase
    .from('players')
    .update({
      money_count: newAmount,
      last_seen: new Date().toISOString()
    })
    .eq('id', playerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function setPlayerInactive(playerId: string): Promise<void> {
  const { error } = await supabase
    .from('players')
    .update({
      is_active: false,
      last_seen: new Date().toISOString()
    })
    .eq('id', playerId);

  if (error) throw error;
}

export async function rejoinWithSession(sessionId: string) {
  // Find session
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    throw new Error('Invalid session');
  }

  // Get player
  const { data: player, error: playerError } = await supabase
    .from('players')
    .select('*')
    .eq('id', session.player_id)
    .single();

  if (playerError || !player) {
    throw new Error('Player not found');
  }

  // Update player status
  await supabase
    .from('players')
    .update({
      is_active: true,
      last_seen: new Date().toISOString()
    })
    .eq('id', session.player_id);

  // Update session
  await supabase
    .from('sessions')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', sessionId);

  return {
    player,
    sessionId: session.id,
    tableId: session.table_id
  };
}

export async function touchSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('sessions')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (error) throw error;
}