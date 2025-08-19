import { supabase } from "../config/supabaseClient";

export async function addPlayer(tableId: string, name: string) {
  const { data, error } = await supabase
    .from("players")
    .insert([{ table_id: tableId, name, money_count: 2000 }])
    .select();
  if (error) throw error;
  return data[0];
}

export async function getPlayersByTable(tableId: string) {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("table_id", tableId);
  if (error) throw error;
  return data;
}
