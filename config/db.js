const mongoose = require('mongoose');

module.exports = async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection URI:', uri ? uri.substring(0, 50) + '...' : 'NOT SET');
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
      retryWrites: true,
      w: 'majority'
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('Retrying in 5 seconds...');
    setTimeout(() => connectDB(), 5000);
  }
};