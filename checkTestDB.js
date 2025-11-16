require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

// Connect to test database
const uri = process.env.MONGO_URI.replace(/\/[^\/?]+(\?|$)/, '/test$1');
console.log('Checking test database...');

mongoose.connect(uri).then(async () => {
  const dbName = mongoose.connection.db.databaseName;
  console.log('Database:', dbName);
  
  const users = await User.find();
  console.log('Users found:', users.length);
  users.forEach(u => console.log('  -', u.name, '(' + u.email + ')', '- Role:', u.role));
  
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name).join(', '));
  
  mongoose.disconnect();
}).catch(e => console.error('Error:', e.message));


