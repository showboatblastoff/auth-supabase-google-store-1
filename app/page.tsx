import { getFeaturedProducts, getCategories } from '@/utils/supabaseClient';
import ProductGrid from '@/components/ProductGrid';
import { createClient } from '@/utils/supabaseServer';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  const featuredProducts = await getFeaturedProducts();
  const categories = await getCategories();
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white rounded-lg p-8 mb-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold mb-4">Welcome to Our Store</h1>
          <p className="text-xl mb-6">Discover amazing products at great prices.</p>
          <Link
            href="/products"
            className="inline-block bg-white text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>
      
      {/* Categories Section */}
      {categories.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="bg-gray-100 hover:bg-gray-200 rounded-lg p-6 text-center transition-colors"
              >
                <h3 className="text-lg font-medium">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link
              href="/products"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All
            </Link>
          </div>
          <ProductGrid products={featuredProducts} userId={user?.id} />
        </div>
      )}
    </div>
  );
}
