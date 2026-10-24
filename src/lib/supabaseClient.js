import { createClient } from "@supabase/supabase-js";

// Browser client (anon key). Every read/write is constrained by RLS — see supabase/migrations.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
