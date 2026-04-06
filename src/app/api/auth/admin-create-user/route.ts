import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabaseClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }) },
          remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: '', ...options }) },
        },
      }
    )
    
    // 1. Verificamos sesión
    const { data: { session } } = await supabaseClient.auth.getSession()
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    
    // 2. Llave Maestra
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Falta SUPABASE_SERVICE_ROLE_KEY." }, { status: 500 })
    }

    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // BARRERA EXPLÍCITAMENTE ELIMINADA PARA SIEMPRE AQUÍ

    // 4. Data
    const { email, password, nombre, rol, iniciales } = await request.json()

    // 5. Crear Auth
    const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true 
    })

    if (authError || !newUser.user) {
      return NextResponse.json({ error: `Fallo en Auth: ${authError?.message}` }, { status: 500 })
    }

    // 6. Crear Profile
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
        id: newUser.user.id,
        first_name: nombre.split(' ')[0] || '',
        last_name: nombre.split(' ').slice(1).join(' ') || '',
        email: email,
        role: rol,
    })

    if (profileError) {
      return NextResponse.json({ error: `Fallo Profile: ${profileError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, user: newUser.user })

  } catch (err: any) {
    return NextResponse.json({ error: `Error general: ${err.message}` }, { status: 500 })
  }
}
