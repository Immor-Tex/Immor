export interface CashFlow {
  id: string;
  product_cost: number;
  shipping_cost: number;
  other_cost: number;
  marketing_cost: number;
  sales: number;
  created_at: string; // ISO string, auto timestamp
} 