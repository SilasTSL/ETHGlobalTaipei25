const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/data', (req, res) => {
  res.json({
    message: 'Hello from Express backend!',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
}); 