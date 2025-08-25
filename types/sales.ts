import { ObjectId } from 'mongodb';

export interface SalesOrder {
  _id?: ObjectId;
  order_id: string;
  name: string;
  customer_name: string;
  po_date: string;
  delivery_date: string;
  order_date: string;
  transaction_date?: string;
  status: string;
  base_total: number;
  total_amount: number;
  cost_center?: string;
  collection?: string;
  department?: string;
  items?: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  created_at?: Date;
  updated_at?: Date;
}

export interface SalesDashboardStats {
  totalOrders: number;
  nonCompletedOrders: number;
  totalRevenue: number;
  unearnedRevenue: number;
  branchRevenue: Array<{ name: string; value: number }>;
  statusBreakdown: Array<{ status: string; count: number }>;
  collectionBreakdown: Array<{ name: string; value: number; percentage: number }>;
} 