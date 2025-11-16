# Admin Authorization Guide

## How to Use Your Admin Account

### 1. Login as Admin
- Go to `/login` or click "Login" in the navbar
- Enter your email: `aadya@test.com`
- Enter your password
- Click "Login"

### 2. Verify You're Logged In as Admin
After logging in, you should see:
- In the navbar: "Hi, [Your Name] (admin)"
- An "Admin" link in the navbar

### 3. Admin Features Available

#### **Admin Products Page** (`/admin/products`)
- ✅ View all products
- ✅ Create new products
- ✅ Edit any product
- ✅ Delete any product

#### **Admin Offers Page** (`/admin/offers`)
- ✅ View all discount offers
- ✅ Create new offers
- ✅ Delete offers

#### **Admin Orders Page** (`/admin/orders`)
- ✅ View all orders from all customers
- ✅ Update order status (Confirm, Ship, Deliver)

### 4. How Authorization Works

When you login:
1. Your JWT token is stored in localStorage
2. All admin API requests automatically include: `Authorization: Bearer <your-token>`
3. The backend verifies your token and checks your role
4. Only users with `role: 'admin'` can access admin routes

### 5. Testing Your Admin Access

Try these actions:
1. **Create a Product:**
   - Go to `/admin/products`
   - Fill in the form and click "Add Product"
   - Should work if you're admin ✅

2. **Delete a Product:**
   - Go to `/admin/products`
   - Click "Delete" on any product
   - Should work if you're admin ✅

3. **Create an Offer:**
   - Go to `/admin/offers`
   - Fill in the form and click "Create Offer"
   - Should work if you're admin ✅

4. **View All Orders:**
   - Go to `/admin/orders`
   - Should see all orders from all customers ✅

### 6. If You Get "Not Authorized" Errors

- Make sure you're logged in (check navbar shows your name)
- Check browser console for error messages
- Verify your user role in database is set to `'admin'`
- Try logging out and logging back in

### 7. Check Your Role in Database

To verify your role is set correctly:
```javascript
// In MongoDB shell or script
db.users.findOne({ email: "aadya@test.com" })
// Should show: { role: "admin", ... }
```

## Role Permissions Summary

| Feature | Customer | Vendor | Admin |
|---------|----------|--------|-------|
| Browse Products | ✅ | ✅ | ✅ |
| Add to Cart | ✅ | ❌ | ❌ |
| Place Orders | ✅ | ❌ | ❌ |
| Create Products | ❌ | ✅ (own) | ✅ (all) |
| Edit Products | ❌ | ✅ (own) | ✅ (all) |
| Delete Products | ❌ | ❌ | ✅ |
| Manage Offers | ❌ | ❌ | ✅ |
| View All Orders | ❌ | ❌ | ✅ |
| Update Order Status | ❌ | ❌ | ✅ |
| Update User Roles | ❌ | ❌ | ✅ |

