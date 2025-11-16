# Testing User Registration

## Issue
Users are being created (logs show success) but not appearing in MongoDB Atlas.

## Steps to Debug

### 1. Check Server Connection
The server might be using an old connection. **Restart your backend server** to ensure it's using the updated `MONGO_URI` with the database name.

### 2. Test with Postman

**Endpoint:** `POST http://localhost:5001/api/users/register`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected Response:**
- Status: `201 Created`
- Body should include: `_id`, `name`, `email`, `role`, `token`

### 3. Check Backend Logs
After registration, check your backend terminal for:
- `Attempting to create user: ...`
- `User created successfully: ...`
- Any error messages

### 4. Verify in MongoDB Atlas

1. Go to MongoDB Atlas
2. Click "Browse Collections"
3. Make sure you're looking at the correct database (should be `ecomm-db` if you updated MONGO_URI)
4. Click on the `users` collection
5. You should see the newly registered user

### 5. If Users Still Don't Appear

Run this command to check all databases:
```bash
cd backend
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(async () => { const admin = mongoose.connection.db.admin(); const dbs = await admin.listDatabases(); console.log('Available databases:'); dbs.databases.forEach(db => console.log('  -', db.name, '(' + (db.sizeOnDisk/1024/1024).toFixed(2) + ' MB)')); mongoose.disconnect(); });"
```

This will show all databases. Check if users are in a different database (like `test`).

### 6. Check MONGO_URI Format

Your `.env` should have:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecomm-db?appName=Cluster0
```

**Important:** The `/ecomm-db` part is the database name. Make sure it's there!


