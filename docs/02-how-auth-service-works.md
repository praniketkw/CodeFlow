# How Auth Service Works

## The Big Picture

```
User/Client                    Auth Service (Port 3001)
    |                                  |
    |  1. POST /login                  |
    |  {username, password}            |
    |--------------------------------->|
    |                                  |
    |                          2. Check password
    |                          3. Generate token
    |                          4. Store in memory
    |                                  |
    |  5. Return token                 |
    |  {token: "token123"}             |
    |<---------------------------------|
    |                                  |
    |  6. GET /verify                  |
    |  Header: Authorization: token123 |
    |--------------------------------->|
    |                                  |
    |                          7. Look up token
    |                          8. Find user info
    |                                  |
    |  9. Return user data             |
    |  {valid: true, userId: 1}        |
    |<---------------------------------|
```

## Step-by-Step Breakdown

### Step 1-5: Login Flow

**What you send:**
```bash
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"username":"bob","password":"password123"}'
```

**What happens inside:**
1. Express receives the POST request
2. Extracts `username` and `password` from request body
3. Checks if password is "password123" (our simple check)
4. Generates random token: `'token' + random_string`
5. Stores it: `validTokens['token123'] = { userId: 866, username: 'bob' }`
6. Sends back the token

**What you get:**
```json
{
  "success": true,
  "token": "token123",
  "userId": 866
}
```

### Step 6-9: Verify Flow

**What you send:**
```bash
curl http://localhost:3001/verify \
  -H "Authorization: token123"
```

**What happens inside:**
1. Express receives the GET request
2. Extracts token from `Authorization` header
3. Looks up token in `validTokens` object
4. If found → returns user info
5. If not found → returns error

**What you get (if valid):**
```json
{
  "valid": true,
  "userId": 866,
  "username": "bob"
}
```

## Key Concepts

### 1. HTTP Methods
- **GET**: Retrieve data (like /verify)
- **POST**: Send data (like /login)

### 2. Headers
Extra information sent with requests:
```
Authorization: token123
Content-Type: application/json
```

### 3. Request Body
Data sent in POST requests:
```json
{
  "username": "bob",
  "password": "password123"
}
```

### 4. Response Status Codes
- **200**: Success
- **401**: Unauthorized (bad token/password)
- **500**: Server error

### 5. JSON
JavaScript Object Notation - a way to structure data:
```json
{
  "key": "value",
  "number": 123,
  "boolean": true
}
```

## Why This Matters for CodeFlow

In a real company:
- **100+ services** all call `/verify` to check tokens
- If we change the response format (like changing `userId` to `user.id`)
- **All 100 services break!**

This is the dependency problem CodeFlow solves.

## Try It Yourself

1. Login and get a token:
```bash
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password123"}'
```

2. Copy the token from the response

3. Verify it:
```bash
curl http://localhost:3001/verify \
  -H "Authorization: YOUR_TOKEN_HERE"
```

4. Try with a fake token and see it fail!

## Next: Building Dependencies

Next, we'll build **user-service** that DEPENDS on auth-service. 

Every time someone tries to get user data, user-service will call auth-service's `/verify` endpoint to check if they're allowed.

That's when you'll see how services depend on each other!
