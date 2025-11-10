# Microservices Basics

## What are Microservices?

Instead of one big application (monolith), microservices split functionality into small, independent services that communicate over HTTP/APIs.

**Example:**
- **Monolith**: One app handles auth, users, orders, payments
- **Microservices**: Separate services for auth, users, orders, payments

## Why Microservices?

**Pros:**
- Teams can work independently
- Scale services individually
- Use different tech stacks
- Deploy independently

**Cons:**
- More complex to manage
- Network calls between services
- **Dependency hell** ← This is what CodeFlow solves!

## How Services Communicate

Services talk via REST APIs:

```
user-service needs to verify a token
    ↓
Calls: GET http://auth-service:3000/verify
    ↓
auth-service responds: { valid: true, userId: 123 }
```

## The Dependency Problem

When auth-service changes its API:
```javascript
// Before
GET /verify → { valid: true, userId: 123 }

// After (breaking change!)
GET /verify → { valid: true, user: { id: 123, role: "admin" } }
```

Now user-service breaks because it expects `userId`, not `user.id`.

**In a company with 100 services, this cascades everywhere!**

This is the pain CodeFlow solves.

## What We'll Build

1. Create 3 services that depend on each other
2. Make a breaking change
3. See everything break
4. Build CodeFlow to detect and fix it automatically
