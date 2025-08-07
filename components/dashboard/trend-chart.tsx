import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BranchChartProps {
  title: string;
  data: Array<{ name: string; value: number }>;
  onBranchClick?: (branchName: string) => void;
  selectedBranch?: string | null;
}

const TrendChart = ({ title, data, onBranchClick, selectedBranch }: BranchChartProps) => {
  const formatCurrency = (value: number) => {
    return `Rp${value.toLocaleString('id-ID')}`;
  };

  const handleBarClick = (data: any, index: number) => {
    if (onBranchClick && data && data.name) {
      onBranchClick(data.name);
    }
  };

  return (
    <div className="bg-card rounded-lg border p-4">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            fontSize={12}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            fontSize={12}
          />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), 'Revenue']}
            labelFormatter={(label) => `Branch: ${label}`}
          />
          <Bar 
            dataKey="value" 
            fill={selectedBranch ? "#1e40af" : "#3b82f6"}
            onClick={handleBarClick}
            style={{ cursor: 'pointer' }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart; 