import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseURl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

console.log(supabaseURl)
console.log(supabaseAnonKey)

const supabase: SupabaseClient = createClient(supabaseURl, supabaseAnonKey);

export { supabase };