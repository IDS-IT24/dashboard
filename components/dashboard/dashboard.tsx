'use client';

import { ShoppingCart, DollarSign, TrendingUp, Package } from 'lucide-react';
import StatsCard from './stats-card';
import TrendChart from './trend-chart';
import TrendLineChart from './trend-line-chart';
import StatusBreakdownCard from './status-breakdown-card';
import IndustryDepartmentBreakdownCard from './industry-department-breakdown-card';
import DepartmentBreakdownCard from './department-breakdown-card';
import SalesOrdersTable from './sales-orders-table';
import RefreshButton from '@/components/ui/refresh-button';

import { useSalesDashboardStats, useSalesOrders, useFilteredBranchRevenue, useFilteredDashboardStats, useFilteredDataByBranch, useFilteredStatusBreakdown, useFilteredIndustryDepartmentBreakdown, useFilteredDepartmentBreakdown, useMonthlyRevenue, useFilteredMonthlyRevenue } from '@/hooks/useSalesData';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedCostCenter, setSelectedCostCenter] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<'2024' | '2025'>('2025');
  const { data: dashboardStats, isLoading: statsLoading, error: statsError } = useSalesDashboardStats();
  const { data: salesOrders, isLoading: ordersLoading } = useSalesOrders();
  const { data: monthlyRevenue, isLoading: monthlyRevenueLoading } = useMonthlyRevenue();
  const filteredData = useFilteredDataByBranch(salesOrders, selectedBranch, selectedStatus, selectedCollection, selectedMonth, yearFilter, selectedDepartment, selectedCostCenter);
  const filteredStatusData = useFilteredStatusBreakdown(salesOrders, selectedStatus, selectedCollection, selectedBranch, selectedMonth, yearFilter, selectedDepartment, selectedCostCenter);
  const filteredIndustryDepartmentData = useFilteredIndustryDepartmentBreakdown(salesOrders, selectedStatus, selectedCollection, selectedBranch, selectedMonth, yearFilter, selectedDepartment, selectedCostCenter);
  const filteredDepartmentData = useFilteredDepartmentBreakdown(salesOrders, selectedStatus, selectedCollection, selectedBranch, selectedMonth, yearFilter, selectedDepartment, selectedCostCenter);
  const filteredMonthlyRevenue = useFilteredMonthlyRevenue(salesOrders, selectedStatus, selectedCollection, selectedBranch, selectedMonth, yearFilter, selectedDepartment, selectedCostCenter);
  const filteredBranchRevenue = useFilteredBranchRevenue(salesOrders, selectedStatus, selectedCollection, selectedMonth, yearFilter);

  const handleRefresh = () => {
    // Clear all filters
    setSelectedStatus(null);
    setSelectedCollection(null);
    setSelectedBranch(null);
    setSelectedMonth(null);
    setSelectedDepartment(null);
    setSelectedCostCenter(null);
    setYearFilter('2025');
    
    // Refresh data
    queryClient.invalidateQueries({ queryKey: ['salesDashboardStats'] });
    queryClient.invalidateQueries({ queryKey: ['salesOrders'] });
  };

  const handleStatusClick = (status: string) => {
    setSelectedStatus(selectedStatus === status ? null : status);
  };

  const handleCollectionClick = (collectionName: string) => {
    setSelectedCollection(selectedCollection === collectionName ? null : collectionName);
  };

  const handleBranchClick = (branchName: string) => {
    setSelectedBranch(selectedBranch === branchName ? null : branchName);
  };

  const handleMonthClick = (month: string) => {
    setSelectedMonth(selectedMonth === month ? null : month);
  };

  const handleDepartmentClick = (department: string) => {
    setSelectedDepartment(selectedDepartment === department ? null : department);
  };

  const handleCostCenterClick = (costCenter: string) => {
    setSelectedCostCenter(selectedCostCenter === costCenter ? null : costCenter);
  };

  const handleDepartmentCategoryClick = (departmentCategory: string) => {
    setSelectedCostCenter(selectedCostCenter === departmentCategory ? null : departmentCategory);
  };

  const handleYearFilterChange = (year: '2024' | '2025') => {
    setYearFilter(year);
  };

  if (statsLoading || ordersLoading || monthlyRevenueLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading sales dashboard...</div>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Error loading sales data. Please check your connection.</div>
        </div>
      </div>
    );
  }

  const statsData = [
    {
      title: 'Total Orders',
      value: filteredData.totalOrders.toString(),
      description: selectedStatus || selectedCollection || selectedBranch || selectedMonth || selectedDepartment || selectedCostCenter ? 'Filtered' : 'All time',
      icon: ShoppingCart,
      trend: { value: 0, isPositive: true }
    },
    {
      title: 'Non-Completed Orders',
      value: filteredData.nonCompletedOrders.toString(),
      description: selectedStatus || selectedCollection || selectedBranch || selectedMonth || selectedDepartment || selectedCostCenter ? 'Filtered' : 'Not completed',
      icon: Package,
      trend: { value: 0, isPositive: true }
    },
    {
      title: 'Total Revenue',
      value: `Rp${filteredData.totalRevenue.toLocaleString('id-ID')}`,
      description: selectedStatus || selectedCollection || selectedBranch || selectedMonth || selectedDepartment || selectedCostCenter ? 'Filtered' : 'All orders',
      icon: DollarSign,
      trend: { value: 0, isPositive: true }
    },
    {
      title: 'Unearned Revenue',
      value: `Rp${filteredData.unearnedRevenue.toLocaleString('id-ID')}`,
      description: selectedStatus || selectedCollection || selectedBranch || selectedMonth || selectedDepartment || selectedCostCenter ? 'Filtered' : 'Non-completed orders',
      icon: TrendingUp,
      trend: { value: 0, isPositive: true }
    }
  ];

  return (
    <div className="p-4 space-y-4">
             {/* Header */}
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-bold">Omzet Dashboard</h1>
           <p className="text-muted-foreground">

           </p>
         </div>
         <div className="flex items-center gap-4">
                                   <div className="flex gap-2">
              <button
                onClick={() => handleYearFilterChange('2024')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  yearFilter === '2024'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                2024
              </button>
              <button
                onClick={() => handleYearFilterChange('2025')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  yearFilter === '2025'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                2025
              </button>
            </div>
           <RefreshButton
             onRefresh={handleRefresh}
             isLoading={statsLoading || ordersLoading || monthlyRevenueLoading}
           />
         </div>
       </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {statsData.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}  
        <div className="lg:col-span-2">
          <StatusBreakdownCard
            statusBreakdown={filteredStatusData.statusBreakdown}
            totalOrders={filteredStatusData.totalOrders}
            onStatusClick={handleStatusClick}
          />
        </div> 
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-8 gap-4">
        {/* Branch Revenue Chart */}
        <div className="lg:col-span-3">
          <TrendChart
            title="Branch Revenue"
            data={filteredData.branchRevenue}
            onBranchClick={handleBranchClick}
            selectedBranch={selectedBranch}
          />
        </div>
        
        {/* Monthly Revenue Trend Chart */}
        <div className="lg:col-span-5">
                     <TrendLineChart
             title="Monthly Revenue Trend"
                           data={filteredMonthlyRevenue}
             onMonthClick={handleMonthClick}
             selectedMonth={selectedMonth}
           />
        </div>
      </div>

      {/* Sales Orders and Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Sales Orders Table - Takes 5 columns */}
        <div className="lg:col-span-5">
          <SalesOrdersTable
             orders={salesOrders || []}
             isLoading={ordersLoading}
             selectedStatus={selectedStatus}
             selectedCollection={selectedCollection}
             selectedBranch={selectedBranch}
             selectedMonth={selectedMonth}
             selectedDepartment={selectedDepartment}
             selectedCostCenter={selectedCostCenter}
             yearFilter={yearFilter}
             onStatusClick={handleStatusClick}
             onClearAllFilters={handleRefresh}
          />
          
        </div>
        <div className="lg:col-span-3">
          <DepartmentBreakdownCard
              departmentBreakdown={filteredDepartmentData}
              onDepartmentClick={handleDepartmentCategoryClick}
              selectedDepartment={selectedCostCenter}
            />
        </div>
        {/* Right Side Cards - Stacked vertically */}
        <div className="space-y-3 lg:col-span-4">
          <IndustryDepartmentBreakdownCard
            departmentBreakdown={filteredIndustryDepartmentData}
            onDepartmentClick={handleDepartmentClick}
            selectedDepartment={selectedDepartment}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 