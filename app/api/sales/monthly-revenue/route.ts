import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'sales_dashboard');
    
    // Fetch from both collections
    const erpSoCollection = db.collection('erp_so');
    const erpSoOtoCollection = db.collection('erp_so_oto');
    
    const [erpSoOrders, erpSoOtoOrders] = await Promise.all([
      erpSoCollection.find({}).toArray(),
      erpSoOtoCollection.find({}).toArray()
    ]);
    
    // Combine both collections
    const allOrders = [...erpSoOrders, ...erpSoOtoOrders];
    
    // Group orders by month using transaction_date
    const monthlyRevenue = new Map<string, number>();
    
    allOrders.forEach(order => {
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
    
    return NextResponse.json(monthlyData);
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monthly revenue data' },
      { status: 500 }
    );
  }
} 