import { createClient } from '@insforge/sdk';

// Initialize official InsForge client for "CAMPAÑA ELECTORAL" project
export const insforge = createClient({
  baseUrl: import.meta.env.VITE_INSFORGE_BASE_URL || 'https://avy66p8w.us-east.insforge.app',
  anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY || 'ik_671a4094c023f2c25c158e629973a5f3',
});
