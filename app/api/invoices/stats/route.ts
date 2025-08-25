import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'sales_dashboard');
    
    const erpSiCollection = db.collection('erp_si');
    const invoices = await erpSiCollection.find({}).toArray();
    
    // Calculate stats
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(invoice => 
      invoice.status?.toLowerCase().includes('paid') || 
      invoice.status?.toLowerCase().includes('complete')
    ).length;
    const outstandingInvoices = totalInvoices - paidInvoices;
    
    const totalAmount = invoices.reduce((sum, invoice) => 
      sum + (invoice.total_amount || 0), 0
    );
    const paidAmount = invoices.reduce((sum, invoice) => 
      sum + (invoice.paid_amount || 0), 0
    );
    const outstandingAmount = totalAmount - paidAmount;
    
    // Status breakdown
    const statusMap = new Map<string, { count: number; amount: number }>();
    invoices.forEach(invoice => {
      const status = invoice.status || 'Unknown';
      const current = statusMap.get(status) || { count: 0, amount: 0 };
      statusMap.set(status, {
        count: current.count + 1,
        amount: current.amount + (invoice.total_amount || 0)
      });
    });
    
    const statusBreakdown = Array.from(statusMap.entries()).map(([status, data]) => ({
      status,
      count: data.count,
      amount: data.amount
    }));
    
    // Collection breakdown
    const collectionMap = new Map<string, number>();
    invoices.forEach(invoice => {
      const collection = invoice.collection || 'Unknown';
      collectionMap.set(collection, (collectionMap.get(collection) || 0) + 1);
    });
    
    const collectionBreakdown = Array.from(collectionMap.entries()).map(([name, value]) => ({
      name,
      value,
      percentage: totalInvoices > 0 ? Math.round((value / totalInvoices) * 100) : 0
    }));
    
    return NextResponse.json({
      totalInvoices,
      paidInvoices,
      outstandingInvoices,
      totalAmount,
      paidAmount,
      outstandingAmount,
      statusBreakdown,
      collectionBreakdown
    });
  } catch (error) {
    console.error('Error fetching invoice stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice stats' },
      { status: 500 }
    );
  }
}
