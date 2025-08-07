import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CollectionBreakdownCardProps {
  collectionBreakdown: Array<{ name: string; value: number; percentage: number }>;
  onCollectionClick?: (collectionName: string) => void;
  selectedCollection?: string | null;
}

const CollectionBreakdownCard = ({ collectionBreakdown, onCollectionClick, selectedCollection }: CollectionBreakdownCardProps) => {
  const COLORS = ['#0088FE', '#00C49F'];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Customer Group</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          {/* Pie Chart */}
          <div className="h-24 w-24 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={collectionBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={15}
                  outerRadius={40}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {collectionBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value} orders`, name]}
                  labelFormatter={(label) => `${label}: ${collectionBreakdown.find(item => item.name === label)?.percentage}%`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Collection Info */}
          <div className="flex-1 space-y-2">
            {collectionBreakdown.map((item, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                  selectedCollection === item.name 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => onCollectionClick?.(item.name)}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{item.value}</div>
                  <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CollectionBreakdownCard; 