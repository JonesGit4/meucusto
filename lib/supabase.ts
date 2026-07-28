import { createClient } from "@supabase/supabase-js";

// Schema simplificado para evitar erros de tipo
type Database = Record<string, any>;

let _supabase: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabase() {
  if (_supabase) return _supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase env vars not set");
  _supabase = createClient<Database>(url, key);
  return _supabase;
}
