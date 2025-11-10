const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

// Simple in-memory token storage (for demo purposes)
const validTokens = {
  'token123': { userId: 1, username: 'john_doe' },
  'token456': { userId: 2, username: 'jane_smith' }
};

// API: Verify a token
app.get('/verify', (req, res) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const user = validTokens[token];
  
  if (user) {
    res.json({
      valid: true,
      userId: user.userId,
      username: user.username
    });
  } else {
    res.status(401).json({
      valid: false,
      error: 'Invalid token'
    });
  }
});

// API: Login (generate token)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Super simple auth (don't do this in real life!)
  if (username && password === 'password123') {
    const token = 'token' + Math.random().toString(36).substr(2, 9);
    const userId = Math.floor(Math.random() * 1000);
    
    validTokens[token] = { userId, username };
    
    res.json({
      success: true,
      token,
      userId
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🔐 Auth Service running on http://localhost:${PORT}`);
});
