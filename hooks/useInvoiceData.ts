import { useQuery } from '@tanstack/react-query';
import type { Invoice, InvoiceDashboardStats } from '@/types/invoice';

// Fetch all invoices
const fetchInvoices = async (): Promise<Invoice[]> => {
  const response = await fetch('/api/invoices');
  if (!response.ok) {
    throw new Error('Failed to fetch invoices');
  }
  return response.json();
};

// Fetch invoice dashboard stats
const fetchInvoiceStats = async (): Promise<InvoiceDashboardStats> => {
  const response = await fetch('/api/invoices/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch invoice stats');
  }
  return response.json();
};

export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: fetchInvoices,
  });
};

export const useInvoiceStats = () => {
  return useQuery({
    queryKey: ['invoiceStats'],
    queryFn: fetchInvoiceStats,
  });
};

// Filtered invoice data hooks
export const useFilteredInvoices = (
  invoices: Invoice[] | undefined,
  selectedStatus: string | null,
  selectedCollection?: string | null,
  selectedBranch?: string | null,
  selectedMonth?: string | null,
  yearFilter?: 'all' | '2025'
) => {
  const filteredInvoices = invoices?.filter(invoice => {
    // Filter by status (if selected)
    if (selectedStatus) {
      if (invoice.status !== selectedStatus) return false;
    }
    
    // Filter by collection (if selected)
    if (selectedCollection) {
      if (invoice.collection !== selectedCollection) return false;
    }
    
    // Filter by branch (if selected)
    if (selectedBranch) {
      if (invoice.cost_center !== selectedBranch) return false;
    }
    
    // Filter by month (if selected)
    if (selectedMonth) {
      if (invoice.invoice_date) {
        const invoiceDate = new Date(invoice.invoice_date);
        const invoiceMonth = invoiceDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        if (invoiceMonth !== selectedMonth) return false;
      } else {
        return false;
      }
    }
    
    // Filter by year (if selected)
    if (yearFilter && yearFilter === '2025') {
      if (invoice.invoice_date) {
        const invoiceDate = new Date(invoice.invoice_date);
        const invoiceYear = invoiceDate.getFullYear();
        if (invoiceYear !== 2025) return false;
      } else {
        return false;
      }
    }
    
    return true;
  }) || [];

  return filteredInvoices;
};
