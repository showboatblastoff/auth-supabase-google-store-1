// This file is deprecated. Use supabaseClient.ts instead.
// Re-exporting from supabaseClient to maintain backward compatibility
import * as supabaseClient from './supabaseClient';

export const {
  createClient,
  getCategories,
  getCategoryBySlug,
  getProducts,
  getFeaturedProducts,
  getProductsByCategory,
  getProductBySlug,
  getCartItems,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus
} = supabaseClient; 