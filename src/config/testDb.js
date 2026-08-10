// config/testDb.js
const mongoose = require('mongoose');

const connectTestDB = async () => {
  try {
    // Use a different database name for testing
    const testURI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/yourdb_test';
    await mongoose.connect(testURI);
    console.log('Test DB connected');
  } catch (err) {
    console.error('Test DB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectTestDB;