import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Get the current user from Supabase
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            cookieStore.set(name, value, options);
          },
          remove(name, options) {
            cookieStore.set(name, '', { ...options, maxAge: 0 });
          },
        },
      }
    );
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Check if tokens exist for the user
    const { data, error } = await supabase
      .from('user_drive_tokens')
      .select('id, created_at, updated_at')
      .eq('user_id', user.id);
    
    return NextResponse.json({
      authenticated: true,
      userId: user.id,
      hasTokens: data && data.length > 0,
      tokenCount: data?.length || 0,
      tokenInfo: data,
      error: error ? {
        message: error.message,
        code: error.code
      } : null
    });
  } catch (error) {
    console.error('Error checking tokens:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 