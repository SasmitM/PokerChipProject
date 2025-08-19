export {}; // <- ensures TS treats this file as a module

import { supabase } from "../config/supabaseClient";

export async function createTable(name: string) {
  const { data, error } = await supabase
    .from("tables")
    .insert([{ name }])
    .select();

  if (error) throw error;
  return data;
}
