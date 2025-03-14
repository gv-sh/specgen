const fs = require('fs-extra');
const path = require('path');

// Path to the JSON database file
const dbPath = path.join(__dirname, '../data/database.json');

// Initial data structure
const initialData = {
  categories: [],
  parameters: []
};

/**
 * Database service for JSON file operations
 */
class DatabaseService {
  /**
   * Initialize the database file if it doesn't exist
   */
  async init() {
    try {
      // Ensure the data directory exists
      await fs.ensureDir(path.dirname(dbPath));
      
      // Check if database file exists
      const exists = await fs.pathExists(dbPath);
      
      if (!exists) {
        // Create a new database file with initial structure
        await fs.writeJson(dbPath, initialData, { spaces: 2 });
        console.log('Database initialized with empty structure');
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Read the entire database
   */
  async readDatabase() {
    try {
      await this.init();
      return await fs.readJson(dbPath);
    } catch (error) {
      console.error('Failed to read database:', error);
      throw error;
    }
  }

  /**
   * Write to the database
   */
  async writeDatabase(data) {
    try {
      await fs.writeJson(dbPath, data, { spaces: 2 });
    } catch (error) {
      console.error('Failed to write to database:', error);
      throw error;
    }
  }

  /**
   * Get all items from a collection
   */
  async getAll(collection) {
    try {
      const db = await this.readDatabase();
      return db[collection] || [];
    } catch (error) {
      console.error(`Failed to get all ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Get an item by ID from a collection
   */
  async getById(collection, id) {
    try {
      const db = await this.readDatabase();
      const item = (db[collection] || []).find(item => item.id === id);
      return item;
    } catch (error) {
      console.error(`Failed to get ${collection} by ID:`, error);
      throw error;
    }
  }

  /**
   * Create a new item in a collection
   */
  async create(collection, item) {
    try {
      const db = await this.readDatabase();
      
      // Ensure the collection exists
      if (!db[collection]) {
        db[collection] = [];
      }
      
      // Add the new item
      db[collection].push(item);
      
      // Write back to the database
      await this.writeDatabase(db);
      
      return item;
    } catch (error) {
      console.error(`Failed to create ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Update an item in a collection
   */
  async update(collection, id, updates) {
    try {
      const db = await this.readDatabase();
      
      // Find the item index
      const index = (db[collection] || []).findIndex(item => item.id === id);
      
      if (index === -1) {
        throw new Error(`${collection} with ID ${id} not found`);
      }
      
      // Update the item
      db[collection][index] = { ...db[collection][index], ...updates };
      
      // Write back to the database
      await this.writeDatabase(db);
      
      return db[collection][index];
    } catch (error) {
      console.error(`Failed to update ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Delete an item from a collection
   */
  async delete(collection, id) {
    try {
      const db = await this.readDatabase();
      
      // Filter out the item to delete
      db[collection] = (db[collection] || []).filter(item => item.id !== id);
      
      // Write back to the database
      await this.writeDatabase(db);
      
      return { success: true };
    } catch (error) {
      console.error(`Failed to delete ${collection}:`, error);
      throw error;
    }
  }
}

module.exports = new DatabaseService();