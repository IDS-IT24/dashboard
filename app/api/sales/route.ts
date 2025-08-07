import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'sales_dashboard');
    
    // Fetch from all three collections
    const erpSoCollection = db.collection('erp_so');
    const erpSoOtoCollection = db.collection('erp_so_oto');
    const erpSoPgCollection = db.collection('erp_so_pg');
    
    const [erpSoOrders, erpSoOtoOrders, erpSoPgOrders] = await Promise.all([
      erpSoCollection.find({}).toArray(),
      erpSoOtoCollection.find({}).toArray(),
      erpSoPgCollection.find({}).toArray()
    ]);
    
    // Add collection identifier to each order
    const erpSoOrdersWithSource = erpSoOrders.map(order => ({ ...order, collection: 'Industry' }));
    const erpSoOtoOrdersWithSource = erpSoOtoOrders.map(order => ({ ...order, collection: 'Otomotive' }));
    const erpSoPgOrdersWithSource = erpSoPgOrders.map(order => ({ 
      ...order, 
      collection: 'Industry',
      cost_center: 'SBY-PG' // Override cost_center to create SURABAYA-PG branch
    }));
    
    // Combine all collections
    const salesOrders = [...erpSoOrdersWithSource, ...erpSoOtoOrdersWithSource, ...erpSoPgOrdersWithSource];
    
    return NextResponse.json(salesOrders);
  } catch (error) {
    console.error('Error fetching sales orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'sales_dashboard');
    
    const collection = db.collection('sales_orders');
    const result = await collection.insertOne({
      ...body,
      created_at: new Date(),
      updated_at: new Date(),
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating sales order:', error);
    return NextResponse.json(
      { error: 'Failed to create sales order' },
      { status: 500 }
    );
  }
} 