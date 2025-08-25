import { useQuery } from '@tanstack/react-query';
import type { SalesOrder, SalesDashboardStats } from '@/types/sales';

// Consistent status filtering function that handles overdue detection
const getOrderStatusForFiltering = (order: SalesOrder): string => {
  const status = (order.status || '').toLowerCase();
  const deliveryDate = order.delivery_date ? new Date(order.delivery_date) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today's date to start of day
  
  // Check if order is overdue (To Deliver and Bill or To Deliver with delivery date < today)
  if (deliveryDate) {
    deliveryDate.setHours(0, 0, 0, 0); // Normalize delivery date
    if (deliveryDate < today && 
        (status.includes('deliver') && status.includes('bill') || status.includes('deliver'))) {
      return 'Overdue';
    }
  }
  
  // Return normalized status
  if (status.includes('complete') || status.includes('delivered') || status.includes('finished')) {
    return 'Completed';
  } else if (status.includes('deliver') && status.includes('bill')) {
    return 'To Deliver and Bill';
  } else if (status.includes('deliver')) {
    return 'To Deliver';
  } else if (status.includes('bill')) {
    return 'To Bill';
  } else {
    return 'To Deliver and Bill'; // Default fallback
  }
};

// Monthly revenue data type
interface MonthlyRevenue {
  month: string;
  revenue: number;
}

// Fetch all sales orders
const fetchSalesOrders = async (): Promise<SalesOrder[]> => {
  const response = await fetch('/api/sales');
  if (!response.ok) {
    throw new Error('Failed to fetch sales orders');
  }
  return response.json();
};

// Fetch recent sales orders
const fetchRecentSalesOrders = async (limitCount: number = 5): Promise<SalesOrder[]> => {
  const response = await fetch('/api/sales');
  if (!response.ok) {
    throw new Error('Failed to fetch recent sales orders');
  }
  const allOrders = await response.json();
  return allOrders.slice(0, limitCount);
};

// Fetch dashboard stats
const fetchDashboardStats = async (statusFilter?: string): Promise<SalesDashboardStats> => {
  const url = statusFilter 
    ? `/api/sales/stats?status=${encodeURIComponent(statusFilter)}`
    : '/api/sales/stats';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }
  return response.json();
};

export const useSalesOrders = () => {
  return useQuery({
    queryKey: ['salesOrders'],
    queryFn: fetchSalesOrders,
  });
};

export const useRecentSalesOrders = (limitCount: number = 5) => {
  return useQuery({
    queryKey: ['recentSalesOrders', limitCount],
    queryFn: () => fetchRecentSalesOrders(limitCount),
  });
};

export const useSalesDashboardStats = (statusFilter?: string) => {
  return useQuery({
    queryKey: ['salesDashboardStats', statusFilter],
    queryFn: () => fetchDashboardStats(statusFilter),
  });
};

// Fetch monthly revenue data
const fetchMonthlyRevenue = async (): Promise<MonthlyRevenue[]> => {
  const response = await fetch('/api/sales/monthly-revenue');
  if (!response.ok) {
    throw new Error('Failed to fetch monthly revenue data');
  }
  return response.json();
};

export const useMonthlyRevenue = () => {
  return useQuery({
    queryKey: ['monthlyRevenue'],
    queryFn: fetchMonthlyRevenue,
  });
};

