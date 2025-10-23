import { supabase } from "../config/supabaseClient.js";
import { Table } from "../models/Table.js";

export async function createTable(name: string): Promise<Table> {
  const { data, error } = await supabase
    .from("tables")
    .insert([{ 
      name,
      current_pot: 0
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getTableById(id: string): Promise<Table | null> {
  const { data, error } = await supabase
    .from("tables")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

export async function updateTableCreator(tableId: string, creatorId: string): Promise<void> {
  const { error } = await supabase
    .from("tables")
    .update({ created_by: creatorId })
    .eq("id", tableId);
  
  if (error) throw error;
}

export async function updatePot(tableId: string, amount: number): Promise<Table> {
  const { data, error } = await supabase
    .from("tables")
    .update({ current_pot: amount })
    .eq("id", tableId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addToPot(tableId: string, amount: number): Promise<Table> {
  const table = await getTableById(tableId);
  if (!table) throw new Error('Table not found');

  const newPot = table.current_pot + amount;
  return updatePot(tableId, newPot);
}

export async function takeFromPot(tableId: string, amount: number): Promise<Table> {
  const table = await getTableById(tableId);
  if (!table) throw new Error('Table not found');
  
  if (table.current_pot < amount) {
    throw new Error('Not enough in pot');
  }

  const newPot = table.current_pot - amount;
  return updatePot(tableId, newPot);
}

export async function resetPot(tableId: string): Promise<Table> {
  return updatePot(tableId, 0);
}

