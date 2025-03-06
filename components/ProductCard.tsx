'use client';

import { useCallback } from 'react';
import { Product } from '@/utils/types';
import { addToCart } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
  userId?: string;
}

export default function ProductCard({ product, userId }: ProductCardProps) {
  const router = useRouter();
  
  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!userId) {
      // Redirect to login if user is not logged in
      router.push('/login');
      return;
    }
    
    try {
      await addToCart(userId, product.id, 1);
      router.refresh();
      // Could show a toast notification here
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    }
  }, [product.id, userId, router]);

  const navigateToProduct = useCallback(() => {
    router.push(`/products/${product.slug}`);
  }, [product.slug, router]);
  
  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={navigateToProduct}
    >
      <div className="relative h-48 w-full">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">{product.name}</h3>
        
        {product.category && (
          <div className="text-sm text-gray-500 mb-2">{product.category.name}</div>
        )}
        
        <div className="flex justify-between items-center mt-3">
          <div className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</div>
          
          <button
            onClick={handleAddToCart}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
} 