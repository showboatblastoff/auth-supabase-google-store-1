import { addToCart } from '@/utils/supabaseClient';
import { createClient } from '@/utils/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  const searchParams = new URL(request.url).searchParams;
  const productId = searchParams.get('productId');
  const quantityParam = searchParams.get('quantity');
  const quantity = quantityParam ? parseInt(quantityParam, 10) : 1;
  
  if (!productId) {
    return NextResponse.json(
      { error: 'Product ID is required' },
      { status: 400 }
    );
  }
  
  try {
    await addToCart(user.id, productId, quantity);
    
    // If the request is coming from a form submission, redirect to cart
    if (request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
      return NextResponse.redirect(new URL('/cart', request.url));
    }
    
    // Otherwise return JSON response for API calls
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
} 