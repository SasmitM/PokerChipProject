import { supabase } from '../config/supabaseClient.js';
import { Session } from '../models/Session.js';

export async function createSession(tableId: string, playerId: string): Promise<Session> {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      table_id: tableId,
      player_id: playerId,
      last_active_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSessionById(id: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}