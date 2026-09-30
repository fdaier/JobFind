import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let instance: SupabaseClient | null = null;

export function mailAuthClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  instance ??= createClient(url, key, { auth: { flowType: "pkce", detectSessionInUrl: false, autoRefreshToken: true, persistSession: true } });
  return instance;
}
