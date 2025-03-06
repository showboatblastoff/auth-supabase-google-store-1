import { getProducts, getCategories } from '@/utils/supabaseClient';
import ProductGrid from '@/components/ProductGrid';
import { createClient } from '@/utils/supabaseServer';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const supabase = createClient();
  
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