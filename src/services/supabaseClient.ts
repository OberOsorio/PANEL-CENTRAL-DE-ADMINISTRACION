import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://campana-ganadora-central.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'supabase_anon_key_demo_cg2026';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
