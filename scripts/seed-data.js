const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'sales_dashboard';

const sampleSalesOrders = [
  {
    order_id: 'SO-2024-001',
    customer_name: 'PT Maju Jaya',
    order_date: new Date('2024-07-10T10:00:00Z'),
    delivery_date: new Date('2024-07-15T10:00:00Z'),
    status: 'Completed',
    total_amount: 25000000,
    cost_center: 'JKT001',
    items: [
      {
        product_name: 'Product A',
        quantity: 2,
        unit_price: 10000000,
        total_price: 20000000
      }
    ],
    created_at: new Date('2024-07-10T10:00:00Z'),
    updated_at: new Date('2024-07-15T10:00:00Z'),
  },
  {
    order_id: 'SO-2024-002',
    customer_name: 'CV Sejahtera',
    order_date: new Date('2024-07-12T11:30:00Z'),
    delivery_date: new Date('2024-07-20T11:30:00Z'),
    status: 'To Deliver and Bill',
    total_amount: 18000000,
    cost_center: 'SBY002',
    items: [
      {
        product_name: 'Product B',
        quantity: 1,
        unit_price: 18000000,
        total_price: 18000000
      }
    ],
    created_at: new Date('2024-07-12T11:30:00Z'),
    updated_at: new Date('2024-07-12T11:30:00Z'),
  },
  {
    order_id: 'SO-2024-003',
    customer_name: 'UD Bersama',
    order_date: new Date('2024-06-01T09:00:00Z'),
    delivery_date: new Date('2024-06-05T09:00:00Z'),
    status: 'To Deliver',
    total_amount: 15000000,
    cost_center: 'SMG003',
    items: [
      {
        product_name: 'Product C',
        quantity: 3,
        unit_price: 5000000,
        total_price: 15000000
      }
    ],
    created_at: new Date('2024-06-01T09:00:00Z'),
    updated_at: new Date('2024-06-01T09:00:00Z'),
  },
  {
    order_id: 'SO-2024-004',
    customer_name: 'PT Sentosa',
    order_date: new Date('2024-07-05T14:00:00Z'),
    delivery_date: new Date('2024-07-10T14:00:00Z'),
    status: 'To Bill',
    total_amount: 22000000,
    cost_center: 'MKS004',
    items: [
      {
        product_name: 'Product D',
        quantity: 1,
        unit_price: 22000000,
        total_price: 22000000
      }
    ],
    created_at: new Date('2024-07-05T14:00:00Z'),
    updated_at: new Date('2024-07-05T14:00:00Z'),
  },
  {
    order_id: 'SO-2024-005',
    customer_name: 'CV Abadi',
    order_date: new Date('2024-07-18T16:00:00Z'),
    delivery_date: new Date('2024-07-25T16:00:00Z'),
    status: 'To Deliver and Bill',
    total_amount: 20000000,
    cost_center: 'MDN005',
    items: [
      {
        product_name: 'Product E',
        quantity: 2,
        unit_price: 10000000,
        total_price: 20000000
      }
    ],
    created_at: new Date('2024-07-18T16:00:00Z'),
    updated_at: new Date('2024-07-18T16:00:00Z'),
  },
  {
    order_id: 'SO-2024-006',
    customer_name: 'PT Makmur',
    order_date: new Date('2024-07-20T08:00:00Z'),
    delivery_date: new Date('2024-07-28T08:00:00Z'),
    status: 'Completed',
    total_amount: 30000000,
    cost_center: 'JBR006',
    items: [
      {
        product_name: 'Product F',
        quantity: 2,
        unit_price: 15000000,
        total_price: 30000000
      }
    ],
    created_at: new Date('2024-07-20T08:00:00Z'),
    updated_at: new Date('2024-07-28T08:00:00Z'),
  },
  {
    order_id: 'SO-2024-007',
    customer_name: 'UD Sukses',
    order_date: new Date('2024-07-22T13:00:00Z'),
    delivery_date: new Date('2024-07-30T13:00:00Z'),
    status: 'To Deliver',
    total_amount: 12000000,
    cost_center: 'BDL007',
    items: [
      {
        product_name: 'Product G',
        quantity: 4,
        unit_price: 3000000,
        total_price: 12000000
      }
    ],
    created_at: new Date('2024-07-22T13:00:00Z'),
    updated_at: new Date('2024-07-22T13:00:00Z'),
  }
];

async function seedData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection('sales_orders');
    
    // Clear existing data
    await collection.deleteMany({});
    console.log('Cleared existing data');
    
    // Insert sample data
    const result = await collection.insertMany(sampleSalesOrders);
    console.log(`Inserted ${result.insertedCount} sales orders`);
    
    // Verify the data
    const count = await collection.countDocuments();
    console.log(`Total documents in collection: ${count}`);
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

seedData(); 