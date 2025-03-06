import { NextRequest, NextResponse } from 'next/server';
import { getTokens } from '@/utils/googleDrive';
import { createServerSupabaseClient } from '@/utils/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    console.log('Google callback: Starting authentication process');
    
    // Get the authorization code from the URL
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    
    if (!code) {
      console.log('Google callback: No code provided');
      return NextResponse.redirect(new URL('/login?error=no-code', request.url));
    }
    
    console.log('Google callback: Code received, exchanging for tokens');
    
    // Exchange the code for tokens
    const tokens = await getTokens(code);
    
    // Get the current user from Supabase
    const supabase = await createServerSupabaseClient();
    
    console.log('Google callback: Checking for active session');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('Google callback: Session error', sessionError);
      return NextResponse.redirect(new URL('/login?error=session-error', request.url));
    }
    
    if (!session) {
      console.log('Google callback: No active session found');
      return NextResponse.redirect(new URL('/login?error=not-authenticated', request.url));
    }
    
    const user = session.user;
    console.log(`Google callback: User authenticated: ${user.email}`);
    
    // Store the tokens in the database
    console.log(`Google callback: Storing tokens for user ${user.id}`);
    
    try {
      const { error: upsertError } = await supabase
        .from('user_drive_tokens')
        .upsert({
          user_id: user.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expiry_date: tokens.expiry_date,
          updated_at: new Date().toISOString(),
        });
      
      if (upsertError) {
        console.error('Google callback: Error storing tokens:', upsertError);
        return NextResponse.redirect(new URL('/drive?error=token-storage-failed', request.url));
      }
      
      console.log('Google callback: Tokens stored successfully');
      
      // Redirect to the drive page
      return NextResponse.redirect(new URL('/drive?success=true', request.url));
    } catch (dbError) {
      console.error('Google callback: Database error storing tokens:', dbError);
      return NextResponse.redirect(new URL('/drive?error=database-error', request.url));
    }
  } catch (error) {
    console.error('Google callback: Unexpected error:', error);
    return NextResponse.redirect(new URL('/drive?error=callback-failed', request.url));
  }
} 