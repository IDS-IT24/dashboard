'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DepartmentBreakdown {
  name: string;
  value: number;
  percentage: number;
}

interface IndustryDepartmentBreakdownCardProps {
  departmentBreakdown: DepartmentBreakdown[];
  onDepartmentClick: (department: string) => void;
  selectedDepartment: string | null;
}

const IndustryDepartmentBreakdownCard = ({ 
  departmentBreakdown, 
  onDepartmentClick, 
  selectedDepartment 
}: IndustryDepartmentBreakdownCardProps) => {
  const COLORS = [
    '#3B82F6', // blue
    '#10B981', // green
    '#8B5CF6', // purple
    '#F59E0B', // orange
    '#EC4899', // pink
    '#6B7280', // gray
    '#EF4444', // red
    '#EAB308', // yellow
    '#14B8A6'  // teal
  ];

  const getDepartmentColor = (department: string) => {
    const colors = {
      'CONDITION BASE MONITORING': 'bg-blue-100 text-blue-800',
      'ELECTRICAL PANEL': 'bg-green-100 text-green-800',
      'BLOWER': 'bg-purple-100 text-purple-800',
      'COMPRESSOR': 'bg-orange-100 text-orange-800',
      'VACUUM': 'bg-pink-100 text-pink-800',
      'GENERAL INDUSTRI': 'bg-gray-100 text-gray-800',
      'INDUSTRIAL REPAIR': 'bg-red-100 text-red-800',
      'REWINDING': 'bg-yellow-100 text-yellow-800',
      'OTOMOTIF': 'bg-teal-100 text-teal-800'
    };
    return colors[department as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handlePieClick = (data: any) => {
    if (data && data.name) {
      onDepartmentClick(data.name);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">Rp{data.value.toLocaleString('id-ID')}</p>
          <p className="text-sm text-gray-600">{data.percentage}% of total revenue</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6">
          {/* Doughnut Chart */}
          <div className="flex-1 h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  innerRadius={40}
                  outerRadius={88}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={handlePieClick}
                  className="cursor-pointer"
                >
                  {departmentBreakdown.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      className={`transition-all duration-300 ${
                        selectedDepartment && selectedDepartment !== entry.name 
                          ? 'opacity-40' 
                          : 'opacity-100'
                      }`}
                      style={{
                        filter: selectedDepartment && selectedDepartment !== entry.name 
                          ? 'blur(0.5px)' 
                          : 'none'
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Visual indicator on doughnut chart when department is selected */}
            {selectedDepartment && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 rounded-full border-2 border-primary/30 animate-pulse" />
              </div>
            )}
          </div>
          
          {/* Compact Legend on the right */}
          <div className="flex-1 space-y-2">
            {departmentBreakdown.map((entry, index) => {
              const isSelected = selectedDepartment === entry.name;
              const isHighlighted = !selectedDepartment || isSelected;
              
              return (
                <div
                  key={index}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                    isSelected 
                      ? 'bg-primary/10 border border-primary/30 shadow-sm' 
                      : isHighlighted
                      ? 'bg-muted/30 hover:bg-muted/50'
                      : 'bg-muted/10 opacity-50'
                  }`}
                  onClick={() => onDepartmentClick(entry.name)}
                  style={{
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {/* Color indicator */}
                  <div className="relative">
                    <div 
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        isSelected ? 'ring-1 ring-white' : ''
                      }`}
                      style={{ 
                        backgroundColor: COLORS[index % COLORS.length],
                        boxShadow: isSelected ? `0 0 0 1px ${COLORS[index % COLORS.length]}40` : 'none'
                      }}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping opacity-75" 
                           style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    )}
                  </div>
                  
                  {/* Department name and percentage */}
                  <span className={`text-[10px] font-medium transition-colors ${
                    isSelected ? 'text-primary' : 'text-foreground'
                  }`}>
                    {entry.name}
                  </span>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] font-bold transition-all duration-300 ${
                      getDepartmentColor(entry.name)
                    } ${
                      isSelected 
                        ? 'ring-1 ring-primary scale-105' 
                        : ''
                    }`}
                  >
                    {entry.percentage}%
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IndustryDepartmentBreakdownCard; 