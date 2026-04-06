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
    
    // 1. Verificamos quién está llamando a la API (verificando la sesión segura)
    const { data: { session } } = await supabaseClient.auth.getSession()
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    
    // 2. Inicializamos la Llave Maestra desde el principio
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Falta configurar la SUPABASE_SERVICE_ROLE_KEY en Vercel." }, { status: 500 })
    }

    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 3. Comprobamos que sea el Administrador Supremo real (Bypassing RLS con supabaseAdmin)
    const { data: profilesData, error: errSelect } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .limit(1)

    const profile = profilesData?.[0]

    if (errSelect || !profile || profile.role !== 'Administrador') {
      return NextResponse.json({ 
        error: `Permisos insuficientes. Tu rol actual es: '${profile?.role || "NINGUNO"}'. Se requiere 'Administrador'. (Detalle server: ${errSelect?.message || "Sin fila vinculada en BD"})` 
      }, { status: 403 })
    }

    // 4. Recibimos la data del nuevo usuario a crear
    const { email, password, nombre, rol, iniciales } = await request.json()

    // 5. Crear el usuario en la bóveda de "Authentication" de Supabase
    const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true // Confirmación automática, pasamos la verificación por correo
    })

    if (authError || !newUser.user) {
      return NextResponse.json({ error: authError?.message || "Error al crear auth.user" }, { status: 400 })
    }

    // 6. Inyectamos sus campos en nuestra tabla visible pública de "profiles"
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: newUser.user.id,
      email: email,
      first_name: nombre,
      last_name: iniciales, // Guardamos la inicial aquí por la estructura actual
      role: rol
    })

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, user: newUser.user })

  } catch (err: any) {
    console.error("Error en admin-create-user API: ", err)
    return NextResponse.json({ error: err.message || "Error interno del servidor" }, { status: 500 })
  }
}
