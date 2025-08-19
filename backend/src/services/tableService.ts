import { supabase } from "../config/supabaseClient";

export async function createTable(name: string) {
  const { data, error } = await supabase
    .from("tables")
    .insert([{ name }])
    .select();
  if (error) throw error;
  return data[0];
}

export async function getTableById(id: string) {
  const { data, error } = await supabase
    .from("tables")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}
