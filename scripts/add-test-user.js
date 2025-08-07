const { MongoClient } = require('mongodb');
require('dotenv').config();

async function addTestUser() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'sales_dashboard';

  if (!uri) {
    console.error('MONGODB_URI environment variable is required');
    process.exit(1);
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    const collection = db.collection('user_dashboard');

    // Check if test user already exists
    const existingUser = await collection.findOne({ email: 'admin@example.com' });
    
    if (existingUser) {
      console.log('Test user already exists');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      console.log('Username: Admin User');
    } else {
      // Add test user
      const testUser = {
        user_name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123'
      };

      await collection.insertOne(testUser);
      console.log('Test user added successfully!');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      console.log('Username: Admin User');
    }

    await client.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addTestUser(); 