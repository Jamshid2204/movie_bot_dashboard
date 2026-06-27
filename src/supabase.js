// Supabase client for the dashboard (browser). Uses the anon/publishable key,
// which is safe to expose — Row-Level Security enforces that only authenticated
// admins can write. Reads are public (see the RLS policy in SUPABASE_SETUP.md).
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill them in (see SUPABASE_SETUP.md).'
  );
}

export const STORAGE_CHANNEL_ID = import.meta.env.VITE_STORAGE_CHANNEL_ID || '';

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export const TABLE = 'movies';
