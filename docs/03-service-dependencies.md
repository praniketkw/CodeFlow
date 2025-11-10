# Service Dependencies - The Real Problem

## What Just Happened

When you called `GET /profile` on user-service, here's the flow:

```
1. You → user-service
   GET /profile
   Header: Authorization: token123

2. user-service → auth-service
   GET /verify
   Header: Authorization: token123

3. auth-service → user-service
   Response: { valid: true, userId: 1, username: "john_doe" }

4. user-service extracts userId from response
   Looks up user in database
   
5. user-service → You
   Response: { success: true, user: {...} }
```

## The Critical Dependency

Look at this code in `user-service/server.js`:

```javascript
const response = await axios.get(`${AUTH_SERVICE_URL}/verify`, {
  headers: { Authorization: token }
});

// CRITICAL: We expect this exact structure!
if (response.data.valid) {
  req.userId = response.data.userId;  // ← Expects "userId" field
  req.username = response.data.username;
  next();
}
```

**user-service DEPENDS on auth-service returning:**
```json
{
  "valid": true,
  "userId": 1,
  "username": "john_doe"
}
```

## The Breaking Change Scenario

Now imagine the auth-service team decides to "improve" their API:

**Old Response:**
```json
{
  "valid": true,
  "userId": 1,
  "username": "john_doe"
}
```

**New Response (Breaking!):**
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "name": "john_doe",
    "email": "john@example.com"
  }
}
```

### What Breaks?

```javascript
req.userId = response.data.userId;  // ← undefined! (doesn't exist anymore)
```

Now user-service can't find the userId, so:
- `/profile` returns 404
- `/users` fails
- Everything breaks!

## In a Real Company

Imagine:
- **auth-service** is used by **50 other services**
- Each service expects the old format
- Auth team makes the change and deploys
- **50 services break simultaneously**
- Production is down
- Engineers scramble to fix
- Takes hours/days to coordinate fixes

## This is What CodeFlow Solves

CodeFlow will:

1. **Detect the change** semantically
   - "auth-service changed response structure"
   - "userId field moved to user.id"

2. **Find all dependents**
   - Scans all repos
   - Finds every service calling `/verify`
   - Identifies which ones will break

3. **Generate fixes automatically**
   - Creates PRs for all 50 services
   - Updates code: `response.data.userId` → `response.data.user.id`
   - Adds tests

4. **Coordinate deployment**
   - "Deploy auth-service first"
   - "Then deploy these 50 services"
   - "Rollback if anything fails"

## Let's Break It!

Next, we'll:
1. Make a breaking change to auth-service
2. Watch user-service break
3. Build CodeFlow AI to detect and fix it automatically

Ready to see it break?
