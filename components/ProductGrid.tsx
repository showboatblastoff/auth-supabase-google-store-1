'use client';

import { Product } from '@/utils/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  userId?: string;
}

export default function ProductGrid({ products, userId }: ProductGridProps) {
  if (!products.length) {
    return (
      <div className="py-10 text-center">
        <p className="text-gray-500">No products found.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} userId={userId} />
      ))}
    </div>
  );
} 