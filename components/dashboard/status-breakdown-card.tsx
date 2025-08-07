import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatusBreakdownCardProps {
  statusBreakdown: Array<{ status: string; count: number }>;
  totalOrders: number;
  onStatusClick?: (status: string) => void;
}

const StatusBreakdownCard = ({ statusBreakdown, totalOrders, onStatusClick }: StatusBreakdownCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'to deliver and bill':
        return 'bg-red-100 text-red-800';
      case 'to deliver':
        return 'bg-yellow-100 text-yellow-800';
      case 'to bill':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Order Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {statusBreakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span 
                  className={`inline-block px-2 py-1 text-xs rounded-full cursor-pointer hover:opacity-80 transition-opacity font-medium ${getStatusColor(item.status)}`}
                  onClick={() => onStatusClick?.(item.status)}
                >
                  {item.status}
                </span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-sm">{item.count}</div>
                <div className="text-xs text-muted-foreground">
                  {totalOrders > 0 ? Math.round((item.count / totalOrders) * 100) : 0}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusBreakdownCard; 