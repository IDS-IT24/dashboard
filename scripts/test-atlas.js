const { MongoClient } = require('mongodb');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME;

async function testAtlasConnection() {
  if (!MONGODB_URI) {
    console.log('❌ MONGODB_URI not found in .env.local');
    console.log('📝 Please add your MongoDB Atlas connection string to .env.local');
    return;
  }

  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔗 Attempting to connect to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    const db = client.db(DB_NAME);
    const collection = db.collection('erp_so');
    
    const count = await collection.countDocuments();
    console.log(`📊 Found ${count} documents in sales_orders collection`);
    
    if (count > 0) {
      const sampleDoc = await collection.findOne();
      console.log('📄 Sample document found');
    } else {
      console.log('📝 No documents found. Run "npm run seed" to add sample data.');
    }
    
  } catch (error) {
    console.error('❌ Error connecting to MongoDB Atlas:', error.message);
    console.log('\n🔧 Common issues and solutions:');
    console.log('1. Check your connection string format');
    console.log('2. Verify username and password are correct');
    console.log('3. Ensure your IP address is whitelisted in Atlas');
    console.log('4. Check if your cluster is running');
    console.log('5. Verify the database name is correct');
  } finally {
    await client.close();
  }
}

testAtlasConnection(); 