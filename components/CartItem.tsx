'use client';

import { useCallback } from 'react';
import { CartItem as CartItemType } from '@/utils/types';
import { updateCartItemQuantity, removeFromCart } from '@/utils/ecommerce';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const router = useRouter();
  const product = item.product;
  
  const updateQuantity = useCallback(async (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      await updateCartItemQuantity(item.id, newQuantity);
      router.refresh();
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  }, [item.id, router]);
  
  const handleRemove = useCallback(async () => {
    try {
      await removeFromCart(item.id);
      router.refresh();
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  }, [item.id, router]);
  
  if (!product) {
    return null;
  }
  
  return (
    <div className="flex items-center py-4 border-b border-gray-200">
      <div className="relative h-20 w-20 mr-4 flex-shrink-0">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            style={{ objectFit: 'cover' }}
            className="rounded-md"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md">
            <span className="text-xs text-gray-400">No image</span>
          </div>
        )}
      </div>
      
      <div className="flex-grow">
        <h3 className="text-base font-medium text-gray-900">{product.name}</h3>
        <p className="text-sm text-gray-500">
          ${product.price.toFixed(2)} each
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => updateQuantity(item.quantity - 1)}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Decrease quantity"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        
        <span className="text-gray-700 w-8 text-center">{item.quantity}</span>
        
        <button
          onClick={() => updateQuantity(item.quantity + 1)}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Increase quantity"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className="w-20 text-right text-base font-medium text-gray-900">
        ${(product.price * item.quantity).toFixed(2)}
      </div>
      
      <button
        onClick={handleRemove}
        className="ml-4 text-red-500 hover:text-red-700 focus:outline-none"
        aria-label="Remove item"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
} 