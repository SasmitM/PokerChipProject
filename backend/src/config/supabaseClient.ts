import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

console.log("Supabase URL:", process.env.SUPABASE_URL);
console.log("Has Anon Key:", !!process.env.SUPABASE_ANON_KEY);

export const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string
);