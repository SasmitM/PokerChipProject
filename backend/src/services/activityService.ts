import { supabase } from '../config/supabaseClient.js';
import { CreateActivityLogInput, ActivityLog } from '../models/ActivityLog.js';

export async function logActivity(input: CreateActivityLogInput): Promise<ActivityLog> {
  const { data, error } = await supabase
    .from('activity_logs')
    .insert({
      table_id: input.table_id,
      player_id: input.player_id,
      action_type: input.action_type,
      amount: input.amount || null
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getTableActivities(tableId: string, limit: number = 50): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      *,
      players!inner (name)
    `)
    .eq('table_id', tableId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}