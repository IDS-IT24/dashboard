'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CollectionBreakdown {
  name: string;
  value: number;
  percentage: number;
}

interface InvoiceCollectionBreakdownCardProps {
  collectionBreakdown: CollectionBreakdown[];
  onCollectionClick: (collection: string) => void;
  selectedCollection: string | null;
}

const InvoiceCollectionBreakdownCard = ({ 
  collectionBreakdown, 
  onCollectionClick, 
  selectedCollection 
}: InvoiceCollectionBreakdownCardProps) => {
  const getCollectionColor = (collection: string) => {
    const colors = {
      'Industry': 'bg-blue-100 text-blue-800',
      'Otomotive': 'bg-green-100 text-green-800',
      'Unknown': 'bg-gray-100 text-gray-800'
    };
    return colors[collection as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Invoices by Collection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {collectionBreakdown.map((collection, index) => (
            <div
              key={index}
              className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
              onClick={() => onCollectionClick(collection.name)}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium">{collection.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {collection.value} invoices ({collection.percentage}%)
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className={`cursor-pointer ${getCollectionColor(collection.name)} ${
                  selectedCollection === collection.name ? 'ring-2 ring-primary' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onCollectionClick(collection.name);
                }}
              >
                {collection.percentage}%
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceCollectionBreakdownCard;
