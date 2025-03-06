import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  try {
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
    
    // Check if user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return NextResponse.json(
        { error: 'Failed to get session', details: sessionError },
        { status: 500 }
      );
    }
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Check for Google Drive tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('user_drive_tokens')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    
    if (tokensError) {
      if (tokensError.code === 'PGRST116') {
        // No tokens found
        return NextResponse.json(
          { 
            hasTokens: false,
            message: 'No Google Drive tokens found for this user',
            user_id: session.user.id 
          },
          { status: 200 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to check for tokens', details: tokensError },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      hasTokens: true,
      tokens: {
        access_token: '••••••••' + tokens.access_token.slice(-5),
        refresh_token: tokens.refresh_token ? '••••••••' + tokens.refresh_token.slice(-5) : null,
        expires_at: tokens.expires_at,
      },
      user_id: session.user.id
    });
  } catch (error) {
    console.error('Error checking drive tokens:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
} 