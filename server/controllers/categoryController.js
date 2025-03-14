// controllers/categoryController.js
const databaseService = require('../services/databaseService');
const { v4: uuidv4 } = require('uuid');

/**
 * Controller for category operations
 */
const categoryController = {
  /**
   * Get all categories
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getAllCategories(req, res, next) {
    try {
      const categories = await databaseService.getCategories();
      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get a category by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getCategoryById(req, res, next) {
    try {
      const { id } = req.params;
      const category = await databaseService.getCategoryById(id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          error: `Category with ID ${id} not found`
        });
      }
      
      res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a new category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async createCategory(req, res, next) {
    try {
      const { name, visibility } = req.body;
      
      // Validate input
      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Name is required for a category'
        });
      }
      
      // Create a new category with a unique ID
      const newCategory = {
        id: `cat-${uuidv4()}`,
        name,
        visibility: visibility || 'Show'
      };
      
      const createdCategory = await databaseService.createCategory(newCategory);
      
      res.status(201).json({
        success: true,
        data: createdCategory
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const { name, visibility } = req.body;
      
      // Validate input
      if (!name && !visibility) {
        return res.status(400).json({
          success: false,
          error: 'At least one field (name or visibility) is required for update'
        });
      }
      
      // Prepare update object
      const updateData = {};
      if (name) updateData.name = name;
      if (visibility) updateData.visibility = visibility;
      
      const updatedCategory = await databaseService.updateCategory(id, updateData);
      
      if (!updatedCategory) {
        return res.status(404).json({
          success: false,
          error: `Category with ID ${id} not found`
        });
      }
      
      res.status(200).json({
        success: true,
        data: updatedCategory
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      
      // Check if category exists before attempting to delete
      const category = await databaseService.getCategoryById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: `Category with ID ${id} not found`
        });
      }
      
      // Get parameters associated with this category for proper error reporting
      const parameters = await databaseService.getParametersByCategoryId(id);
      
      // Perform the deletion (this will also delete associated parameters)
      const deleted = await databaseService.deleteCategory(id);
      
      res.status(200).json({
        success: true,
        message: `Category '${category.name}' deleted successfully`,
        data: {
          deletedCategory: category,
          deletedParameters: parameters,
          parameterCount: parameters.length
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = categoryController;