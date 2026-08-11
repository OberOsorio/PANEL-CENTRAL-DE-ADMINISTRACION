import { createClient } from '@insforge/sdk';

const insforgeUrl = (import.meta as any).env?.VITE_INSFORGE_BASE_URL || 'https://campana-ganadora-central.insforge.app/';
const insforgeAnonKey = (import.meta as any).env?.INSFORGE_ANON_KEY || 'insforge_anon_key_demo_cg2026';

export const insforge = createClient({
  baseUrl: insforgeUrl,
  anonKey: insforgeAnonKey,
});

