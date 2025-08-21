import { supabase } from "../config/supabaseClient.js";

export async function createTable(name: string) {
  console.log("Creating table with name:", name);
  const { data, error } = await supabase
    .from("tables")
    .insert([{ name }])
    .select();
  
  if (error) {
    console.error("Supabase error:", error);
    throw error;
  }
  
  console.log("Table created:", data);
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