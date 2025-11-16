# Session Management Implementation Guide

## Experiment 7: Implement and Test Session Management

This project implements three different session management techniques:
1. **JWT (JSON Web Tokens)** - Token-based authentication
2. **Cookie-based** - Signed HTTP-only cookies
3. **Server-side Sessions** - MongoDB-stored sessions

## Configuration

Set the `SESSION_TYPE` environment variable in your `.env` file:

```env
# Options: 'jwt', 'cookie', or 'server-side'
SESSION_TYPE=jwt
```

## How Each Method Works

### 1. JWT (JSON Web Tokens) - Default

**How it works:**
- Token is generated on login and returned in response body
- Client stores token (localStorage/sessionStorage)
- Client sends token in `Authorization: Bearer <token>` header
- Stateless - no server storage needed

**Setup:**
```env
SESSION_TYPE=jwt
```

**Login Response:**
```json
{
  "_id": "...",
  "name": "User",
  "email": "user@example.com",
  "role": "customer",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionType": "jwt"
}
```

**Frontend:**
- Store token in localStorage
- Send in Authorization header: `Authorization: Bearer <token>`

### 2. Cookie-based (Signed HTTP-only Cookies)

**How it works:**
- Token is generated on login
- Token is set in a signed, HTTP-only cookie
- Browser automatically sends cookie with each request
- Stateless (JWT in cookie)

**Setup:**
```env
SESSION_TYPE=cookie
COOKIE_SECRET=your-cookie-secret-key
```

**Login Response:**
```json
{
  "_id": "...",
  "name": "User",
  "email": "user@example.com",
  "role": "customer",
  "sessionType": "cookie"
}
```
Cookie is automatically set: `Set-Cookie: shop_sphere_token=<signed-token>; HttpOnly; Secure; SameSite=Strict`

**Frontend:**
- No manual token handling needed
- Cookies are sent automatically
- Use `credentials: 'include'` in fetch/axios

### 3. Server-side Sessions

**How it works:**
- User ID is stored in server-side session (MongoDB)
- Session ID is sent to client in cookie
- Server looks up session on each request
- Stateful - requires server storage

**Setup:**
```env
SESSION_TYPE=server-side
SESSION_SECRET=your-session-secret-key
MONGO_URI=mongodb://localhost:27017/ecomm-db
```

**Login Response:**
```json
{
  "_id": "...",
  "name": "User",
  "email": "user@example.com",
  "role": "customer",
  "sessionType": "server-side"
}
```
Session is stored in MongoDB `sessions` collection.

**Frontend:**
- No token handling needed
- Cookies are sent automatically
- Use `credentials: 'include'` in fetch/axios

## API Endpoints

### Session Information
```
GET /api/session/info
```
Returns current session information (requires authentication)

### Logout
```
POST /api/session/logout
```
Logs out user (handles all session types)

### Compare Methods
```
GET /api/session/compare
```
Returns comparison of all three session management methods

## Testing

### Test JWT
```bash
# Set environment
export SESSION_TYPE=jwt

# Login
curl -X POST http://localhost:5001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password"}'

# Use token
curl http://localhost:5001/api/session/info \
  -H "Authorization: Bearer <token>"
```

### Test Cookie-based
```bash
# Set environment
export SESSION_TYPE=cookie

# Login (cookie is set automatically)
curl -X POST http://localhost:5001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password"}' \
  -c cookies.txt

# Use cookie
curl http://localhost:5001/api/session/info \
  -b cookies.txt
```

### Test Server-side
```bash
# Set environment
export SESSION_TYPE=server-side

# Login (session is created)
curl -X POST http://localhost:5001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password"}' \
  -c cookies.txt

# Use session
curl http://localhost:5001/api/session/info \
  -b cookies.txt
```

## Comparison

| Feature | JWT | Cookie | Server-side |
|---------|-----|--------|-------------|
| Stateless | ✅ Yes | ✅ Yes | ❌ No |
| Scalable | ✅ High | ✅ High | ⚠️ Medium |
| Security | ⚠️ Medium | ✅ High | ✅ Highest |
| Revocable | ❌ No | ❌ No | ✅ Yes |
| Mobile-friendly | ✅ Yes | ⚠️ Limited | ✅ Yes |
| Storage | Client | Cookie | Server (DB) |
| XSS Protection | ⚠️ Manual | ✅ HTTP-only | ✅ HTTP-only |
| CSRF Protection | ✅ N/A | ⚠️ SameSite | ⚠️ SameSite |

## Recommendations

- **JWT**: Best for APIs, mobile apps, microservices, stateless architectures
- **Cookie**: Best for traditional web applications with automatic cookie handling
- **Server-side**: Best for high-security applications requiring session revocation

## Frontend Configuration

Update your frontend axios configuration to include credentials for cookie/server-side:

```javascript
axios.defaults.withCredentials = true;
```

Or in axios instance:
```javascript
const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});
```

