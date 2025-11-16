// Script to migrate users from 'test' database to 'ecomm-db'
require('dotenv').config();
const mongoose = require('mongoose');

async function migrateUsers() {
  try {
    // Connect to test database
    const testUri = process.env.MONGO_URI.replace(/\/[^\/?]+(\?|$)/, '/test$1');
    await mongoose.connect(testUri);
    console.log('Connected to test database');
    
    const testDb = mongoose.connection.db;
    const users = await testDb.collection('users').find({}).toArray();
    console.log(`Found ${users.length} users in test database`);
    
    if (users.length === 0) {
      console.log('No users to migrate');
      await mongoose.disconnect();
      return;
    }
    
    // Connect to ecomm-db
    await mongoose.disconnect();
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to ecomm-db');
    
    const ecommDb = mongoose.connection.db;
    const existingUsers = await ecommDb.collection('users').find({}).toArray();
    console.log(`Found ${existingUsers.length} existing users in ecomm-db`);
    
    // Insert users (skip duplicates based on email)
    let inserted = 0;
    let skipped = 0;
    
    for (const user of users) {
      const exists = await ecommDb.collection('users').findOne({ email: user.email });
      if (!exists) {
        delete user._id; // Let MongoDB create new ID
        await ecommDb.collection('users').insertOne(user);
        inserted++;
        console.log(`Migrated: ${user.name} (${user.email})`);
      } else {
        skipped++;
        console.log(`Skipped (already exists): ${user.email}`);
      }
    }
    
    console.log(`\nMigration complete:`);
    console.log(`  - Inserted: ${inserted}`);
    console.log(`  - Skipped: ${skipped}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrateUsers();