export const useFilteredMonthlyRevenue = (salesOrders: SalesOrder[] | undefined, selectedStatus: string | null, selectedCollection?: string | null, selectedBranch?: string | null, selectedMonth?: string | null, yearFilter?: 'all' | '2024' | '2025', selectedDepartment?: string | null, selectedCostCenter?: string | null) => {

  const getBranchName = (costCenter: string) => {
    const branchNames: { [key: string]: string } = {
      'JKT': 'JAKARTA', 'SBY': 'SURABAYA', 'SMG': 'SEMARANG', 'MKS': 'MAKASSAR',
      'MDN': 'MEDAN', 'JBR': 'JEMBER', 'BDL': 'LAMPUNG'
    };
    const branchCode = costCenter.substring(0, 3).toUpperCase();
    return branchNames[branchCode] || branchCode;
  };

  const filteredOrders = salesOrders?.filter(order => {
    // Filter by collection first (if selected)
    if (selectedCollection) {
      if (order.collection !== selectedCollection) return false;
    }
    
    // Then filter by status (if selected)
    if (selectedStatus) {
      const orderStatus = getOrderStatusForFiltering(order);
      if (orderStatus !== selectedStatus) return false;
    }
    
    // Then filter by branch (if selected)
    if (selectedBranch) {
      let orderBranch;
      if (order.cost_center === 'SBY-PG') {
        orderBranch = 'SURABAYA-PG';
      } else {
        orderBranch = getBranchName(order.cost_center || '');
      }
      if (orderBranch !== selectedBranch) return false;
    }
    
    // Then filter by month (if selected)
    if (selectedMonth) {
      if (order.transaction_date) {
        const orderDate = new Date(order.transaction_date);
        const orderMonth = orderDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        if (orderMonth !== selectedMonth) return false;
      } else {
        return false; // If no transaction_date, exclude from month filter
      }
    }
    
    // Filter by year (if selected)
    if (yearFilter && yearFilter !== 'all') {
      if (order.transaction_date) {
        const orderDate = new Date(order.transaction_date);
        const orderYear = orderDate.getFullYear();
        if (orderYear !== parseInt(yearFilter)) return false;
      } else {
        return false; // If no transaction_date, exclude from year filter
      }
    }
    
    // Filter by department (if selected)
    if (selectedDepartment) {
      if (order.department) {
        const departmentMapping: { [key: string]: string } = {
          'CONDITION BASE MONITORING - IDS': 'CONDITION BASE MONITORING',
          'ELECTRICAL PANEL - IDS': 'ELECTRICAL PANEL',
          'FABRIKASI INDUSTRIAL BLOWER - IDS': 'BLOWER',
          'FABRIKASI INDUSTRIAL COMPRESSOR - IDS': 'COMPRESSOR',
          'FABRIKASI INDUSTRIAL VACUUM - IDS': 'VACUUM',
          'GENERAL FABRIKASI INDUSTRIAL - IDS': 'GENERAL INDUSTRI',
          'GENERAL INDUSTRI - IDS': 'GENERAL INDUSTRI',
          'INDUSTRIAL REPAIR - IDS': 'INDUSTRIAL REPAIR',
          'OTOMOTIF BANYUWANGI - IDS': 'OTOMOTIF',
          'OTOMOTIF BONDOWOSO - IDS': 'OTOMOTIF',
          'OTOMOTIF JEMBER - IDS': 'OTOMOTIF',
          'OTOMOTIF LUMAJANG - IDS': 'OTOMOTIF',
          'OTOMOTIF PROBOLINGGO - IDS': 'OTOMOTIF',
          'REWINDING - IDS': 'REWINDING',
          'SERVICE BLOWER - IDS': 'BLOWER',
          'SERVICE COMPRESSOR - IDS': 'COMPRESSOR',
          'SERVICE VACUUM - IDS': 'VACUUM',
          'SPARE PART BLOWER - IDS': 'BLOWER',
          'SPARE PART COMPRESSOR - IDS': 'COMPRESSOR',
          'SPARE PART VACUUM - IDS': 'VACUUM',
          'UNIT BLOWER - IDS': 'BLOWER',
          'UNIT COMPRESSOR - IDS': 'COMPRESSOR',
          'UNIT VACUUM - IDS': 'VACUUM'
        };
        const mappedDepartment = departmentMapping[order.department];
        if (mappedDepartment !== selectedDepartment) return false;
      } else {
        return false; // If no department, exclude from department filter
      }
    }
    
    // Filter by cost center (if selected)
    if (selectedCostCenter) {
      const getCostCenterCategory = (department: string): string => {
        if (!department) return 'OTHER';
        const costCenterMapping: { [key: string]: string } = {
          'CONDITION BASE MONITORING - IDS': 'OTHER',
          'ELECTRICAL PANEL - IDS': 'FABRIKASI',
          'FABRIKASI INDUSTRIAL BLOWER - IDS': 'FABRIKASI',
          'FABRIKASI INDUSTRIAL COMPRESSOR - IDS': 'FABRIKASI',
          'FABRIKASI INDUSTRIAL VACUUM - IDS': 'FABRIKASI',
          'GENERAL FABRIKASI INDUSTRIAL - IDS': 'FABRIKASI',
          'GENERAL INDUSTRI - IDS': 'OTHER',
          'INDUSTRIAL REPAIR - IDS': 'SERVICE',
          'OTOMOTIF BANYUWANGI - IDS': 'SERVICE',
          'OTOMOTIF BONDOWOSO - IDS': 'SERVICE',
          'OTOMOTIF JEMBER - IDS': 'SERVICE',
          'OTOMOTIF LUMAJANG - IDS': 'SERVICE',
          'OTOMOTIF PROBOLINGGO - IDS': 'SERVICE',
          'REWINDING - IDS': 'SERVICE',
          'SERVICE BLOWER - IDS': 'SERVICE',
          'SERVICE COMPRESSOR - IDS': 'SERVICE',
          'SERVICE VACUUM - IDS': 'SERVICE',
          'SPARE PART BLOWER - IDS': 'SPARE PART',
          'SPARE PART COMPRESSOR - IDS': 'SPARE PART',
          'SPARE PART VACUUM - IDS': 'SPARE PART',
          'UNIT BLOWER - IDS': 'UNIT',
          'UNIT COMPRESSOR - IDS': 'UNIT',
          'UNIT VACUUM - IDS': 'UNIT'
        };
        return costCenterMapping[department] || 'OTHER';
      };
      
      const orderCostCenterCategory = getCostCenterCategory(order.department || '');
      if (orderCostCenterCategory !== selectedCostCenter) return false;
    }
    
    return true;
  }) || [];

  // Group filtered orders by month
  const monthlyRevenue = new Map<string, number>();
  
  filteredOrders.forEach(order => {
    if (order.transaction_date) {
      const date = new Date(order.transaction_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyRevenue.has(monthKey)) {
        monthlyRevenue.set(monthKey, 0);
      }
      
      monthlyRevenue.set(monthKey, monthlyRevenue.get(monthKey)! + (order.base_total || 0));
    }
  });
  
  // Create a complete year of months (January to December)
  const completeMonthlyData = [];
  
  // Determine which year to show based on filters
  let targetYear = new Date().getFullYear();
  if (yearFilter && yearFilter !== 'all') {
    targetYear = parseInt(yearFilter);
  }
  
  for (let month = 1; month <= 12; month++) {
    const monthKey = `${targetYear}-${String(month).padStart(2, '0')}`;
    const date = new Date(targetYear, month - 1);
    const monthName = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
    
    const revenue = monthlyRevenue.get(monthKey) || 0;
    
    completeMonthlyData.push({
      month: monthName,
      revenue: revenue,
      date: date.getTime() // for sorting
    });
  }
  
  // Sort by date to ensure proper order
  const sortedMonthlyData = completeMonthlyData
    .sort((a, b) => a.date - b.date)
    .map(({ month, revenue }) => ({ month, revenue }));

  return sortedMonthlyData;
}; 

export const useFilteredBranchRevenue = (salesOrders: SalesOrder[] | undefined, selectedStatus: string | null, selectedCollection?: string | null, selectedMonth?: string | null, yearFilter?: 'all' | '2024' | '2025') => {

  const filteredOrders = salesOrders?.filter(order => {
    // Filter by collection first (if selected)
    if (selectedCollection) {
      if (order.collection !== selectedCollection) return false;
    }
    
    // Then filter by status (if selected)
    if (selectedStatus) {
      const orderStatus = getOrderStatusForFiltering(order);
      if (orderStatus !== selectedStatus) return false;
    }
    
    // Then filter by month (if selected)
    if (selectedMonth) {
      if (order.transaction_date) {
        const orderDate = new Date(order.transaction_date);
        const orderMonth = orderDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        if (orderMonth !== selectedMonth) return false;
      } else {
        return false; // If no transaction_date, exclude from month filter
      }
    }
    
    // Filter by year (if selected)
    if (yearFilter && yearFilter !== 'all') {
      if (order.transaction_date) {
        const orderDate = new Date(order.transaction_date);
        const orderYear = orderDate.getFullYear();
        if (orderYear !== parseInt(yearFilter)) return false;
      } else {
        return false; // If no transaction_date, exclude from year filter
      }
    }
    
    return true;
  }) || [];

  const branchMap = new Map<string, number>();
  const branchNames: { [key: string]: string } = {
    'JKT': 'JAKARTA', 'SBY': 'SURABAYA', 'SMG': 'SEMARANG', 'MKS': 'MAKASSAR',
    'MDN': 'MEDAN', 'JBR': 'JEMBER', 'BDL': 'LAMPUNG'
  };

  Object.keys(branchNames).forEach(code => branchMap.set(branchNames[code], 0));
  // Add SURABAYA-PG branch
  branchMap.set('SURABAYA-PG', 0);

  filteredOrders.forEach(order => {
    let branchName;
    if (order.cost_center === 'SBY-PG') {
      branchName = 'SURABAYA-PG';
    } else {
      const branchCode = (order.cost_center || '').substring(0, 3).toUpperCase();
      branchName = branchNames[branchCode] || branchCode;
    }
    branchMap.set(branchName, (branchMap.get(branchName) || 0) + (order.base_total || 0));
  });

  return Array.from(branchMap.entries()).map(([name, value]) => ({ name, value }));
}; 

