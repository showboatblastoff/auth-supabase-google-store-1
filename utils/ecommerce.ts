import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Category, Product, Order, CartItem } from '@/utils/types';

// Create Supabase client for server components
async function createClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// Category functions
export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  
  return data || [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error(`Error fetching category with slug ${slug}:`, error);
    return null;
  }
  
  return data;
}

// Product functions
export async function getProducts(limit: number = 100, offset: number = 0): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  return data || [];
}

export async function getFeaturedProducts(limit: number = 8): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('is_featured', true)
    .limit(limit)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
  
  return data || [];
}

export async function getProductsByCategory(categoryId: string, limit: number = 100): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('category_id', categoryId)
    .limit(limit)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    return [];
  }
  
  return data || [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error(`Error fetching product with slug ${slug}:`, error);
    return null;
  }
  
  return data;
}

// Cart functions
export async function getCartItems(userId: string): Promise<CartItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:products(*)
    `)
    .eq('user_id', userId);
  
  if (error) {
    console.error(`Error fetching cart items for user ${userId}:`, error);
    return [];
  }
  
  return data || [];
}

export async function addToCart(userId: string, productId: string, quantity: number = 1): Promise<CartItem | null> {
  const supabase = await createClient();
  
  // Check if item is already in cart
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();
  
  if (existingItem) {
    // Update quantity if already in cart
    const newQuantity = existingItem.quantity + quantity;
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
      .eq('id', existingItem.id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating cart item:`, error);
      return null;
    }
    
    return data;
  } else {
    // Add new item to cart
    const { data, error } = await supabase
      .from('cart_items')
      .insert([
        { user_id: userId, product_id: productId, quantity }
      ])
      .select()
      .single();
    
    if (error) {
      console.error(`Error adding item to cart:`, error);
      return null;
    }
    
    return data;
  }
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number): Promise<CartItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq('id', cartItemId)
    .select()
    .single();
  
  if (error) {
    console.error(`Error updating cart item quantity:`, error);
    return null;
  }
  
  return data;
}

export async function removeFromCart(cartItemId: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId);
  
  if (error) {
    console.error(`Error removing item from cart:`, error);
    return false;
  }
  
  return true;
}

// Order functions
export async function createOrder(
  userId: string, 
  cartItems: CartItem[], 
  shippingAddress: Record<string, string>, 
  billingAddress: Record<string, string>
): Promise<Order | null> {
  const supabase = await createClient();
  
  // Calculate order total
  let totalAmount = 0;
  for (const item of cartItems) {
    if (item.product) {
      totalAmount += item.product.price * item.quantity;
    }
  }
  
  // Start transaction by creating the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      user_id: userId,
      status: 'pending',
      total_amount: totalAmount,
      shipping_address: shippingAddress,
      billing_address: billingAddress,
      payment_status: 'pending'
    }])
    .select()
    .single();
  
  if (orderError) {
    console.error('Error creating order:', orderError);
    return null;
  }
  
  // Create order items
  const orderItems = cartItems.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price_at_purchase: item.product?.price || 0
  }));
  
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);
  
  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    return null;
  }
  
  // Clear the cart
  const { error: cartError } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);
  
  if (cartError) {
    console.error('Error clearing cart:', cartError);
  }
  
  return order;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        product:products(*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error(`Error fetching orders for user ${userId}:`, error);
    return [];
  }
  
  return data || [];
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        product:products(*)
      )
    `)
    .eq('id', orderId)
    .single();
  
  if (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    return null;
  }
  
  return data;
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<Order | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();
  
  if (error) {
    console.error(`Error updating order status:`, error);
    return null;
  }
  
  return data;
}

export async function updatePaymentStatus(
  orderId: string, 
  paymentStatus: Order['payment_status'], 
  paymentIntentId?: string
): Promise<Order | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .update({ 
      payment_status: paymentStatus, 
      payment_intent_id: paymentIntentId,
      updated_at: new Date().toISOString() 
    })
    .eq('id', orderId)
    .select()
    .single();
  
  if (error) {
    console.error(`Error updating payment status:`, error);
    return null;
  }
  
  return data;
} 