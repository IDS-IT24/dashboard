'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ExternalLink } from 'lucide-react';

interface SalesOrder {
  order_id: string;
  name: string;
  customer_name: string;
  po_date: string;
  delivery_date: string;
  base_total: number;
  order_date: string;
  status: string;
  cost_center?: string;
  collection?: string;
  transaction_date?: string;
  department?: string;
}

interface SalesOrdersTableProps {
  orders: SalesOrder[];
  isLoading: boolean;
  selectedStatus: string | null;
  selectedCollection: string | null;
  selectedBranch: string | null;
  selectedMonth?: string | null;
  selectedDepartment?: string | null;
  selectedCostCenter?: string | null;
  yearFilter?: '2024' | '2025';
  onStatusClick: (status: string) => void;
  onClearAllFilters?: () => void;
}

const SalesOrdersTable = ({ orders, isLoading, selectedStatus, selectedCollection, selectedBranch, selectedMonth, selectedDepartment, selectedCostCenter, yearFilter, onStatusClick, onClearAllFilters }: SalesOrdersTableProps) => {

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'overdue') {
      return 'bg-red-100 text-red-800';
    } else if (statusLower.includes('complete') || statusLower.includes('delivered') || statusLower.includes('finished')) {
      return 'bg-green-100 text-green-800';
    } else if (statusLower.includes('deliver') && statusLower.includes('bill')) {
      return 'bg-orange-100 text-orange-800';
    } else if (statusLower.includes('deliver')) {
      return 'bg-yellow-100 text-yellow-800';
    } else if (statusLower.includes('bill')) {
      return 'bg-blue-100 text-blue-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

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

  const getStatusDisplayNameWithOverdue = (order: SalesOrder) => {
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
    
    return getStatusDisplayName(order.status);
  };

  const getBranchName = (costCenter: string) => {
    const branchNames: { [key: string]: string } = {
      'JKT': 'JAKARTA', 'SBY': 'SURABAYA', 'SMG': 'SEMARANG', 'MKS': 'MAKASSAR',
      'MDN': 'MEDAN', 'JBR': 'JEMBER', 'BDL': 'LAMPUNG'
    };
    
    // Special handling for SURABAYA-PG branch
    if (costCenter === 'SBY-PG') {
      return 'SURABAYA-PG';
    }
    
    const branchCode = costCenter.substring(0, 3).toUpperCase();
    return branchNames[branchCode] || branchCode;
  };

  const getDepartmentCategory = (department: string): string => {
    if (!department) return 'OTHER';
    
    const departmentMapping: { [key: string]: string } = {
      'CONDITION BASE MONITORING - IDS': 'OTHER',
      'ELECTRICAL PANEL - IDS': 'FABRIKASI',
      'FABRIKASI INDUSTRIAL BLOWER - IDS': 'FABRIKASI',
      'FABRIKASI INDUSTRIAL COMPRESSOR - IDS': 'FABRIKASI',
      'FABRIKASI INDUSTRIAL VACUUM - IDS': 'FABRIKASI',
      'GENERAL FABRIKASI INDUSTRIAL - IDS': 'FABRIKASI',
      'GENERAL INDUSTRI - IDS': 'OTHER',
      'INDUSTRIAL REPAIR - IDS': 'OTHER',
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

  // Filter and sort orders
  const filteredAndSortedOrders = orders
    .filter(order => {
             // Filter by status
       if (selectedStatus) {
         const orderStatus = getStatusDisplayNameWithOverdue(order);
         if (orderStatus !== selectedStatus) return false;
       }
      
      // Filter by collection
      if (selectedCollection) {
        if (order.collection !== selectedCollection) return false;
      }
      
      // Filter by branch
      if (selectedBranch) {
        const orderBranch = getBranchName(order.cost_center || '');
        if (orderBranch !== selectedBranch) return false;
      }
      
             // Filter by month
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
       
             // Filter by year
      if (yearFilter) {
        if (order.transaction_date) {
          const orderDate = new Date(order.transaction_date);
          const orderYear = orderDate.getFullYear();
          if (orderYear !== parseInt(yearFilter)) return false;
        } else {
          return false; // If no transaction_date, exclude from year filter
        }
      }
       
       // Filter by department
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
       
       // Filter by cost center (department category)
       if (selectedCostCenter) {
         const orderDepartmentCategory = getDepartmentCategory(order.department || '');
         if (orderDepartmentCategory !== selectedCostCenter) return false;
       }
       
       return true;
    })
         .sort((a, b) => {
       // Sort by completion status first (non-completed first), then by date (oldest first)
       const aCompleted = getStatusDisplayNameWithOverdue(a) === 'Completed';
       const bCompleted = getStatusDisplayNameWithOverdue(b) === 'Completed';
       
       if (aCompleted && !bCompleted) return 1;
       if (!aCompleted && bCompleted) return -1;
       
       // If both have same completion status, sort by date (oldest first)
       return new Date(a.order_date).getTime() - new Date(b.order_date).getTime();
     })
    .slice(0, 50); // Limit to 50 orders

  const clearFilter = () => {
    if (onClearAllFilters) {
      onClearAllFilters();
    } else {
      onStatusClick('');
    }
  };

  const handleOrderClick = (orderName: string) => {
    const encodedName = encodeURIComponent(orderName);
    const url = `https://erpintidaya.jasaweb.co/app/sales-order/${encodedName}`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-lg">Loading sales orders...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Sales Orders
                                     {(selectedStatus || selectedCollection || selectedBranch || selectedMonth || selectedDepartment || selectedCostCenter || yearFilter) && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (Filtered by: {[
                  selectedStatus,
                  selectedCollection,
                  selectedBranch,
                  selectedMonth,
                  selectedDepartment,
                  selectedCostCenter,
                  yearFilter
                ].filter(Boolean).join(', ')})
              </span>
            )}
          </CardTitle>
                     {(selectedStatus || selectedCollection || selectedBranch || selectedMonth || selectedDepartment || selectedCostCenter || yearFilter) && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilter}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Clear Filter
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredAndSortedOrders.length > 0 ? (
            filteredAndSortedOrders.map((order, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => handleOrderClick(order.name)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{order.order_id}</p>
                      <p className="text-sm text-muted-foreground">{order.name}</p>
                      <p className="text-xs text-muted-foreground">{order.customer_name}</p>
                      <p className="text-xs text-muted-foreground">
                        PO: {(() => {
                          try {
                            return new Date(order.po_date).toLocaleDateString();
                          } catch {
                            return 'Invalid date';
                          }
                        })()}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="text-right">
                                     <Badge
                     variant="secondary"
                     className={`cursor-pointer ${getStatusColor(getStatusDisplayNameWithOverdue(order))}`}
                     onClick={(e) => {
                       e.stopPropagation();
                       onStatusClick(getStatusDisplayNameWithOverdue(order));
                     }}
                   >
                     {getStatusDisplayNameWithOverdue(order)}
                   </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    Delivery: {(() => {
                      try {
                        return new Date(order.delivery_date).toLocaleDateString();
                      } catch {
                        return 'Invalid date';
                      }
                    })()}
                  </p>
                  <p className="font-medium mt-1">
                    Rp{parseFloat(order.base_total?.toString() || '0').toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              {(() => {
                                 const activeFilters = [
                   selectedStatus && `status "${selectedStatus}"`,
                   selectedCollection && `collection "${selectedCollection}"`,
                   selectedBranch && `branch "${selectedBranch}"`,
                   selectedMonth && `month "${selectedMonth}"`,
                   selectedDepartment && `department "${selectedDepartment}"`,
                   yearFilter && `year "${yearFilter}"`
                 ].filter(Boolean);
                
                if (activeFilters.length > 0) {
                  return `No orders found with ${activeFilters.join(' and ')}`;
                }
                return 'No sales orders found';
              })()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesOrdersTable; 