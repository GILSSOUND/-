const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const users = await User.find({});
    console.log('Users count:', users.length);
    console.log('Users:', users.map(u => ({ email: u.email, provider: u.provider, snsId: u.snsId })));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

checkDb();
