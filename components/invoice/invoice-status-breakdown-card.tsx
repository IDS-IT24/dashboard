'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StatusBreakdown {
  status: string;
  count: number;
  amount: number;
}

interface InvoiceStatusBreakdownCardProps {
  statusBreakdown: StatusBreakdown[];
  onStatusClick: (status: string) => void;
  selectedStatus: string | null;
}

const InvoiceStatusBreakdownCard = ({ 
  statusBreakdown, 
  onStatusClick, 
  selectedStatus 
}: InvoiceStatusBreakdownCardProps) => {
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Invoice Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {statusBreakdown.map((status, index) => (
            <div
              key={index}
              className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
              onClick={() => onStatusClick(status.status)}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium">{status.status}</p>
                  <p className="text-xs text-muted-foreground">
                    {status.count} invoices • {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(status.amount)}
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className={`cursor-pointer ${getStatusColor(status.status)} ${
                  selectedStatus === status.status ? 'ring-2 ring-primary' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusClick(status.status);
                }}
              >
                {status.count}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceStatusBreakdownCard;
