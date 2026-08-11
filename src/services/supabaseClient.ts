import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ojvrlleziqrimhjvsbwf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_mI1eBd8nNRGv9uIICgOU-w_2weLI9lp';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
