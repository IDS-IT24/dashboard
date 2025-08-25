'use client';

import { CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInvoices, useInvoiceStats, useFilteredInvoices } from '@/hooks/useInvoiceData';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

const InvoiceDashboard = () => {
  const queryClient = useQueryClient();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  
  const { data: invoiceStats, isLoading: statsLoading, error: statsError } = useInvoiceStats();
  const { data: invoices, isLoading: invoicesLoading } = useInvoices();
  const filteredInvoices = useFilteredInvoices(invoices, null, null, null, null, 'all');

  const handleRefresh = () => {
    setSelectedDepartment(null);
    queryClient.invalidateQueries({ queryKey: ['invoiceStats'] });
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
  };

  const handleDepartmentClick = (department: string) => {
    setSelectedDepartment(selectedDepartment === department ? null : department);
  };

  if (statsLoading || invoicesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading invoice data...</div>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Error loading invoice data</div>
        </div>
      </div>
    );
  }

  const paidInvoices = filteredInvoices.filter(inv => 
    inv.status?.toLowerCase().includes('paid') || 
    inv.status?.toLowerCase().includes('complete')
  ).length;

  const outstandingAmount = filteredInvoices.reduce((sum, inv) => 
    sum + ((inv.total_amount || 0) - (inv.paid_amount || 0)), 0
  );

  const totalAmount = filteredInvoices.reduce((sum, inv) => 
    sum + (inv.total_amount || 0), 0
  );

  // Department breakdown
  const departmentMap = new Map<string, number>();
  filteredInvoices.forEach(invoice => {
    const dept = invoice.department || 'Unknown';
    departmentMap.set(dept, (departmentMap.get(dept) || 0) + 1);
  });

  const departmentBreakdown = Array.from(departmentMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tagihan</h1>
              <p className="text-gray-600">Invoice Management System</p>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              Refresh Data
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Paid Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{paidInvoices}</div>
              <p className="text-sm text-gray-600 mt-1">Successfully processed</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Outstanding Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(outstandingAmount)}
              </div>
              <p className="text-sm text-gray-600 mt-1">Pending collection</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-blue-600" />
                Total Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{filteredInvoices.length}</div>
              <p className="text-sm text-gray-600 mt-1">All invoices</p>
            </CardContent>
          </Card>
        </div>

        {/* Department Breakdown */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Department Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departmentBreakdown.map((dept, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleDepartmentClick(dept.name)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{dept.name}</p>
                      <p className="text-sm text-gray-600">{dept.count} invoices</p>
                    </div>
                  </div>
                  <Badge 
                    variant={selectedDepartment === dept.name ? "default" : "secondary"}
                    className="cursor-pointer"
                  >
                    {Math.round((dept.count / filteredInvoices.length) * 100)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="bg-white shadow-lg border-0 mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Invoice ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.slice(0, 10).map((invoice, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{invoice.invoice_id || '-'}</td>
                      <td className="py-3 px-4">{invoice.customer_name || '-'}</td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={
                            invoice.status?.toLowerCase().includes('paid') ? "default" : 
                            invoice.status?.toLowerCase().includes('pending') ? "secondary" : "destructive"
                          }
                        >
                          {invoice.status || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(invoice.total_amount || 0)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{invoice.department || 'Unknown'}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceDashboard;
