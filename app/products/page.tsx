import { getProducts, getCategories } from '@/utils/ecommerce';
import ProductGrid from '@/components/ProductGrid';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
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
            // This can be ignored if middleware is handling cookies
          }
        },
      },
    }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  const products = await getProducts();
  const categories = await getCategories();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">All Products</h1>
      
      {categories.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/products"
              className="inline-block px-4 py-2 rounded-full bg-blue-500 text-white text-sm font-medium"
            >
              All
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="inline-block px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-sm font-medium transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}
      
      <ProductGrid products={products} userId={user?.id} />
    </div>
  );
} 