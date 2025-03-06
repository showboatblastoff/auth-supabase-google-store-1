import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Try to query the table directly
    const { data, error } = await supabase
      .from('user_drive_tokens')
      .select('*')
      .limit(1);
    
    return NextResponse.json({
      success: !error,
      data,
      error: error ? {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      } : null
    });
  } catch (error) {
    console.error('Error checking table:', error);
    return NextResponse.json({
      success: false,
      caught: true,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 