export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_phone?: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items: OrderItem[];
  shipping_address: {
    city: string;
    address: string;
    note?: string;
  };
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
} 