# The Breaking Change - Live Example

## What We Just Did

We made a "simple" change to auth-service's `/verify` endpoint.

### Before (v1.0.0):
```json
{
  "valid": true,
  "userId": 1,
  "username": "john_doe"
}
```

### After (v2.0.0):
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "name": "john_doe",
    "email": "john_doe@example.com"
  }
}
```

## The Impact

### ✅ auth-service still works
```bash
curl http://localhost:3001/verify -H "Authorization: token123"
# Returns the new format successfully
```

### ❌ user-service is BROKEN
```bash
curl http://localhost:3002/profile -H "Authorization: token123"
# Returns: {"success": false, "error": "User not found"}
```

## Why It Broke

In `user-service/server.js`:

```javascript
const response = await axios.get(`${AUTH_SERVICE_URL}/verify`, {
  headers: { Authorization: token }
});

if (response.data.valid) {
  req.userId = response.data.userId;  // ← undefined! Field doesn't exist
  req.username = response.data.username;  // ← undefined!
  next();
}
```

The code expects `userId` but gets `user.id` instead.

## The Real-World Problem

In a company with 100 microservices:

1. **Auth team** makes this change
2. **50 services** depend on the old format
3. **Nobody knows** which services will break
4. **Auth team deploys** to production
5. **50 services break** simultaneously
6. **Production is down**
7. **Hours of debugging** to find the issue
8. **Days to coordinate** fixes across 50 teams

## The Manual Fix

To fix user-service, we'd need to change:

```javascript
// Old code
req.userId = response.data.userId;
req.username = response.data.username;

// New code
req.userId = response.data.user.id;
req.username = response.data.user.name;
```

Now imagine doing this for 50 services, each owned by different teams!

## What CodeFlow Will Do

1. **Detect the change** automatically
   - Scan auth-service commits
   - Use AI to understand: "Response structure changed"
   - Identify: "userId moved to user.id"

2. **Find all affected services**
   - Scan all repos in the organization
   - Find every service calling `/verify`
   - Analyze which ones expect the old format

3. **Generate fixes automatically**
   - Use AI to generate the code changes
   - Create PRs for each affected service
   - Include tests to verify the fix

4. **Coordinate deployment**
   - Determine safe deployment order
   - Monitor rollout
   - Auto-rollback if failures detected

## Next: Build CodeFlow AI

Now we'll build the AI engine that:
- Analyzes code changes semantically
- Detects breaking changes
- Generates fixes automatically

Let's use your Anthropic API key to build this!
