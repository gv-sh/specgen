// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const categoryRoutes = require('./routes/categories');
const parameterRoutes = require('./routes/parameters');
const generateRoutes = require('./routes/generate');
const databaseRoutes = require('./routes/database');

// API Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/parameters', parameterRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/database', databaseRoutes);

// Only add Swagger in non-test environment
if (process.env.NODE_ENV !== 'test') {
  const swaggerRoutes = require('./routes/swagger');
  app.use('/api-docs', swaggerRoutes);
}

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use('/admin', express.static(path.join(__dirname, '../admin/build')));
  app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/build/index.html'));
  });
  
  app.use(express.static(path.join(__dirname, '../user/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../user/build/index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (process.env.NODE_ENV !== 'test') {
      console.log(`- API Documentation: http://localhost:${PORT}/api-docs`);
    }
    console.log(`- Admin interface: http://localhost:${PORT}/admin`);
    console.log(`- User interface: http://localhost:${PORT}`);
  });
}

module.exports = app;