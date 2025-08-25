import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'sales_dashboard');
    
    // Fetch from erp_si collection
    const erpSiCollection = db.collection('erp_si');
    const invoices = await erpSiCollection.find({}).toArray();
    
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'sales_dashboard');
    
    const collection = db.collection('erp_si');
    const result = await collection.insertOne({
      ...body,
      created_at: new Date(),
      updated_at: new Date(),
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
