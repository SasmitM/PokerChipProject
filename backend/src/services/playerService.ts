import { supabase } from '../config/supabaseClient.js';

interface Player {
  id: string;
  table_id: string;
  name: string;
  money_count: number;
  is_active: boolean;
  last_seen: string;
}

interface PlayerSession {
  id: string;
  table_id: string;
  player_id: string;
  last_active_at: string;
  created_at: string;
}

// Create a new player and session
export async function addPlayer(tableId: string, playerName: string, initialChips: number = 1000) {
  try {
    console.log("Adding player:", { tableId, playerName, initialChips });
    
    // First, create the player
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

    if (playerError) {
      console.error("Player creation error:", playerError);
      throw playerError;
    }

    // Then create a session for this player
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        table_id: tableId,
        player_id: player.id,
        last_active_at: new Date().toISOString()
      })
      .select()
      .single();

    if (sessionError) {
      console.error("Session creation error:", sessionError);
      throw sessionError;
    }

    // Return both player and session info
    return {
      player,
      sessionId: session.id
    };
  } catch (error) {
    console.error('Error adding player:', error);
    throw error;
  }
}

// Rejoin a table using a session ID
export async function rejoinWithSession(sessionId: string) {
  try {
    console.log("Trying to rejoin with sessionId:", sessionId);
    
    // Find the session first
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    console.log("Session lookup result:", { session, sessionError });

    if (sessionError || !session) {
      throw new Error('Invalid session');
    }

    // Now get the player separately
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('*')
      .eq('id', session.player_id)
      .single();

    console.log("Player lookup result:", { player, playerError });

    // Update player status
    const { error: updateError } = await supabase
      .from('players')
      .update({
        is_active: true,
        last_seen: new Date().toISOString()
      })
      .eq('id', session.player_id);

    if (updateError) throw updateError;

    // Update session last active
    await supabase
      .from('sessions')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', sessionId);

    return {
      player: player,
      sessionId: session.id,
      tableId: session.table_id
    };
  } catch (error) {
    console.error('Error rejoining:', error);
    throw error;
  }
}

// Get all active players at a table
export async function getPlayersByTable(tableId: string) {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('table_id', tableId)
      .eq('is_active', true)
      .order('last_seen', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching players:', error);
    throw error;
  }
}

// Mark player as inactive when they leave
export async function setPlayerInactive(playerId: string) {
  try {
    const { error } = await supabase
      .from('players')
      .update({
        is_active: false,
        last_seen: new Date().toISOString()
      })
      .eq('id', playerId);

    if (error) throw error;
  } catch (error) {
    console.error('Error setting player inactive:', error);
    throw error;
  }
}

// Update player's chip count
export async function updatePlayerChips(playerId: string, newAmount: number) {
  try {
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
  } catch (error) {
    console.error('Error updating chips:', error);
    throw error;
  }
}

// Update session activity timestamp
export async function touchSession(sessionId: string) {
  try {
    const { error } = await supabase
      .from('sessions')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating session:', error);
    throw error;
  }
}
