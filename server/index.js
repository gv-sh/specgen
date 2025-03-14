const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const db = require('./services/databaseService');

// Import routes
const categoryRoutes = require('./routes/categories');
const parameterRoutes = require('./routes/parameters');
const generateRoutes = require('./routes/generate');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
db.init().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/parameters', parameterRoutes);
app.use('/api/generate', generateRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});