export const useFilteredDashboardStats = (salesOrders: SalesOrder[] | undefined, selectedStatus: string | null, selectedCollection?: string | null, selectedMonth?: string | null, yearFilter?: 'all' | '2024' | '2025') => {

  const filteredOrders = salesOrders?.filter(order => {
    // Filter by collection first (if selected)
    if (selectedCollection) {
      if (order.collection !== selectedCollection) return false;
    }
    
    // Then filter by status (if selected)
    if (selectedStatus) {
      const orderStatus = getOrderStatusForFiltering(order);
      if (orderStatus !== selectedStatus) return false;
    }
    
    // Then filter by month (if selected)
    if (selectedMonth) {
      if (order.transaction_date) {
        const orderDate = new Date(order.transaction_date);
        const orderMonth = orderDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        if (orderMonth !== selectedMonth) return false;
      } else {
        return false; // If no transaction_date, exclude from month filter
      }
    }
    
    // Filter by year (if selected)
    if (yearFilter && yearFilter !== 'all') {
      if (order.transaction_date) {
        const orderDate = new Date(order.transaction_date);
        const orderYear = orderDate.getFullYear();
        if (orderYear !== parseInt(yearFilter)) return false;
      } else {
        return false; // If no transaction_date, exclude from year filter
      }
    }
    
    return true;
  }) || [];

  const nonCompletedOrders = filteredOrders.filter(order => {
    const orderStatus = getOrderStatusForFiltering(order);
    return orderStatus !== 'Completed';
  });

  const totalOrders = filteredOrders.length;
  const nonCompletedOrdersCount = nonCompletedOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, order) => 
    sum + (order.base_total || 0), 0
  );
  const unearnedRevenue = nonCompletedOrders.reduce((sum, order) => 
    sum + (order.base_total || 0), 0
  );

  return {
    totalOrders,
    nonCompletedOrders: nonCompletedOrdersCount,
    totalRevenue,
    unearnedRevenue,
  };
}; 

export const useFilteredDataByBranch = (salesOrders: SalesOrder[] | undefined, selectedBranch: string | null, selectedStatus: string | null, selectedCollection?: string | null, selectedMonth?: string | null, yearFilter?: 'all' | '2024' | '2025', selectedDepartment?: string | null, selectedCostCenter?: string | null) => {
  const getStatusDisplayName = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('complete') || statusLower.includes('delivered') || statusLower.includes('finished')) {
      return 'Completed';
    } else if (statusLower.includes('deliver') && statusLower.includes('bill')) {
      return 'To Deliver and Bill';
    } else if (statusLower.includes('deliver')) {
      return 'To Deliver';
    } else if (statusLower.includes('bill')) {
      return 'To Bill';
    } else if (statusLower.includes('overdue')) {
      return 'Overdue';
    } else {
      return status;
    }
  };

  const getBranchName = (costCenter: string) => {
    const branchNames: { [key: string]: string } = {
      'JKT': 'JAKARTA', 'SBY': 'SURABAYA', 'SMG': 'SEMARANG', 'MKS': 'MAKASSAR',
      'MDN': 'MEDAN', 'JBR': 'JEMBER', 'BDL': 'LAMPUNG'
    };
    const branchCode = costCenter.substring(0, 3).toUpperCase();
    return branchNames[branchCode] || branchCode;
  };

  const filteredOrders = salesOrders?.filter(order => {
    // Filter by branch first (if selected)
    if (selectedBranch) {
      let orderBranch;
      if (order.cost_center === 'SBY-PG') {
        orderBranch = 'SURABAYA-PG';
      } else {
        orderBranch = getBranchName(order.cost_center || '');
      }
      if (orderBranch !== selectedBranch) return false;
    }
    
    // Filter by collection (if selected)
    if (selectedCollection) {
      if (order.collection !== selectedCollection) return false;
    }
    
    // Filter by status (if selected)
    if (selectedStatus) {
      const orderStatus = getOrderStatusForFiltering(order);
      if (orderStatus !== selectedStatus) return false;
    }
    
    // Filter by month (if selected)
    if (selectedMonth) {
      if (order.transaction_date) {
        const orderDate = new Date(order.transaction_date);
        const orderMonth = orderDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        if (orderMonth !== selectedMonth) return false;
      } else {
        return false; // If no transaction_date, exclude from month filter
      }
    }
    
    // Filter by year (if selected)
    if (yearFilter && yearFilter !== 'all') {
      if (order.transaction_date) {
        const orderDate = new Date(order.transaction_date);
        const orderYear = orderDate.getFullYear();
        if (orderYear !== parseInt(yearFilter)) return false;
      } else {
        return false; // If no transaction_date, exclude from year filter
      }
    }
    
    // Filter by department (if selected)
    if (selectedDepartment) {
      // Check if order is from Otomotive collection
      if (order.collection === 'Otomotive') {
        // Otomotive orders should only show when OTOMOTIF is selected
        if (selectedDepartment !== 'OTOMOTIF') return false;
      } else if (order.department) {
        // For Industry collection, use the department mapping
        const departmentMapping: { [key: string]: string } = {
          'CONDITION BASE MONITORING - IDS': 'CONDITION BASE MONITORING',
          'ELECTRICAL PANEL - IDS': 'ELECTRICAL PANEL',
          'FABRIKASI INDUSTRIAL BLOWER - IDS': 'BLOWER',
          'FABRIKASI INDUSTRIAL COMPRESSOR - IDS': 'COMPRESSOR',
          'FABRIKASI INDUSTRIAL VACUUM - IDS': 'VACUUM',
          'GENERAL FABRIKASI INDUSTRIAL - IDS': 'GENERAL INDUSTRI',
          'GENERAL INDUSTRI - IDS': 'GENERAL INDUSTRI',
          'INDUSTRIAL REPAIR - IDS': 'INDUSTRIAL REPAIR',
          'REWINDING - IDS': 'REWINDING',
          'SERVICE BLOWER - IDS': 'BLOWER',
          'SERVICE COMPRESSOR - IDS': 'COMPRESSOR',
          'SERVICE VACUUM - IDS': 'VACUUM',
          'SPARE PART BLOWER - IDS': 'BLOWER',
          'SPARE PART COMPRESSOR - IDS': 'COMPRESSOR',
          'SPARE PART VACUUM - IDS': 'VACUUM',
          'UNIT BLOWER - IDS': 'BLOWER',
          'UNIT COMPRESSOR - IDS': 'COMPRESSOR',
          'UNIT VACUUM - IDS': 'VACUUM'
        };
        const mappedDepartment = departmentMapping[order.department];
        if (mappedDepartment !== selectedDepartment) return false;
      } else {
        return false; // If no department, exclude from department filter
      }
    }
    
    // Filter by cost center (if selected)
    if (selectedCostCenter) {
      const getCostCenterCategory = (department: string): string => {
        if (!department) return 'OTHER';
        const costCenterMapping: { [key: string]: string } = {
          'CONDITION BASE MONITORING - IDS': 'OTHER',
          'ELECTRICAL PANEL - IDS': 'FABRIKASI',
          'FABRIKASI INDUSTRIAL BLOWER - IDS': 'FABRIKASI',
          'FABRIKASI INDUSTRIAL COMPRESSOR - IDS': 'FABRIKASI',
          'FABRIKASI INDUSTRIAL VACUUM - IDS': 'FABRIKASI',
          'GENERAL FABRIKASI INDUSTRIAL - IDS': 'FABRIKASI',
          'GENERAL INDUSTRI - IDS': 'OTHER',
          'INDUSTRIAL REPAIR - IDS': 'SERVICE',
          'OTOMOTIF BANYUWANGI - IDS': 'SERVICE',
          'OTOMOTIF BONDOWOSO - IDS': 'SERVICE',
          'OTOMOTIF JEMBER - IDS': 'SERVICE',
          'OTOMOTIF LUMAJANG - IDS': 'SERVICE',
          'OTOMOTIF PROBOLINGGO - IDS': 'SERVICE',
          'REWINDING - IDS': 'SERVICE',
          'SERVICE BLOWER - IDS': 'SERVICE',
          'SERVICE COMPRESSOR - IDS': 'SERVICE',
          'SERVICE VACUUM - IDS': 'SERVICE',
          'SPARE PART BLOWER - IDS': 'SPARE PART',
          'SPARE PART COMPRESSOR - IDS': 'SPARE PART',
          'SPARE PART VACUUM - IDS': 'SPARE PART',
          'UNIT BLOWER - IDS': 'UNIT',
          'UNIT COMPRESSOR - IDS': 'UNIT',
          'UNIT VACUUM - IDS': 'UNIT'
        };
        return costCenterMapping[department] || 'OTHER';
      };
      
      const orderCostCenterCategory = getCostCenterCategory(order.department || '');
      if (orderCostCenterCategory !== selectedCostCenter) return false;
    }
    
    return true;
  }) || [];

  const nonCompletedOrders = filteredOrders.filter(order => {
    const orderStatus = getStatusDisplayName(order.status);
    return orderStatus !== 'Completed';
  });

  const totalOrders = filteredOrders.length;
  const nonCompletedOrdersCount = nonCompletedOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, order) => 
    sum + (order.base_total || 0), 0
  );
  const unearnedRevenue = nonCompletedOrders.reduce((sum, order) => 
    sum + (order.base_total || 0), 0
  );

  // Calculate branch revenue for the filtered data
  const branchMap = new Map<string, number>();
  const branchNames: { [key: string]: string } = {
    'JKT': 'JAKARTA', 'SBY': 'SURABAYA', 'SMG': 'SEMARANG', 'MKS': 'MAKASSAR',
    'MDN': 'MEDAN', 'JBR': 'JEMBER', 'BDL': 'LAMPUNG'
  };

  Object.keys(branchNames).forEach(code => branchMap.set(branchNames[code], 0));
  // Add SURABAYA-PG branch
  branchMap.set('SURABAYA-PG', 0);

  filteredOrders.forEach(order => {
    let branchName;
    if (order.cost_center === 'SBY-PG') {
      branchName = 'SURABAYA-PG';
    } else {
      const branchCode = (order.cost_center || '').substring(0, 3).toUpperCase();
      branchName = branchNames[branchCode] || branchCode;
    }
    branchMap.set(branchName, (branchMap.get(branchName) || 0) + (order.base_total || 0));
  });

  const branchRevenue = Array.from(branchMap.entries()).map(([name, value]) => ({ name, value }));

  return {
    totalOrders,
    nonCompletedOrders: nonCompletedOrdersCount,
    totalRevenue,
    unearnedRevenue,
    branchRevenue,
  };
}; 

