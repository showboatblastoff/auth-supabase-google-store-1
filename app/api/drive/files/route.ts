import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { listFiles } from '@/utils/googleDrive';

export async function GET(_request: NextRequest) {
  console.log('API route /api/drive/files called');
  try {
    // Get the current user from Supabase
    const cookieStore = await cookies();
    console.log('Got cookie store');
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
    console.log('Created Supabase client');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Failed to get user:', userError.message);
      return NextResponse.json(
        { error: 'Authentication error', details: userError.message },
        { status: 401 }
      );
    }
    
    console.log('Got user:', user ? 'User found' : 'No user found');
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get the user's Google Drive tokens
    console.log('Querying user_drive_tokens table');
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_drive_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    console.log('Token query result:', tokenData ? 'Token found' : 'No token found', tokenError ? `Error: ${tokenError.message}` : 'No error');
    
    if (tokenError) {
      if (tokenError.code === 'PGRST116') {
        console.log('No Google Drive tokens found for user');
        return NextResponse.json(
          { error: 'Google Drive not connected', details: 'No tokens found' },
          { status: 400 }
        );
      }
      
      console.error('Token error:', tokenError.message);
      return NextResponse.json(
        { error: 'Failed to retrieve Google Drive tokens', details: tokenError.message },
        { status: 500 }
      );
    }
    
    if (!tokenData) {
      console.log('No Google Drive tokens found for user');
      return NextResponse.json(
        { error: 'Google Drive not connected', details: 'No tokens found' },
        { status: 400 }
      );
    }
    
    // Check if token data is valid
    if (!tokenData.access_token) {
      console.error('Invalid token data: Missing access_token');
      return NextResponse.json(
        { error: 'Invalid Google Drive token', details: 'Missing access token' },
        { status: 400 }
      );
    }
    
    // List files from Google Drive
    try {
      const files = await listFiles({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expiry_date: tokenData.expiry_date,
      });
      
      return NextResponse.json(files);
    } catch (driveError) {
      console.error('Google Drive API error:', 
        driveError instanceof Error ? driveError.message : 'Unknown error');
      
      if (driveError instanceof Error && driveError.stack) {
        console.error('Error stack:', driveError.stack);
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to list files from Google Drive', 
          details: driveError instanceof Error ? driveError.message : 'Unknown API error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error listing files from Google Drive:', 
      error instanceof Error ? error.message : 'Unknown error');
    
    if (error instanceof Error && error.stack) {
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to list files from Google Drive', 
        details: error instanceof Error ? error.message : 'Unknown server error'
      },
      { status: 500 }
    );
  }
} 