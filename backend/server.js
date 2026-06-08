const path = require('path');
const os = require('os');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Razorpay = require('razorpay');
require('dotenv').config();

function getNetworkIP() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return null;
}

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Register all models before routes (required for populate)
require('./models/User');
require('./models/Category');
require('./models/MenuItem');
require('./models/Table');
require('./models/Order');
require('./models/Bill');

const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const tableRoutes = require('./routes/tableRoutes');
const orderRoutes = require('./routes/orderRoutes');
const billingRoutes = require('./routes/billingRoutes');

const app = express();

// Make razorpay instance available to routes
app.set('razorpay', razorpay);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/billing', billingRoutes);

// Serve built frontend in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// API 404 for unmatched API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Catch-all: serve index.html for SPA frontend routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Connect to MongoDB and start server
const PORT = Number(process.env.PORT) || 5000;
const PORT_FALLBACK_LIMIT = 10;

function startServer(port, attempts = 0) {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log('MongoDB connected successfully');
    console.log(`Server running on port ${port}`);
    console.log(`Local:   http://localhost:${port}`);
    const network = getNetworkIP();
    if (network) console.log(`Network: http://${network}:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      if (attempts < PORT_FALLBACK_LIMIT) {
        const nextPort = port + 1;
        console.warn(`Port ${port} is already in use. Trying port ${nextPort}...`);
        startServer(nextPort, attempts + 1);
      } else {
        console.error(`Unable to bind to a free port after ${PORT_FALLBACK_LIMIT + 1} attempts.`);
        console.error('Please free the port or set PORT in your backend/.env file.');
        process.exit(1);
      }
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    startServer(PORT);
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