export const useFilteredStatusBreakdown = (salesOrders: SalesOrder[] | undefined, selectedStatus: string | null, selectedCollection?: string | null, selectedBranch?: string | null, selectedMonth?: string | null, yearFilter?: 'all' | '2024' | '2025', selectedDepartment?: string | null, selectedCostCenter?: string | null) => {
  const getStatusDisplayName = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('complete') || statusLower.includes('delivered') || statusLower.includes('finished')) {
      return 'Completed';
    } else if (statusLower.includes('deliver') && statusLower.includes('bill')) {
      return 'To Deliver and Bill';
    } else if (statusLower.includes('deliver')) {
      return 'To Deliver';
    } else if (statusLower.includes('bill')) {
      return 'To Bill';
    } else if (statusLower.includes('overdue')) {
      return 'Overdue';
    } else {
      return status;
    }
  };

  const getBranchName = (costCenter: string) => {
    const branchNames: { [key: string]: string } = {
      'JKT': 'JAKARTA', 'SBY': 'SURABAYA', 'SMG': 'SEMARANG', 'MKS': 'MAKASSAR',
      'MDN': 'MEDAN', 'JBR': 'JEMBER', 'BDL': 'LAMPUNG'
    };
    const branchCode = costCenter.substring(0, 3).toUpperCase();
    return branchNames[branchCode] || branchCode;
  };

  const filteredOrders = salesOrders?.filter(order => {
    // Filter by branch (if selected)
    if (selectedBranch) {
      let orderBranch;
      if (order.cost_center === 'SBY-PG') {
        orderBranch = 'SURABAYA-PG';
      } else {
        orderBranch = getBranchName(order.cost_center || '');
      }
      if (orderBranch !== selectedBranch) return false;
    }
    
    // Filter by collection (if selected)
    if (selectedCollection) {
      if (order.collection !== selectedCollection) return false;
    }
    
    // Filter by month (if selected)
    if (selectedMonth) {
      if (order.transaction_date) {
        const orderDate = new Date(order.transaction_date);
        const orderMonth = orderDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        if (orderMonth !== selectedMonth) return false;
      } else {
        return false; // If no transaction_date, exclude from month filter
      }
    }
    
    // Filter by year (if selected)
    if (yearFilter && yearFilter !== 'all') {
      if (order.transaction_date) {
        const orderDate = new Date(order.transaction_date);
        const orderYear = orderDate.getFullYear();
        if (orderYear !== parseInt(yearFilter)) return false;
      } else {
        return false; // If no transaction_date, exclude from year filter
      }
    }
    
    // Filter by department (if selected)
    if (selectedDepartment) {
      // Check if order is from Otomotive collection
      if (order.collection === 'Otomotive') {
        // Otomotive orders should only show when OTOMOTIF is selected
        if (selectedDepartment !== 'OTOMOTIF') return false;
      } else if (order.department) {
        // For Industry collection, use the department mapping
        const departmentMapping: { [key: string]: string } = {
          'CONDITION BASE MONITORING - IDS': 'CONDITION BASE MONITORING',
          'ELECTRICAL PANEL - IDS': 'ELECTRICAL PANEL',
          'FABRIKASI INDUSTRIAL BLOWER - IDS': 'BLOWER',
          'FABRIKASI INDUSTRIAL COMPRESSOR - IDS': 'COMPRESSOR',
          'FABRIKASI INDUSTRIAL VACUUM - IDS': 'VACUUM',
          'GENERAL FABRIKASI INDUSTRIAL - IDS': 'GENERAL INDUSTRI',
          'GENERAL INDUSTRI - IDS': 'GENERAL INDUSTRI',
          'INDUSTRIAL REPAIR - IDS': 'INDUSTRIAL REPAIR',
          'REWINDING - IDS': 'REWINDING',
          'SERVICE BLOWER - IDS': 'BLOWER',
          'SERVICE COMPRESSOR - IDS': 'COMPRESSOR',
          'SERVICE VACUUM - IDS': 'VACUUM',
          'SPARE PART BLOWER - IDS': 'BLOWER',
          'SPARE PART COMPRESSOR - IDS': 'COMPRESSOR',
          'SPARE PART VACUUM - IDS': 'VACUUM',
          'UNIT BLOWER - IDS': 'BLOWER',
          'UNIT COMPRESSOR - IDS': 'COMPRESSOR',
          'UNIT VACUUM - IDS': 'VACUUM'
        };
        const mappedDepartment = departmentMapping[order.department];
        if (mappedDepartment !== selectedDepartment) return false;
      } else {
        return false; // If no department, exclude from department filter
      }
    }
    
    // Filter by cost center (if selected)
    if (selectedCostCenter) {
      const getCostCenterCategory = (department: string): string => {
        if (!department) return 'OTHER';
        const costCenterMapping: { [key: string]: string } = {
          'CONDITION BASE MONITORING - IDS': 'OTHER',
          'ELECTRICAL PANEL - IDS': 'FABRIKASI',
          'FABRIKASI INDUSTRIAL BLOWER - IDS': 'FABRIKASI',
          'FABRIKASI INDUSTRIAL COMPRESSOR - IDS': 'FABRIKASI',
          'FABRIKASI INDUSTRIAL VACUUM - IDS': 'FABRIKASI',
          'GENERAL FABRIKASI INDUSTRIAL - IDS': 'FABRIKASI',
          'GENERAL INDUSTRI - IDS': 'OTHER',
          'INDUSTRIAL REPAIR - IDS': 'SERVICE',
          'OTOMOTIF BANYUWANGI - IDS': 'SERVICE',
          'OTOMOTIF BONDOWOSO - IDS': 'SERVICE',
          'OTOMOTIF JEMBER - IDS': 'SERVICE',
          'OTOMOTIF LUMAJANG - IDS': 'SERVICE',
          'OTOMOTIF PROBOLINGGO - IDS': 'SERVICE',
          'REWINDING - IDS': 'SERVICE',
          'SERVICE BLOWER - IDS': 'SERVICE',
          'SERVICE COMPRESSOR - IDS': 'SERVICE',
          'SERVICE VACUUM - IDS': 'SERVICE',
          'SPARE PART BLOWER - IDS': 'SPARE PART',
          'SPARE PART COMPRESSOR - IDS': 'SPARE PART',
          'SPARE PART VACUUM - IDS': 'SPARE PART',
          'UNIT BLOWER - IDS': 'UNIT',
          'UNIT COMPRESSOR - IDS': 'UNIT',
          'UNIT VACUUM - IDS': 'UNIT'
        };
        return costCenterMapping[department] || 'OTHER';
      };
      
      const orderCostCenterCategory = getCostCenterCategory(order.department || '');
      if (orderCostCenterCategory !== selectedCostCenter) return false;
    }
    
    return true;
  }) || [];

  // Calculate status breakdown for filtered orders
  const statusMap = new Map<string, number>();
  statusMap.set('To Deliver and Bill', 0);
  statusMap.set('To Deliver', 0);
  statusMap.set('To Bill', 0);
  statusMap.set('Completed', 0);
  statusMap.set('Overdue', 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
  
  filteredOrders.forEach(order => {
    const status = (order.status || '').toLowerCase();
    const deliveryDate = order.delivery_date ? new Date(order.delivery_date) : null;
    
    // Check if order is overdue (To Deliver and Bill or To Deliver with delivery date < today)
    const isOverdue = deliveryDate && deliveryDate < today && 
                     (status.includes('deliver') && status.includes('bill') || status.includes('deliver'));
    
    if (isOverdue) {
      statusMap.set('Overdue', (statusMap.get('Overdue') || 0) + 1);
    } else if (status.includes('deliver') && status.includes('bill')) {
      statusMap.set('To Deliver and Bill', (statusMap.get('To Deliver and Bill') || 0) + 1);
    } else if (status.includes('deliver')) {
      statusMap.set('To Deliver', (statusMap.get('To Deliver') || 0) + 1);
    } else if (status.includes('bill')) {
      statusMap.set('To Bill', (statusMap.get('To Bill') || 0) + 1);
    } else if (status.includes('complete') || status.includes('delivered') || status.includes('finished')) {
      statusMap.set('Completed', (statusMap.get('Completed') || 0) + 1);
    } else {
      statusMap.set('To Deliver and Bill', (statusMap.get('To Deliver and Bill') || 0) + 1);
    }
  });
  
  const totalOrders = filteredOrders.length;
  const statusBreakdown = Array.from(statusMap.entries()).map(([status, count]) => ({ 
    status, 
    count,
    percentage: totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0
  }));

  // Sort by priority order: Overdue, To Deliver and Bill, To Deliver, To Bill, Completed
  const sortedStatusBreakdown = statusBreakdown.sort((a, b) => {
    const priorityOrder = {
      'Overdue': 1,
      'To Deliver and Bill': 2,
      'To Deliver': 3,
      'To Bill': 4,
      'Completed': 5
    };
    
    const priorityA = priorityOrder[a.status as keyof typeof priorityOrder] || 999;
    const priorityB = priorityOrder[b.status as keyof typeof priorityOrder] || 999;
    
    return priorityA - priorityB;
  });

  return { statusBreakdown: sortedStatusBreakdown, totalOrders };
};

