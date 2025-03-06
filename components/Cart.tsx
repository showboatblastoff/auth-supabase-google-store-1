'use client';

import { useMemo } from 'react';
import { CartItem as CartItemType } from '@/utils/types';
import CartItem from './CartItem';
import Link from 'next/link';

interface CartProps {
  items: CartItemType[];
}

export default function Cart({ items }: CartProps) {
  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);
  
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      if (item.product) {
        return sum + (item.product.price * item.quantity);
      }
      return sum;
    }, 0);
  }, [items]);
  
  if (!items.length) {
    return (
      <div className="py-10 text-center">
        <h2 className="text-xl font-medium mb-4">Your Cart</h2>
        <p className="text-gray-500 mb-6">Your cart is empty.</p>
        <Link href="/products" className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <h2 className="text-2xl font-semibold mb-6">Your Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})</h2>
      
      <div className="mb-6">
        {items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between text-lg font-semibold mb-6">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Link
            href="/products"
            className="inline-block text-center py-3 px-6 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
          
          <Link
            href="/checkout"
            className="inline-block text-center bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-md font-medium transition-colors"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
} 