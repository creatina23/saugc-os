import { createBrowserClient } from "@supabase/ssr";

// Cliente Supabase para componentes de navegador (Client Components).
// Retorna null quando as chaves ainda não foram configuradas (.env.local / painel da Vercel),
// permitindo que o app continue rodando em modo mock, sem quebrar build nem deploy.
export function getSupabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createBrowserClient(url, anonKey);
}