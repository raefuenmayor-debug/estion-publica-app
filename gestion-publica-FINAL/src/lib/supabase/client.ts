import { createBrowserClient } from '@supabase/ssr'

// Utilidad para crear cliente Supabase en componentes de react (Browser)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
