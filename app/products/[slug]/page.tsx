import { getProductBySlug, getFeaturedProducts } from '@/utils/ecommerce';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import ProductGrid from '@/components/ProductGrid';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
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
  const product = await getProductBySlug(slug);
  
  if (!product) {
    notFound();
  }
  
  // Get related products from the same category
  const relatedProducts = await getFeaturedProducts(4);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="text-sm mb-6">
        <ol className="list-none p-0 inline-flex">
          <li className="flex items-center">
            <Link href="/" className="text-gray-500 hover:text-blue-500">Home</Link>
            <span className="mx-2">/</span>
          </li>
          <li className="flex items-center">
            <Link href="/products" className="text-gray-500 hover:text-blue-500">Products</Link>
            <span className="mx-2">/</span>
          </li>
          {product.category && (
            <li className="flex items-center">
              <Link href={`/categories/${product.category.slug}`} className="text-gray-500 hover:text-blue-500">
                {product.category.name}
              </Link>
              <span className="mx-2">/</span>
            </li>
          )}
          <li className="text-blue-500">{product.name}</li>
        </ol>
      </nav>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          
          {product.category && (
            <Link href={`/categories/${product.category.slug}`} className="inline-block mb-4 text-sm bg-gray-200 px-3 py-1 rounded-full">
              {product.category.name}
            </Link>
          )}
          
          <div className="text-2xl font-bold text-blue-600 mb-4">
            ${product.price.toFixed(2)}
          </div>
          
          {product.description && (
            <div className="mb-6 text-gray-700">
              <p>{product.description}</p>
            </div>
          )}
          
          <div className="mb-6">
            <span className={`font-medium ${product.inventory_count > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.inventory_count > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
            {product.inventory_count > 0 && (
              <span className="text-sm text-gray-500 ml-2">
                ({product.inventory_count} {product.inventory_count === 1 ? 'item' : 'items'} left)
              </span>
            )}
          </div>
          
          <form action={`/api/cart/add?productId=${product.id}&quantity=1`} method="post">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={product.inventory_count === 0}
                className={`px-8 py-3 rounded-md font-medium text-white ${
                  product.inventory_count > 0
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-gray-400 cursor-not-allowed'
                } transition-colors`}
              >
                Add to Cart
              </button>
              
              <Link
                href="/cart"
                className="px-8 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors text-center"
              >
                View Cart
              </Link>
            </div>
          </form>
        </div>
      </div>
      
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">You might also like</h2>
          <ProductGrid products={relatedProducts} userId={user?.id} />
        </div>
      )}
    </div>
  );
} 