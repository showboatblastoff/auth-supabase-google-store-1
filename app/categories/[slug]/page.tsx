import { getCategoryBySlug, getProductsByCategory, getCategories } from '@/utils/ecommerce';
import ProductGrid from '@/components/ProductGrid';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;
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
  const category = await getCategoryBySlug(slug);
  
  if (!category) {
    notFound();
  }
  
  const products = await getProductsByCategory(category.id);
  const categories = await getCategories();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
      
      {category.description && (
        <p className="text-gray-600 mb-6">{category.description}</p>
      )}
      
      {categories.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/products"
              className="inline-block px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-sm font-medium transition-colors"
            >
              All
            </Link>
            
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className={`inline-block px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  cat.id === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
      
      <ProductGrid products={products} userId={user?.id} />
    </div>
  );
} 