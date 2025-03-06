import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { deleteFile } from '@/utils/googleDrive';

export async function DELETE(request: NextRequest) {
  try {
    // Get the file ID from the query parameters
    const fileId = request.nextUrl.searchParams.get('fileId');
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'No file ID provided' },
        { status: 400 }
      );
    }
    
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
    
    // Get the user's Google Drive tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_drive_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Google Drive not connected' },
        { status: 400 }
      );
    }
    
    // Delete the file from Google Drive
    const result = await deleteFile(
      {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expiry_date: tokenData.expiry_date,
      },
      fileId
    );
    
    return NextResponse.json({ success: result });
  } catch (error) {
    console.error('Error deleting file from Google Drive:', error);
    return NextResponse.json(
      { error: 'Failed to delete file from Google Drive' },
      { status: 500 }
    );
  }
} 