export const useFilteredIndustryDepartmentBreakdown = (salesOrders: SalesOrder[] | undefined, selectedStatus: string | null, selectedCollection?: string | null, selectedBranch?: string | null, selectedMonth?: string | null, yearFilter?: 'all' | '2024' | '2025', selectedDepartment?: string | null, selectedCostCenter?: string | null) => {

  const getBranchName = (costCenter: string) => {
    const branchNames: { [key: string]: string } = {
      'JKT': 'JAKARTA', 'SBY': 'SURABAYA', 'SMG': 'SEMARANG', 'MKS': 'MAKASSAR',
      'MDN': 'MEDAN', 'JBR': 'JEMBER', 'BDL': 'LAMPUNG'
    };
    const branchCode = costCenter.substring(0, 3).toUpperCase();
    return branchNames[branchCode] || branchCode;
  };

  const filteredOrders = salesOrders?.filter(order => {
    // Filter by branch (if selected)
    if (selectedBranch) {
      let orderBranch;
      if (order.cost_center === 'SBY-PG') {
        orderBranch = 'SURABAYA-PG';
      } else {
        orderBranch = getBranchName(order.cost_center || '');
      }
      if (orderBranch !== selectedBranch) return false;
    }
    
    // Filter by status (if selected)
    if (selectedStatus) {
      const orderStatus = getOrderStatusForFiltering(order);
      if (orderStatus !== selectedStatus) return false;
    }
    
    // Filter by month (if selected)
    if (selectedMonth) {
      if (order.transaction_date) {
        const orderDate = new Date(order.transaction_date);
        const orderMonth = orderDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        if (orderMonth !== selectedMonth) return false;
      } else {
        return false; // If no transaction_date, exclude from month filter
      }
    }
    
    // Filter by year (if selected)
    if (yearFilter && yearFilter !== 'all') {
      if (order.transaction_date) {
        const orderDate = new Date(order.transaction_date);
        const orderYear = orderDate.getFullYear();
        if (orderYear !== parseInt(yearFilter)) return false;
      } else {
        return false; // If no transaction_date, exclude from year filter
      }
    }
    
    // Filter by department (if selected)
    if (selectedDepartment) {
      // Check if order is from Otomotive collection
      if (order.collection === 'Otomotive') {
        // Otomotive orders should only show when OTOMOTIF is selected
        if (selectedDepartment !== 'OTOMOTIF') return false;
      } else if (order.department) {
        // For Industry collection, use the department mapping
        const departmentMapping: { [key: string]: string } = {
          'CONDITION BASE MONITORING - IDS': 'CONDITION BASE MONITORING',
          'ELECTRICAL PANEL - IDS': 'ELECTRICAL PANEL',
          'FABRIKASI INDUSTRIAL BLOWER - IDS': 'BLOWER',
          'FABRIKASI INDUSTRIAL COMPRESSOR - IDS': 'COMPRESSOR',
          'FABRIKASI INDUSTRIAL VACUUM - IDS': 'VACUUM',
          'GENERAL FABRIKASI INDUSTRIAL - IDS': 'GENERAL INDUSTRI',
          'GENERAL INDUSTRI - IDS': 'GENERAL INDUSTRI',
          'INDUSTRIAL REPAIR - IDS': 'INDUSTRIAL REPAIR',
          'REWINDING - IDS': 'REWINDING',
          'SERVICE BLOWER - IDS': 'BLOWER',
          'SERVICE COMPRESSOR - IDS': 'COMPRESSOR',
          'SERVICE VACUUM - IDS': 'VACUUM',
          'SPARE PART BLOWER - IDS': 'BLOWER',
          'SPARE PART COMPRESSOR - IDS': 'COMPRESSOR',
          'SPARE PART VACUUM - IDS': 'VACUUM',
          'UNIT BLOWER - IDS': 'BLOWER',
          'UNIT COMPRESSOR - IDS': 'COMPRESSOR',
          'UNIT VACUUM - IDS': 'VACUUM'
        };
        const mappedDepartment = departmentMapping[order.department];
        if (mappedDepartment !== selectedDepartment) return false;
      } else {
        return false; // If no department, exclude from department filter
      }
    }
    
    // Filter by cost center (if selected)
    if (selectedCostCenter) {
      const getCostCenterCategory = (department: string): string => {
        if (!department) return 'OTHER';
        const costCenterMapping: { [key: string]: string } = {
          'CONDITION BASE MONITORING - IDS': 'OTHER',
          'ELECTRICAL PANEL - IDS': 'FABRIKASI',
          'FABRIKASI INDUSTRIAL BLOWER - IDS': 'FABRIKASI',
          'FABRIKASI INDUSTRIAL COMPRESSOR - IDS': 'FABRIKASI',
          'FABRIKASI INDUSTRIAL VACUUM - IDS': 'FABRIKASI',
          'GENERAL FABRIKASI INDUSTRIAL - IDS': 'FABRIKASI',
          'GENERAL INDUSTRI - IDS': 'OTHER',
          'INDUSTRIAL REPAIR - IDS': 'SERVICE',
          'OTOMOTIF BANYUWANGI - IDS': 'SERVICE',
          'OTOMOTIF BONDOWOSO - IDS': 'SERVICE',
          'OTOMOTIF JEMBER - IDS': 'SERVICE',
          'OTOMOTIF LUMAJANG - IDS': 'SERVICE',
          'OTOMOTIF PROBOLINGGO - IDS': 'SERVICE',
          'REWINDING - IDS': 'SERVICE',
          'SERVICE BLOWER - IDS': 'SERVICE',
          'SERVICE COMPRESSOR - IDS': 'SERVICE',
          'SERVICE VACUUM - IDS': 'SERVICE',
          'SPARE PART BLOWER - IDS': 'SPARE PART',
          'SPARE PART COMPRESSOR - IDS': 'SPARE PART',
          'SPARE PART VACUUM - IDS': 'SPARE PART',
          'UNIT BLOWER - IDS': 'UNIT',
          'UNIT COMPRESSOR - IDS': 'UNIT',
          'UNIT VACUUM - IDS': 'UNIT'
        };
        return costCenterMapping[department] || 'OTHER';
      };
      
      const orderCostCenterCategory = getCostCenterCategory(order.department || '');
      if (orderCostCenterCategory !== selectedCostCenter) return false;
    }
    
    return true;
  }) || [];

  // Department mapping for Industry orders
  const departmentMapping: { [key: string]: string } = {
    'CONDITION BASE MONITORING - IDS': 'CONDITION BASE MONITORING',
    'ELECTRICAL PANEL - IDS': 'ELECTRICAL PANEL',
    'FABRIKASI INDUSTRIAL BLOWER - IDS': 'BLOWER',
    'FABRIKASI INDUSTRIAL COMPRESSOR - IDS': 'COMPRESSOR',
    'FABRIKASI INDUSTRIAL VACUUM - IDS': 'VACUUM',
    'GENERAL FABRIKASI INDUSTRIAL - IDS': 'GENERAL INDUSTRI',
    'GENERAL INDUSTRI - IDS': 'GENERAL INDUSTRI',
    'INDUSTRIAL REPAIR - IDS': 'INDUSTRIAL REPAIR',
    'OTOMOTIF BANYUWANGI - IDS': 'OTOMOTIF',
    'OTOMOTIF BONDOWOSO - IDS': 'OTOMOTIF',
    'OTOMOTIF JEMBER - IDS': 'OTOMOTIF',
    'OTOMOTIF LUMAJANG - IDS': 'OTOMOTIF',
    'OTOMOTIF PROBOLINGGO - IDS': 'OTOMOTIF',
    'REWINDING - IDS': 'REWINDING',
    'SERVICE BLOWER - IDS': 'BLOWER',
    'SERVICE COMPRESSOR - IDS': 'COMPRESSOR',
    'SERVICE VACUUM - IDS': 'VACUUM',
    'SPARE PART BLOWER - IDS': 'BLOWER',
    'SPARE PART COMPRESSOR - IDS': 'COMPRESSOR',
    'SPARE PART VACUUM - IDS': 'VACUUM',
    'UNIT BLOWER - IDS': 'BLOWER',
    'UNIT COMPRESSOR - IDS': 'COMPRESSOR',
    'UNIT VACUUM - IDS': 'VACUUM'
  };

  // Calculate department breakdown for Industry and Otomotive orders
  const industryAndOtomotiveOrders = filteredOrders.filter(order => 
    order.collection === 'Industry' || order.collection === 'Otomotive'
  );
  const departmentMap = new Map<string, number>();
  
  // Initialize all possible departments
  const allDepartments = [
    'CONDITION BASE MONITORING',
    'ELECTRICAL PANEL',
    'BLOWER',
    'COMPRESSOR',
    'VACUUM',
    'GENERAL INDUSTRI',
    'INDUSTRIAL REPAIR',
    'OTOMOTIF',
    'REWINDING'
  ];
  
  allDepartments.forEach(dept => departmentMap.set(dept, 0));
  
  // Calculate revenue by department
  industryAndOtomotiveOrders.forEach(order => {
    const orderRevenue = order.base_total || 0;
    // Check if order is from erp_so_oto collection (Otomotive)
    if (order.collection === 'Otomotive') {
      // Automatically assign to OTOMOTIF department
      departmentMap.set('OTOMOTIF', (departmentMap.get('OTOMOTIF') || 0) + orderRevenue);
    } else if (order.department) {
      // For Industry collection, use the department mapping
      const mappedDepartment = departmentMapping[order.department];
      if (mappedDepartment) {
        departmentMap.set(mappedDepartment, (departmentMap.get(mappedDepartment) || 0) + orderRevenue);
      }
    }
  });
  
  const totalIndustryRevenue = industryAndOtomotiveOrders.reduce((sum, order) => 
    sum + (order.base_total || 0), 0
  );
  const departmentBreakdown = Array.from(departmentMap.entries())
    .map(([name, value]) => ({ 
      name, 
      value,
      percentage: totalIndustryRevenue > 0 ? Math.round((value / totalIndustryRevenue) * 100) : 0 
    }))
    .filter(dept => dept.value > 0) // Only show departments with revenue
    .sort((a, b) => b.value - a.value); // Sort by revenue descending

  return departmentBreakdown;
};

