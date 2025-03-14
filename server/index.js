// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const categoryRoutes = require('./routes/categories');
const parameterRoutes = require('./routes/parameters');
const generateRoutes = require('./routes/generate');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/parameters', parameterRoutes);
app.use('/api/generate', generateRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve admin frontend
  app.use('/admin', express.static(path.join(__dirname, '../admin/build')));
  app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/build/index.html'));
  });
  
  // Serve user frontend
  app.use(express.static(path.join(__dirname, '../user/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../user/build/index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`- Admin interface: http://localhost:${PORT}/admin`);
    console.log(`- User interface: http://localhost:${PORT}`);
  });
}

module.exports = app; // For testing