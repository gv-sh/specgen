const { v4: uuidv4 } = require('uuid');
const db = require('../services/databaseService');

/**
 * Controller for category operations
 */
const categoryController = {
  /**
   * Get all categories
   */
  async getAllCategories(req, res, next) {
    try {
      const categories = await db.getAll('categories');
      res.json(categories);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get a category by ID
   */
  async getCategoryById(req, res, next) {
    try {
      const { id } = req.params;
      const category = await db.getById('categories', id);
      
      if (!category) {
        const error = new Error('Category not found');
        error.statusCode = 404;
        return next(error);
      }
      
      res.json(category);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a new category
   */
  async createCategory(req, res, next) {
    try {
      const { name, visibility } = req.body;
      
      // Validate required fields
      if (!name) {
        const error = new Error('Category name is required');
        error.statusCode = 400;
        return next(error);
      }
      
      // Create category object
      const newCategory = {
        id: `cat-${uuidv4()}`,
        name,
        visibility: visibility || 'Show'
      };
      
      // Save to database
      const createdCategory = await db.create('categories', newCategory);
      
      res.status(201).json(createdCategory);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a category
   */
  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const { name, visibility } = req.body;
      
      // Check if category exists
      const existingCategory = await db.getById('categories', id);
      if (!existingCategory) {
        const error = new Error('Category not found');
        error.statusCode = 404;
        return next(error);
      }
      
      // Update fields
      const updates = {};
      if (name !== undefined) updates.name = name;
      if (visibility !== undefined) updates.visibility = visibility;
      
      // Save to database
      const updatedCategory = await db.update('categories', id, updates);
      
      res.json(updatedCategory);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a category
   */
  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      
      // Check if category exists
      const existingCategory = await db.getById('categories', id);
      if (!existingCategory) {
        const error = new Error('Category not found');
        error.statusCode = 404;
        return next(error);
      }
      
      // Check if category has parameters
      const allParameters = await db.getAll('parameters');
      const hasParameters = allParameters.some(param => param.categoryId === id);
      
      if (hasParameters) {
        const error = new Error('Cannot delete category with parameters. Delete parameters first.');
        error.statusCode = 400;
        return next(error);
      }
      
      // Delete from database
      await db.delete('categories', id);
      
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = categoryController;