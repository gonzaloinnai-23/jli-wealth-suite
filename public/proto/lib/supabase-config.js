// JLI Wealth Suite — credenciales públicas de Supabase
//
// El anon-key es seguro de exponer en el cliente porque la base está
// protegida con Row Level Security (ver db/schema.sql).
//
// Cómo obtener estos valores:
//   1) Crear proyecto en https://supabase.com
//   2) Settings → API
//   3) Pegá Project URL y anon public key acá abajo
//   4) Commit + push (Vercel deploya automático)
//
// Si los valores quedan vacíos, el sitio funciona en modo "demo sin auth"
// (sólo localStorage, igual que antes de Supabase).
window.SUPABASE_CONFIG = {
  url:     'https://skyftbbubkvqvdmilbds.supabase.co',  // wealth portal 2.0
  anonKey: '',  // ← PEGÁ acá la "Publishable" o "anon public" key del nuevo proyecto
};
