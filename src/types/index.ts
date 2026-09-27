export type BusinessMode = 'full' | 'debt_only';

export type PaymentMethod = 'cash' | 'transfer' | 'pos' | 'other';

export type PaymentStatus = 'paid' | 'part_paid' | 'unpaid';

export type SpendType = 'stock' | 'running_cost';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  created_at: string;
  updated_at?: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  business_type: string;
  currency: string; // Defaults to 'NGN' (₦)
  mode: BusinessMode;
  created_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone?: string;
  notes?: string;
  created_at: string;
  total_purchases?: number;
  total_paid?: number;
  outstanding_balance?: number;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id?: string;
  product_name_snapshot: string;
  quantity: number;
  unit_price: number;
  cost_price_snapshot?: number;
  total: number;
}

export interface Sale {
  id: string;
  business_id: string;
  customer_id?: string;
  customer_name?: string;
  total_amount: number;
  amount_paid: number;
  status: PaymentStatus;
  date: string;
  note?: string;
  items?: SaleItem[];
  created_at: string;
}

export interface Payment {
  id: string;
  business_id: string;
  customer_id: string;
  customer_name?: string;
  sale_id?: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  note?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  business_id: string;
  category: string;
  spend_type: SpendType;
  amount: number;
  method: PaymentMethod;
  date: string;
  note?: string;
  created_at: string;
}

export interface DailySummaryData {
  sales: number;
  collected: number;
  new_credit: number;
  expenses: number;
  net_movement: number; // collected - expenses
  customers_owing_count: number;
}
