# User Service

User management microservice that **DEPENDS** on auth-service for authentication.

## Dependency

This service calls `auth-service` on every request to verify tokens:
```
User Request → user-service → auth-service /verify → user-service responds
```

## APIs

All endpoints require authentication via `Authorization` header.

### GET /profile
Get the authenticated user's profile.

**Headers:**
- `Authorization: <token>`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

### GET /users
Get all users (requires valid token).

**Headers:**
- `Authorization: <token>`

**Response:**
```json
{
  "success": true,
  "users": [...],
  "requestedBy": "john_doe"
}
```

### PUT /profile
Update your profile.

**Headers:**
- `Authorization: <token>`

**Body:**
```json
{
  "name": "New Name",
  "email": "new@example.com"
}
```

## Running

```bash
npm install
npm start
```

Service runs on http://localhost:3002

**IMPORTANT**: auth-service must be running on port 3001!

## Test It

```bash
# 1. First, get a token from auth-service
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"password123"}'

# 2. Use the token to get your profile
curl http://localhost:3002/profile \
  -H "Authorization: YOUR_TOKEN_HERE"

# 3. Get all users
curl http://localhost:3002/users \
  -H "Authorization: YOUR_TOKEN_HERE"
```

## The Dependency Problem

This service expects auth-service to return:
```json
{
  "valid": true,
  "userId": 1,
  "username": "john_doe"
}
```

If auth-service changes to:
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "name": "john_doe"
  }
}
```

**user-service BREAKS!** This is what CodeFlow will detect and fix automatically.
