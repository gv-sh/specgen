// tests/setup.js
jest.mock('../swagger');
const app = require('../index');
const supertest = require('supertest');
const databaseService = require('../services/databaseService');
const fs = require('fs').promises;
const path = require('path');

// Create a supertest instance with our app
const request = supertest(app);

// Database file path
const DATABASE_PATH = path.join(__dirname, '../data/database.json');

// Initialize the database file with valid JSON if it doesn't exist
const initDatabase = async () => {
  try {
    await fs.access(DATABASE_PATH);
    // Try to read the file to see if it's valid JSON
    const data = await fs.readFile(DATABASE_PATH, 'utf8');
    try {
      JSON.parse(data);
      // File exists and is valid JSON
    } catch (e) {
      // File exists but is not valid JSON, initialize it
      const initialData = { categories: [], parameters: [] };
      await fs.writeFile(DATABASE_PATH, JSON.stringify(initialData, null, 2), 'utf8');
    }
  } catch (e) {
    // File doesn't exist, create it
    const initialData = { categories: [], parameters: [] };
    
    // Make sure the directory exists
    await fs.mkdir(path.dirname(DATABASE_PATH), { recursive: true });
    
    // Write initial data
    await fs.writeFile(DATABASE_PATH, JSON.stringify(initialData, null, 2), 'utf8');
  }
};

// Utility function to create a clean test category
const createTestCategory = async () => {
  await initDatabase();
  
  const response = await request.post('/api/categories').send({
    name: "Test Category",
    visibility: "Show"
  });
  
  return response.body.data;
};

// Utility function to clean the database for testing
const cleanDatabase = async () => {
  await initDatabase();
  
  const data = await databaseService.getData();
  
  // Keep only the first category (if any)
  if (data.categories.length > 0) {
    const keepCategory = data.categories[0];
    data.categories = [keepCategory];
    
    // Remove all parameters except those associated with the kept category
    data.parameters = data.parameters.filter(param => param.categoryId === keepCategory.id);
  } else {
    data.categories = [];
    data.parameters = [];
  }
  
  await databaseService.saveData(data);
  return data;
};

// Helper to create standard parameter types
const createTestParameters = async (categoryId) => {
  try {
    // Create a dropdown parameter
    const dropdownResponse = await request.post('/api/parameters').send({
      name: "Test Dropdown",
      type: "Dropdown",
      visibility: "Basic",
      categoryId: categoryId,
      values: [
        { id: "test-1", label: "Test 1" },
        { id: "test-2", label: "Test 2" }
      ]
    });

    // Create a slider parameter
    const sliderResponse = await request.post('/api/parameters').send({
      name: "Test Slider",
      type: "Slider",
      visibility: "Basic",
      categoryId: categoryId,
      config: {
        min: 0,
        max: 100,
        step: 1
      }
    });

    // Create a toggle parameter
    const toggleResponse = await request.post('/api/parameters').send({
      name: "Test Toggle",
      type: "Toggle Switch",
      visibility: "Basic",
      categoryId: categoryId,
      values: {
        on: "Yes",
        off: "No"
      }
    });

    // Log responses for debugging
    console.log('Created parameters:');
    console.log('Dropdown:', dropdownResponse.body);
    console.log('Slider:', sliderResponse.body);
    console.log('Toggle:', toggleResponse.body);

    return {
      dropdown: dropdownResponse.body.data || {},
      slider: sliderResponse.body.data || {},
      toggle: toggleResponse.body.data || {}
    };
  } catch (error) {
    console.error('Error creating test parameters:', error);
    return { dropdown: {}, slider: {}, toggle: {} };
  }
};

module.exports = {
  request,
  createTestCategory,
  cleanDatabase,
  createTestParameters,
  initDatabase
};