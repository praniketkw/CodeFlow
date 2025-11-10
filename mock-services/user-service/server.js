const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3002;

// URL of the auth service (DEPENDENCY!)
const AUTH_SERVICE_URL = 'http://localhost:3001';

app.use(express.json());

// Fake user database
const users = {
  1: { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
  2: { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
  866: { id: 866, name: 'Bob Wilson', email: 'bob@example.com', role: 'user' }
};

// Middleware: Verify token by calling auth-service
async function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // THIS IS THE DEPENDENCY: Calling auth-service
    const response = await axios.get(`${AUTH_SERVICE_URL}/verify`, {
      headers: { Authorization: token }
    });

    // IMPORTANT: We expect this exact structure from auth-service
    // If auth-service changes this, user-service BREAKS!
    if (response.data.valid) {
      req.userId = response.data.userId;  // ← We depend on "userId" field
      req.username = response.data.username;
      next();
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth service error:', error.message);
    res.status(503).json({ error: 'Auth service unavailable' });
  }
}

// API: Get user profile (requires authentication)
app.get('/profile', verifyToken, (req, res) => {
  const user = users[req.userId];
  
  if (user) {
    res.json({
      success: true,
      user: user
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
});

// API: Get all users (requires authentication)
app.get('/users', verifyToken, (req, res) => {
  res.json({
    success: true,
    users: Object.values(users),
    requestedBy: req.username
  });
});

// API: Update user profile (requires authentication)
app.put('/profile', verifyToken, (req, res) => {
  const user = users[req.userId];
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { name, email } = req.body;
  
  if (name) user.name = name;
  if (email) user.email = email;
  
  res.json({
    success: true,
    message: 'Profile updated',
    user: user
  });
});

app.listen(PORT, () => {
  console.log(`👤 User Service running on http://localhost:${PORT}`);
  console.log(`📡 Depends on Auth Service at ${AUTH_SERVICE_URL}`);
});
