import { createClient } from '@supabase/supabase-js';

/**
 * The one Supabase client for the site. The URL and publishable key are public
 * by design (Row Level Security decides what they can read or write). Without
 * them, `supabase` is null and the site runs on its bundled data.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = url && key ? createClient(url, key) : null;
