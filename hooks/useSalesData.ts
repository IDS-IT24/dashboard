import { useQuery } from '@tanstack/react-query';
import type { SalesOrder, SalesDashboardStats } from '@/types/sales';

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

export const useFilteredMonthlyRevenue = (salesOrders: SalesOrder[] | undefined, selectedStatus: string | null, selectedCollection?: string | null, selectedBranch?: string | null, selectedMonth?: string | null, yearFilter?: 'all' | '2025') => {
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
    // Filter by collection first (if selected)
    if (selectedCollection) {
      if (order.collection !== selectedCollection) return false;
    }
    
    // Then filter by status (if selected)
    if (selectedStatus) {
      const orderStatus = getStatusDisplayName(order.status);
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
    if (yearFilter && yearFilter === '2025') {
      if (order.transaction_date) {
        const orderDate = new Date(order.transaction_date);
        const orderYear = orderDate.getFullYear();
        if (orderYear !== 2025) return false;
      } else {
        return false; // If no transaction_date, exclude from year filter
      }
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
  
  // Convert to array and sort by date
  const monthlyData = Array.from(monthlyRevenue.entries())
    .map(([key, value]) => {
      const [year, month] = key.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return {
        month: date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        }),
        revenue: value,
        date: date.getTime() // for sorting
      };
    })
    .sort((a, b) => a.date - b.date)
    .map(({ month, revenue }) => ({ month, revenue }));

  return monthlyData;
}; 

export const useFilteredBranchRevenue = (salesOrders: SalesOrder[] | undefined, selectedStatus: string | null, selectedCollection?: string | null, selectedMonth?: string | null, yearFilter?: 'all' | '2025') => {
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
    } else {
      return status;
    }
  };

  const filteredOrders = salesOrders?.filter(order => {
    // Filter by collection first (if selected)
    if (selectedCollection) {
      if (order.collection !== selectedCollection) return false;
    }
    
    // Then filter by status (if selected)
    if (selectedStatus) {
      const orderStatus = getStatusDisplayName(order.status);
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
    if (yearFilter && yearFilter === '2025') {
      if (order.transaction_date) {
        const orderDate = new Date(order.transaction_date);
        const orderYear = orderDate.getFullYear();
        if (orderYear !== 2025) return false;
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

export const useFilteredDashboardStats = (salesOrders: SalesOrder[] | undefined, selectedStatus: string | null, selectedCollection?: string | null, selectedMonth?: string | null, yearFilter?: 'all' | '2025') => {
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
    } else {
      return status;
    }
  };

  const filteredOrders = salesOrders?.filter(order => {
    // Filter by collection first (if selected)
    if (selectedCollection) {
      if (order.collection !== selectedCollection) return false;
    }
    
    // Then filter by status (if selected)
    if (selectedStatus) {
      const orderStatus = getStatusDisplayName(order.status);
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
    if (yearFilter && yearFilter === '2025') {
      if (order.transaction_date) {
        const orderDate = new Date(order.transaction_date);
        const orderYear = orderDate.getFullYear();
        if (orderYear !== 2025) return false;
      } else {
        return false; // If no transaction_date, exclude from year filter
      }
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

  return {
    totalOrders,
    nonCompletedOrders: nonCompletedOrdersCount,
    totalRevenue,
    unearnedRevenue,
  };
}; 

export const useFilteredDataByBranch = (salesOrders: SalesOrder[] | undefined, selectedBranch: string | null, selectedStatus: string | null, selectedCollection?: string | null, selectedMonth?: string | null, yearFilter?: 'all' | '2025') => {
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
      const orderStatus = getStatusDisplayName(order.status);
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
    if (yearFilter && yearFilter === '2025') {
      if (order.transaction_date) {
        const orderDate = new Date(order.transaction_date);
        const orderYear = orderDate.getFullYear();
        if (orderYear !== 2025) return false;
      } else {
        return false; // If no transaction_date, exclude from year filter
      }
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

export const useFilteredStatusBreakdown = (salesOrders: SalesOrder[] | undefined, selectedStatus: string | null, selectedCollection?: string | null, selectedBranch?: string | null, selectedMonth?: string | null, yearFilter?: 'all' | '2025') => {
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
    if (yearFilter && yearFilter === '2025') {
      if (order.transaction_date) {
        const orderDate = new Date(order.transaction_date);
        const orderYear = orderDate.getFullYear();
        if (orderYear !== 2025) return false;
      } else {
        return false; // If no transaction_date, exclude from year filter
      }
    }
    
    return true;
  }) || [];

  // Calculate status breakdown for filtered orders
  const statusMap = new Map<string, number>();
  statusMap.set('To Deliver and Bill', 0);
  statusMap.set('To Deliver', 0);
  statusMap.set('To Bill', 0);
  statusMap.set('Completed', 0);
  
  filteredOrders.forEach(order => {
    const status = (order.status || '').toLowerCase();
    if (status.includes('deliver') && status.includes('bill')) {
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

  return { statusBreakdown, totalOrders };
};

export const useFilteredCollectionBreakdown = (salesOrders: SalesOrder[] | undefined, selectedStatus: string | null, selectedCollection?: string | null, selectedBranch?: string | null, selectedMonth?: string | null, yearFilter?: 'all' | '2025') => {
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
    
    // Filter by status (if selected)
    if (selectedStatus) {
      const orderStatus = getStatusDisplayName(order.status);
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
    if (yearFilter && yearFilter === '2025') {
      if (order.transaction_date) {
        const orderDate = new Date(order.transaction_date);
        const orderYear = orderDate.getFullYear();
        if (orderYear !== 2025) return false;
      } else {
        return false; // If no transaction_date, exclude from year filter
      }
    }
    
    return true;
  }) || [];

  // Calculate collection breakdown for filtered orders
  const industryOrders = filteredOrders.filter(order => order.collection === 'Industry');
  const otomotiveOrders = filteredOrders.filter(order => order.collection === 'Otomotive');
  
  const totalOrders = filteredOrders.length;
  const collectionBreakdown = [
    { 
      name: 'Industry', 
      value: industryOrders.length, 
      percentage: totalOrders > 0 ? Math.round((industryOrders.length / totalOrders) * 100) : 0 
    },
    { 
      name: 'Otomotive', 
      value: otomotiveOrders.length, 
      percentage: totalOrders > 0 ? Math.round((otomotiveOrders.length / totalOrders) * 100) : 0 
    }
  ];

  return collectionBreakdown;
}; 