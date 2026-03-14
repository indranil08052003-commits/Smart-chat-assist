const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartchat-assist';

    // Attempt local/atlas connection
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ Local MongoDB connection failed: ${error.message}`);

    try {
      console.log('🔄 Attempting to start In-Memory MongoDB for demonstration...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();

      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✨ In-Memory MongoDB started and connected successfully!');
      console.log('💡 Note: Data will NOT be persistent in this mode.');
    } catch (memError) {
      console.error(`❌ Failed to start In-Memory MongoDB: ${memError.message}`);
      console.log('💡 Please check your MONGODB_URI in .env or ensure MongoDB is running.');
    }
  }
};

module.exports = connectDB;