export const useFilteredDepartmentBreakdown = (salesOrders: SalesOrder[] | undefined, selectedStatus: string | null, selectedCollection?: string | null, selectedBranch?: string | null, selectedMonth?: string | null, yearFilter?: 'all' | '2024' | '2025', selectedDepartment?: string | null, selectedCostCenter?: string | null) => {

  const getBranchName = (costCenter: string) => {
    const branchNames: { [key: string]: string } = {
      'JKT': 'JAKARTA', 'SBY': 'SURABAYA', 'SMG': 'SEMARANG', 'MKS': 'MAKASSAR',
      'MDN': 'MEDAN', 'JBR': 'JEMBER', 'BDL': 'LAMPUNG'
    };
    const branchCode = costCenter.substring(0, 3).toUpperCase();
    return branchNames[branchCode] || branchCode;
  };

  const getDepartmentCategory = (department: string): string => {
    if (!department) return 'OTHER';
    
    // Exact mapping based on the provided specifications
    const departmentMapping: { [key: string]: string } = {
      'CONDITION BASE MONITORING - IDS': 'OTHER',
      'ELECTRICAL PANEL - IDS': 'FABRIKASI',
      'FABRIKASI INDUSTRIAL BLOWER - IDS': 'FABRIKASI',
      'FABRIKASI INDUSTRIAL COMPRESSOR - IDS': 'FABRIKASI',
      'FABRIKASI INDUSTRIAL VACUUM - IDS': 'FABRIKASI',
      'GENERAL FABRIKASI INDUSTRIAL - IDS': 'FABRIKASI',
      'GENERAL INDUSTRI - IDS': 'OTHER',
      'INDUSTRIAL REPAIR - IDS': 'SERVICE',
      'OTOMOTIF BANYUWANGI - IDS': 'SERVICE',
      'OTOMOTIF BONDOWOSO - IDS': 'SERVICE',
      'OTOMOTIF JEMBER - IDS': 'SERVICE',
      'OTOMOTIF LUMAJANG - IDS': 'SERVICE',
      'OTOMOTIF PROBOLINGGO - IDS': 'SERVICE',
      'REWINDING - IDS': 'SERVICE',
      'SERVICE BLOWER - IDS': 'SERVICE',
      'SERVICE COMPRESSOR - IDS': 'SERVICE',
      'SERVICE VACUUM - IDS': 'SERVICE',
      'SPARE PART BLOWER - IDS': 'SPARE PART',
      'SPARE PART COMPRESSOR - IDS': 'SPARE PART',
      'SPARE PART VACUUM - IDS': 'SPARE PART',
      'UNIT BLOWER - IDS': 'UNIT',
      'UNIT COMPRESSOR - IDS': 'UNIT',
      'UNIT VACUUM - IDS': 'UNIT'
    };
    
    return departmentMapping[department] || 'OTHER';
  };

  const filteredOrders = salesOrders?.filter(order => {
    // Filter by branch (if selected)
    if (selectedBranch) {
      let orderBranch;
      if (order.cost_center === 'SBY-PG') {
        orderBranch = 'SURABAYA-PG';
      } else {
        orderBranch = getBranchName(order.cost_center || '');
      }
      if (orderBranch !== selectedBranch) return false;
    }
    
    // Filter by status (if selected)
    if (selectedStatus) {
      const orderStatus = getOrderStatusForFiltering(order);
      if (orderStatus !== selectedStatus) return false;
    }
    
    // Filter by month (if selected)
    if (selectedMonth) {
      if (order.transaction_date) {
        const orderDate = new Date(order.transaction_date);
        const orderMonth = orderDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        if (orderMonth !== selectedMonth) return false;
      } else {
        return false; // If no transaction_date, exclude from month filter
      }
    }
    
    // Filter by year (if selected)
    if (yearFilter && yearFilter !== 'all') {
      if (order.transaction_date) {
        const orderDate = new Date(order.transaction_date);
        const orderYear = orderDate.getFullYear();
        if (orderYear !== parseInt(yearFilter)) return false;
      } else {
        return false; // If no transaction_date, exclude from year filter
      }
    }
    
    // Filter by department (if selected)
    if (selectedDepartment) {
      // Check if order is from Otomotive collection
      if (order.collection === 'Otomotive') {
        // Otomotive orders should only show when OTOMOTIF is selected
        if (selectedDepartment !== 'OTOMOTIF') return false;
      } else if (order.department) {
        // For Industry collection, use the department mapping
        const departmentMapping: { [key: string]: string } = {
          'CONDITION BASE MONITORING - IDS': 'CONDITION BASE MONITORING',
          'ELECTRICAL PANEL - IDS': 'ELECTRICAL PANEL',
          'FABRIKASI INDUSTRIAL BLOWER - IDS': 'BLOWER',
          'FABRIKASI INDUSTRIAL COMPRESSOR - IDS': 'COMPRESSOR',
          'FABRIKASI INDUSTRIAL VACUUM - IDS': 'VACUUM',
          'GENERAL FABRIKASI INDUSTRIAL - IDS': 'GENERAL INDUSTRI',
          'GENERAL INDUSTRI - IDS': 'GENERAL INDUSTRI',
          'INDUSTRIAL REPAIR - IDS': 'INDUSTRIAL REPAIR',
          'REWINDING - IDS': 'REWINDING',
          'SERVICE BLOWER - IDS': 'BLOWER',
          'SERVICE COMPRESSOR - IDS': 'COMPRESSOR',
          'SERVICE VACUUM - IDS': 'VACUUM',
          'SPARE PART BLOWER - IDS': 'BLOWER',
          'SPARE PART COMPRESSOR - IDS': 'COMPRESSOR',
          'SPARE PART VACUUM - IDS': 'VACUUM',
          'UNIT BLOWER - IDS': 'BLOWER',
          'UNIT COMPRESSOR - IDS': 'COMPRESSOR',
          'UNIT VACUUM - IDS': 'VACUUM'
        };
        const mappedDepartment = departmentMapping[order.department];
        if (mappedDepartment !== selectedDepartment) return false;
      } else {
        return false; // If no department, exclude from department filter
      }
    }
    
    // Filter by cost center (if selected)
    if (selectedCostCenter) {
      const orderDepartmentCategory = getDepartmentCategory(order.department || '');
      if (orderDepartmentCategory !== selectedCostCenter) return false;
    }
    
    return true;
  }) || [];

  // Department mapping for Industry orders
  const departmentMapping: { [key: string]: string } = {
    'CONDITION BASE MONITORING - IDS': 'CONDITION BASE MONITORING',
    'ELECTRICAL PANEL - IDS': 'ELECTRICAL PANEL',
    'FABRIKASI INDUSTRIAL BLOWER - IDS': 'BLOWER',
    'FABRIKASI INDUSTRIAL COMPRESSOR - IDS': 'COMPRESSOR',
    'FABRIKASI INDUSTRIAL VACUUM - IDS': 'VACUUM',
    'GENERAL FABRIKASI INDUSTRIAL - IDS': 'GENERAL INDUSTRI',
    'GENERAL INDUSTRI - IDS': 'GENERAL INDUSTRI',
    'INDUSTRIAL REPAIR - IDS': 'INDUSTRIAL REPAIR',
    'OTOMOTIF BANYUWANGI - IDS': 'OTOMOTIF',
    'OTOMOTIF BONDOWOSO - IDS': 'OTOMOTIF',
    'OTOMOTIF JEMBER - IDS': 'OTOMOTIF',
    'OTOMOTIF LUMAJANG - IDS': 'OTOMOTIF',
    'OTOMOTIF PROBOLINGGO - IDS': 'OTOMOTIF',
    'REWINDING - IDS': 'REWINDING',
    'SERVICE BLOWER - IDS': 'BLOWER',
    'SERVICE COMPRESSOR - IDS': 'COMPRESSOR',
    'SERVICE VACUUM - IDS': 'VACUUM',
    'SPARE PART BLOWER - IDS': 'BLOWER',
    'SPARE PART COMPRESSOR - IDS': 'COMPRESSOR',
    'SPARE PART VACUUM - IDS': 'VACUUM',
    'UNIT BLOWER - IDS': 'BLOWER',
    'UNIT COMPRESSOR - IDS': 'COMPRESSOR',
    'UNIT VACUUM - IDS': 'VACUUM'
  };

  // Calculate department breakdown for Industry and Otomotive orders
  const industryAndOtomotiveOrders = filteredOrders.filter(order => 
    order.collection === 'Industry' || order.collection === 'Otomotive'
  );

  // Create multi-level structure: Department -> Department Category
  const departmentCategoryMap = new Map<string, Map<string, number>>();
  
  // Initialize all possible departments
  const allDepartments = [
    'CONDITION BASE MONITORING',
    'ELECTRICAL PANEL',
    'BLOWER',
    'COMPRESSOR',
    'VACUUM',
    'GENERAL INDUSTRI',
    'INDUSTRIAL REPAIR',
    'OTOMOTIF',
    'REWINDING'
  ];
  
  // Initialize department categories
  const departmentCategories = ['UNIT', 'SPARE PART', 'FABRIKASI', 'SERVICE', 'OTHER'];
  
  allDepartments.forEach(dept => {
    departmentCategoryMap.set(dept, new Map());
    departmentCategories.forEach(category => {
      departmentCategoryMap.get(dept)!.set(category, 0);
    });
  });
  
  // Calculate revenue by department and department category
  industryAndOtomotiveOrders.forEach(order => {
    const orderRevenue = order.base_total || 0;
    let department: string;
    
    // Check if order is from erp_so_oto collection (Otomotive)
    if (order.collection === 'Otomotive') {
      department = 'OTOMOTIF';
    } else if (order.department) {
      // For Industry collection, use the department mapping
      const mappedDepartment = departmentMapping[order.department];
      if (mappedDepartment) {
        department = mappedDepartment;
      } else {
        department = 'Other';
      }
    } else {
      department = 'Other';
    }
    
    // Get department category from department name (this should match the filtering logic)
    const departmentCategory = getDepartmentCategory(order.department || '');
    
    // Add revenue to the appropriate department and department category
    const deptMap = departmentCategoryMap.get(department);
    if (deptMap) {
      deptMap.set(departmentCategory, (deptMap.get(departmentCategory) || 0) + orderRevenue);
    }
  });
  
  // Convert to treemap data structure
  const treemapData = Array.from(departmentCategoryMap.entries())
    .map(([department, categoryMap]) => {
      const children = Array.from(categoryMap.entries())
        .map(([category, value]) => ({
          name: category,
          value,
          percentage: 0 // Will be calculated below
        }))
        .filter(item => item.value > 0); // Only show categories with revenue
      
      const departmentTotal = children.reduce((sum, item) => sum + item.value, 0);
      
      // Calculate percentages for children
      children.forEach(child => {
        child.percentage = departmentTotal > 0 ? Math.round((child.value / departmentTotal) * 100) : 0;
      });
      
      return {
        name: department,
        value: departmentTotal,
        children: children.sort((a, b) => b.value - a.value) // Sort children by value descending
      };
    })
    .filter(dept => dept.value > 0) // Only show departments with revenue
    .sort((a, b) => b.value - a.value); // Sort departments by value descending

  return treemapData;
}; 