'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DepartmentBreakdown {
  name: string;
  value: number;
  children?: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  percentage?: number;
}

interface DepartmentBreakdownCardProps {
  departmentBreakdown: DepartmentBreakdown[];
  onDepartmentClick: (department: string) => void;
  selectedDepartment: string | null;
}

const DepartmentBreakdownCard = ({ 
  departmentBreakdown,
  onDepartmentClick, 
  selectedDepartment 
}: DepartmentBreakdownCardProps) => {
  const getDepartmentColor = (category: string) => {
    switch (category) {
      case 'UNIT':
        return 'bg-blue-100 text-blue-800';
      case 'SPARE PART':
        return 'bg-green-100 text-green-800';
      case 'FABRIKASI':
        return 'bg-purple-100 text-purple-800';
      case 'SERVICE':
        return 'bg-orange-100 text-orange-800';
      case 'OTHER':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Flatten all department categories from all departments
  const allDepartments = departmentBreakdown.flatMap(department => 
    department.children || []
  );

  // Group department categories and sum their values
  const departmentTotals = allDepartments.reduce((acc, department) => {
    const category = department.name;
    if (!acc[category]) {
      acc[category] = { name: category, value: 0 };
    }
    acc[category].value += department.value;
    return acc;
  }, {} as { [key: string]: { name: string; value: number } });

  // Convert to array and sort by custom order: Unit, Sparepart, Service, Fabrikasi, Other
  const customOrder = ['UNIT', 'SPARE PART', 'SERVICE', 'FABRIKASI', 'OTHER'];
  const departmentData = Object.values(departmentTotals).sort((a, b) => {
    const aIndex = customOrder.indexOf(a.name);
    const bIndex = customOrder.indexOf(b.name);
    return aIndex - bIndex;
  });

  // Calculate total revenue for percentage calculation
  const totalRevenue = departmentData.reduce((sum, department) => sum + department.value, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold mb-4">Business Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {departmentData.map((department, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span 
                  className={`inline-block px-2 py-1 text-xs rounded-full cursor-pointer hover:opacity-80 transition-opacity font-medium ${
                    selectedDepartment === department.name 
                      ? 'ring-2 ring-offset-2 ring-blue-500' 
                      : ''
                  } ${getDepartmentColor(department.name)}`}
                  onClick={() => onDepartmentClick(department.name)}
                >
                  {department.name}
                </span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-sm">
                  Rp{department.value.toLocaleString('id-ID')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {totalRevenue > 0 ? Math.round((department.value / totalRevenue) * 100) : 0}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DepartmentBreakdownCard;
