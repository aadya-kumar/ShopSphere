# Fix Database Connection Issue

## Problem
Your `MONGO_URI` doesn't specify a database name, so MongoDB defaults to "test". While products are being saved, users aren't appearing in Atlas.

## Solution

### Step 1: Update your `.env` file

Add the database name to your `MONGO_URI`. The format should be:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecomm-db?appName=Cluster0
```

**Important:** Replace `ecomm-db` with your desired database name (or keep it if you want to use that name).

### Step 2: Verify the connection

After updating `.env`, restart your backend server. The connection should now use the specified database name.

### Step 3: Re-run seed and makeAdmin (if needed)

If you want to ensure everything is in the same database:

```bash
# Re-seed products (optional - only if you want fresh data)
node seed.js

# Make user admin (if needed)
node makeAdmin.js
```

### Step 4: Test user registration

Try registering a new user and check Atlas to confirm the user appears in the `users` collection.

## Current Status

- ✅ Products collection exists and has data
- ✅ Users collection exists but is empty
- ⚠️  Database name not specified in MONGO_URI (defaults to "test")

## Quick Fix

Your current MONGO_URI probably looks like:
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster0
```

Change it to:
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecomm-db?appName=Cluster0
```

Notice the `/ecomm-db` before the `?` - that's the database name!


