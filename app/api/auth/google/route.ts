import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/utils/googleDrive';
import { createServerSupabaseClient } from '@/utils/supabaseServer';

export async function GET() {
  try {
    console.log('Google auth: Checking for active session');
    
    // First check if the user is authenticated
    const supabase = await createServerSupabaseClient();
    console.log('Google auth: Supabase client created');
    
    const sessionResult = await supabase.auth.getSession();
    console.log('Google auth: Session result received');
    
    if (sessionResult.error) {
      console.error('Google auth: Session error', sessionResult.error);
    }
    
    const { data: { session } } = sessionResult;
    
    // Log all cookies
    try {
      const cookieStore = await (global as any).cookieStore;
      const cookies = await cookieStore?.getAll?.();
      console.log('Google auth: Cookies available:', cookies ? cookies.length : 'none');
    } catch (e) {
      console.log('Google auth: Cannot access cookies in this context');
    }
    
    if (!session) {
      console.log('Google auth: No active session found');
      return NextResponse.redirect(new URL('/login?error=auth-required', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
    }
    
    console.log(`Google auth: User authenticated: ${session.user.email}`);
    console.log(`Google auth: User ID: ${session.user.id}`);
    console.log('Google auth: Initiating Google OAuth flow');
    
    const authUrl = getAuthUrl();
    console.log(`Google auth: Redirecting to ${authUrl.substring(0, 50)}...`);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating Google OAuth flow:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google OAuth flow' },
      { status: 500 }
    );
  }
} 