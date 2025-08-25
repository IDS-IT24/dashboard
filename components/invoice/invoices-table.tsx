'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Invoice } from '@/types/invoice';

interface InvoicesTableProps {
  invoices: Invoice[];
}

const InvoicesTable = ({ invoices }: InvoicesTableProps) => {
  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('paid') || statusLower.includes('complete')) {
      return 'bg-green-100 text-green-800';
    } else if (statusLower.includes('pending') || statusLower.includes('unpaid')) {
      return 'bg-yellow-100 text-yellow-800';
    } else if (statusLower.includes('overdue') || statusLower.includes('late')) {
      return 'bg-red-100 text-red-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Invoice List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-medium">Invoice ID</th>
                <th className="text-left py-3 px-2 font-medium">Customer</th>
                <th className="text-left py-3 px-2 font-medium">Date</th>
                <th className="text-left py-3 px-2 font-medium">Due Date</th>
                <th className="text-left py-3 px-2 font-medium">Status</th>
                <th className="text-right py-3 px-2 font-medium">Total Amount</th>
                <th className="text-right py-3 px-2 font-medium">Paid Amount</th>
                <th className="text-right py-3 px-2 font-medium">Outstanding</th>
                <th className="text-left py-3 px-2 font-medium">Collection</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-muted-foreground">
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((invoice, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-2 font-medium">{invoice.invoice_id || '-'}</td>
                    <td className="py-3 px-2">{invoice.customer_name || '-'}</td>
                    <td className="py-3 px-2">{formatDate(invoice.invoice_date)}</td>
                    <td className="py-3 px-2">{formatDate(invoice.due_date)}</td>
                    <td className="py-3 px-2">
                      <Badge className={getStatusColor(invoice.status || '')}>
                        {invoice.status || 'Unknown'}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-right font-medium">
                      {formatCurrency(invoice.total_amount)}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {formatCurrency(invoice.paid_amount)}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {formatCurrency((invoice.total_amount || 0) - (invoice.paid_amount || 0))}
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant="outline">
                        {invoice.collection || 'Unknown'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoicesTable;
