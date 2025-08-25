import { ObjectId } from 'mongodb';

export interface Invoice {
  _id?: ObjectId;
  invoice_id?: string;
  order_id?: string;
  customer_name?: string;
  invoice_date?: string;
  due_date?: string;
  status?: string;
  total_amount?: number;
  paid_amount?: number;
  outstanding_amount?: number;
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

export interface InvoiceDashboardStats {
  totalInvoices: number;
  paidInvoices: number;
  outstandingInvoices: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  statusBreakdown: Array<{ status: string; count: number; amount: number }>;
  collectionBreakdown: Array<{ name: string; value: number; percentage: number }>;
}
