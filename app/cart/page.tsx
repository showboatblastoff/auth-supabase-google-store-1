import { getCartItems } from '@/utils/supabaseClient';
import Cart from '@/components/Cart';
import { createClient } from '@/utils/supabaseServer';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CartPage() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  const cartItems = await getCartItems(user.id);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Cart items={cartItems} />
    </div>
  );
} 