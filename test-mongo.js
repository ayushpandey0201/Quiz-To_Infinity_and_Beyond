const mongoose = require('mongoose');

// Your MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://ayushpandeyad23_db_user:Qvcb1CIMfInuj7y1@cluster0.bweaa8e.mongodb.net/quiz-app?retryWrites=true&w=majority&appName=Cluster0';

async function testConnection() {
  console.log('🔗 Testing MongoDB Atlas connection...');
  console.log('📍 Your IP address needs to be whitelisted in Atlas');
  
  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    
    // Set a short timeout to fail fast
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });
    
    console.log('✅ SUCCESS: MongoDB Atlas connected!');
    console.log('🎉 Your database is working properly');
    
    // Test a simple operation
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📚 Found ${collections.length} collections in database`);
    
  } catch (error) {
    console.log('❌ FAILED: MongoDB Atlas connection failed');
    console.log('🚨 Error:', error.message);
    
    if (error.message.includes('IP')) {
      console.log('\n🔧 SOLUTION:');
      console.log('1. Go to https://cloud.mongodb.com/');
      console.log('2. Navigate to: Network Access');
      console.log('3. Click: Add IP Address');
      console.log('4. Add your IP: 223.227.16.181');
      console.log('5. Or click: "Add Current IP Address"');
      console.log('6. Wait 1-2 minutes for changes to apply');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testConnection();

