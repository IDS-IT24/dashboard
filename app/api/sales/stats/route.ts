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
    
    // Calculate dashboard stats
    const nonCompletedOrders = allOrders.filter(order => 
      order.status?.toLowerCase() !== 'completed'
    );
    
    const totalOrders = allOrders.length;
    const nonCompletedOrdersCount = nonCompletedOrders.length;
    const totalRevenue = allOrders.reduce((sum, order) => 
      sum + (order.base_total || 0), 0
    );
    const unearnedRevenue = nonCompletedOrders.reduce((sum, order) => 
      sum + (order.base_total || 0), 0
    );
    
    // Calculate branch revenue
    const branchMap = new Map<string, number>();
    const branchNames: { [key: string]: string } = {
      'JKT': 'JAKARTA', 'SBY': 'SURABAYA', 'SMG': 'SEMARANG', 'MKS': 'MAKASSAR',
      'MDN': 'MEDAN', 'JBR': 'JEMBER', 'BDL': 'LAMPUNG'
    };
    
    Object.keys(branchNames).forEach(code => branchMap.set(branchNames[code], 0));
    
    allOrders.forEach(order => {
      const branchCode = (order.cost_center || '').substring(0, 3).toUpperCase();
      const branchName = branchNames[branchCode] || branchCode;
      branchMap.set(branchName, (branchMap.get(branchName) || 0) + (order.base_total || 0));
    });
    
    const branchRevenue = Array.from(branchMap.entries()).map(([name, value]) => ({ name, value }));
    
    // Calculate status breakdown
    const statusMap = new Map<string, number>();
    statusMap.set('To Deliver and Bill', 0);
    statusMap.set('To Deliver', 0);
    statusMap.set('To Bill', 0);
    statusMap.set('Completed', 0);
    
    allOrders.forEach(order => {
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
    
    const statusBreakdown = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));
    
    // Calculate collection breakdown
    const collectionBreakdown = [
      { name: 'Industry', value: erpSoOrders.length, percentage: totalOrders > 0 ? Math.round((erpSoOrders.length / totalOrders) * 100) : 0 },
      { name: 'Otomotive', value: erpSoOtoOrders.length, percentage: totalOrders > 0 ? Math.round((erpSoOtoOrders.length / totalOrders) * 100) : 0 }
    ];
    
    const stats = {
      totalOrders,
      nonCompletedOrders: nonCompletedOrdersCount,
      totalRevenue,
      unearnedRevenue,
      branchRevenue,
      statusBreakdown,
      collectionBreakdown,
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error calculating dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to calculate dashboard stats' },
      { status: 500 }
    );
  }
} 