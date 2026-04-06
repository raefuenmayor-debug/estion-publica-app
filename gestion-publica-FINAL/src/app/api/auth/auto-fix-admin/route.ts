import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { sessionData } = await request.json();
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing Service Role");

    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error } = await supabaseAdmin.from('profiles').upsert({
      id: sessionData.user.id,
      email: sessionData.user.email,
      role: 'Administrador',
      first_name: 'Administrador',
      last_name: 'General'
    });

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
