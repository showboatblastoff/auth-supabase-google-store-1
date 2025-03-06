export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  image_url?: string;
  inventory_count: number;
  category_id?: string;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
  // Optional joined data
  category?: Category;
};

export type Order = {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address?: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  billing_address?: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  payment_intent_id?: string;
  payment_status?: 'pending' | 'paid' | 'failed';
  created_at?: string;
  updated_at?: string;
  // Optional joined data
  items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  created_at?: string;
  // Optional joined data
  product?: Product;
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at?: string;
  updated_at?: string;
  // Optional joined data
  product?: Product;
}; 