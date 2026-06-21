import { createClient } from "@supabase/supabase-js";

// Public Supabase client. Uses the anon key + Row Level Security, so it can
// only read rows the RLS policy exposes (published blog posts). Writes happen
// out-of-band (Supabase dashboard / MCP), never from the browser.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
