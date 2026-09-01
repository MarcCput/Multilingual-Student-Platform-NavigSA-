import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * True once .env.local holds real credentials. The placeholder values shipped
 * in .env.example don't count — without this guard the app would render an
 * empty dashboard and leave you guessing why.
 */
export const isSupabaseConfigured =
  Boolean(url && anonKey) &&
  !url.includes('your-project-ref') &&
  !anonKey.includes('your-anon-key');

if (!isSupabaseConfigured) {
  console.warn(
    '[NavigSA] Supabase is not configured. Copy .env.example to .env.local, ' +
      'fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from your project ' +
      'settings, then restart the dev server.',
  );
}

export const supabase = createClient(
  url || 'http://localhost:54321',
  anonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
