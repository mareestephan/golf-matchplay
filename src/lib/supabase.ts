import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * True when both Supabase env vars are present at build time. When false the app
 * transparently falls back to localStorage so it still runs on GitHub Pages
 * without any backend configured.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Browser Supabase client. The anon key is deliberately shipped to the client —
 * data is protected by Row Level Security policies, not by hiding the key.
 * `null` when Supabase is not configured.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;
