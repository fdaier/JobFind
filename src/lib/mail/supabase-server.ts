import { createClient } from "@supabase/supabase-js";

function configuration() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !publishableKey || !secretKey) throw new Error("Supabase server configuration is incomplete");
  return { url, publishableKey, secretKey };
}

export async function authorizedMailUser(request: Request) {
  const token = /^Bearer (.+)$/i.exec(request.headers.get("authorization") ?? "")?.[1];
  if (!token) return null;
  const { url, publishableKey } = configuration();
  const auth = createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await auth.auth.getUser(token);
  return error ? null : data.user;
}

export function mailDatabase() {
  const { url, secretKey } = configuration();
  return createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
}
