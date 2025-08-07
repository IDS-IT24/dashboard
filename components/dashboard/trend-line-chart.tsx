import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRef } from 'react';

interface TrendLineChartProps {
  title: string;
  data: Array<{ month: string; revenue: number }>;
  onMonthClick?: (month: string) => void;
  selectedMonth?: string | null;
}

const TrendLineChart = ({ title, data, onMonthClick, selectedMonth }: TrendLineChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  const formatCurrency = (value: number) => {
    return `Rp${value.toLocaleString('id-ID')}`;
  };

  const handleChartClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!chartRef.current || !onMonthClick) return;
    
    const rect = chartRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const chartWidth = rect.width;
    const dataPointWidth = chartWidth / data.length;
    const dataPointIndex = Math.floor(x / dataPointWidth);
    
    if (dataPointIndex >= 0 && dataPointIndex < data.length) {
      onMonthClick(data[dataPointIndex].month);
    }
  };

  return (
    <div className="bg-card rounded-lg border p-4">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div 
        ref={chartRef}
        onClick={handleChartClick}
        style={{ cursor: 'pointer' }}
        className="hover:opacity-95 transition-opacity"
      >
        <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            fontSize={12}
          />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), 'Revenue']}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Line 
            type="monotone"
            dataKey="revenue" 
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendLineChart; 