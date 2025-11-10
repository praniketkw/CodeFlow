# Auth Service

Simple authentication microservice that provides token verification.

## APIs

### GET /verify
Verifies if a token is valid.

**Headers:**
- `Authorization: <token>`

**Response:**
```json
{
  "valid": true,
  "userId": 1,
  "username": "john_doe"
}
```

### POST /login
Generates a token for a user.

**Body:**
```json
{
  "username": "john",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "token123abc",
  "userId": 42
}
```

## Running

```bash
npm install
npm start
```

Service runs on http://localhost:3001

## Test It

```bash
# Login
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"password123"}'

# Verify token
curl http://localhost:3001/verify \
  -H "Authorization: token123"
```
