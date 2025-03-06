import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/supabaseServer';

export async function GET() {
  try {
    console.log('Checking auth status...');
    const supabase = await createServerSupabaseClient();
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.json(
        { error: 'Failed to get session', details: sessionError },
        { status: 500 }
      );
    }
    
    if (!session) {
      console.log('No active session found');
      return NextResponse.json(
        { authenticated: false, message: 'No active session found' },
        { status: 200 }
      );
    }
    
    console.log(`Authenticated as ${session.user.email}`);
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
      },
    });
  } catch (error) {
    console.error('Error checking auth status:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
} 