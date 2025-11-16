// makeAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');  // correct path

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const email = "aadya@test.com"; // change to the user you want

    const res = await User.updateOne(
      { email },
      { $set: { role: "admin" } }
    );

    console.log("Update Result:", res);
    console.log(`User with email ${email} is now an ADMIN`);

    mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

makeAdmin();
