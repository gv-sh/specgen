const { v4: uuidv4 } = require('uuid');
const db = require('../services/databaseService');

/**
 * Controller for parameter operations
 */
const parameterController = {
  /**
   * Get all parameters
   */
  async getAllParameters(req, res, next) {
    try {
      // Get query parameters
      const { categoryId } = req.query;
      
      const parameters = await db.getAll('parameters');
      
      // Filter by category if specified
      const filteredParameters = categoryId
        ? parameters.filter(param => param.categoryId === categoryId)
        : parameters;
      
      res.json(filteredParameters);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get a parameter by ID
   */
  async getParameterById(req, res, next) {
    try {
      const { id } = req.params;
      const parameter = await db.getById('parameters', id);
      
      if (!parameter) {
        const error = new Error('Parameter not found');
        error.statusCode = 404;
        return next(error);
      }
      
      res.json(parameter);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a new parameter
   */
  async createParameter(req, res, next) {
    try {
      const { name, type, visibility, categoryId, values } = req.body;
      
      // Validate required fields
      if (!name) {
        const error = new Error('Parameter name is required');
        error.statusCode = 400;
        return next(error);
      }
      
      if (!type || !['Dropdown', 'Slider', 'Toggle', 'Radio', 'Checkbox'].includes(type)) {
        const error = new Error('Valid parameter type is required');
        error.statusCode = 400;
        return next(error);
      }
      
      if (!categoryId) {
        const error = new Error('Category ID is required');
        error.statusCode = 400;
        return next(error);
      }
      
      // Check if category exists
      const category = await db.getById('categories', categoryId);
      if (!category) {
        const error = new Error('Category not found');
        error.statusCode = 404;
        return next(error);
      }
      
      // Create parameter object
      const newParameter = {
        id: `param-${uuidv4()}`,
        name,
        type,
        visibility: visibility || 'Basic',
        categoryId,
        values: values || []
      };
      
      // Validate values based on type
      switch (type) {
        case 'Dropdown':
        case 'Radio':
        case 'Checkbox':
          if (!values || !Array.isArray(values) || values.length < 2) {
            const error = new Error(`${type} parameter requires at least 2 values as an array`);
            error.statusCode = 400;
            return next(error);
          }
          break;
        case 'Slider':
          if (!values || typeof values !== 'object' || values.min === undefined || values.max === undefined) {
            const error = new Error('Slider parameter requires min and max values');
            error.statusCode = 400;
            return next(error);
          }
          // Ensure step has a default value if not provided
          if (values.step === undefined) {
            newParameter.values.step = 1;
          }
          break;
        case 'Toggle':
          if (!values || typeof values !== 'object' || !values.on || !values.off) {
            const error = new Error('Toggle parameter requires on and off values');
            error.statusCode = 400;
            return next(error);
          }
          break;
      }
      
      // Save to database
      const createdParameter = await db.create('parameters', newParameter);
      
      res.status(201).json(createdParameter);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a parameter
   */
  async updateParameter(req, res, next) {
    try {
      const { id } = req.params;
      const { name, type, visibility, categoryId, values } = req.body;
      
      // Check if parameter exists
      const existingParameter = await db.getById('parameters', id);
      if (!existingParameter) {
        const error = new Error('Parameter not found');
        error.statusCode = 404;
        return next(error);
      }
      
      // If changing category, check if category exists
      if (categoryId && categoryId !== existingParameter.categoryId) {
        const category = await db.getById('categories', categoryId);
        if (!category) {
          const error = new Error('Category not found');
          error.statusCode = 404;
          return next(error);
        }
      }
      
      // Validate values based on type if type changed or values provided
      const updatedType = type || existingParameter.type;
      const updatedValues = values !== undefined ? values : existingParameter.values;
      
      if (type !== existingParameter.type || values !== undefined) {
        switch (updatedType) {
          case 'Dropdown':
          case 'Radio':
          case 'Checkbox':
            if (!updatedValues || !Array.isArray(updatedValues) || updatedValues.length < 2) {
              const error = new Error(`${updatedType} parameter requires at least 2 values as an array`);
              error.statusCode = 400;
              return next(error);
            }
            break;
          case 'Slider':
            if (!updatedValues || typeof updatedValues !== 'object' || updatedValues.min === undefined || updatedValues.max === undefined) {
              const error = new Error('Slider parameter requires min and max values');
              error.statusCode = 400;
              return next(error);
            }
            // Ensure step has a default value if not provided
            if (updatedValues.step === undefined && existingParameter.values.step === undefined) {
              updatedValues.step = 1;
            }
            break;
          case 'Toggle':
            if (!updatedValues || typeof updatedValues !== 'object' || !updatedValues.on || !updatedValues.off) {
              const error = new Error('Toggle parameter requires on and off values');
              error.statusCode = 400;
              return next(error);
            }
            break;
        }
      }
      
      // Update fields
      const updates = {};
      if (name !== undefined) updates.name = name;
      if (type !== undefined) updates.type = type;
      if (visibility !== undefined) updates.visibility = visibility;
      if (categoryId !== undefined) updates.categoryId = categoryId;
      if (values !== undefined) updates.values = updatedValues;
      
      // Save to database
      const updatedParameter = await db.update('parameters', id, updates);
      
      res.json(updatedParameter);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a parameter
   */
  async deleteParameter(req, res, next) {
    try {
      const { id } = req.params;
      
      // Check if parameter exists
      const existingParameter = await db.getById('parameters', id);
      if (!existingParameter) {
        const error = new Error('Parameter not found');
        error.statusCode = 404;
        return next(error);
      }
      
      // Delete from database
      await db.delete('parameters', id);
      
      res.json({ message: 'Parameter deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = parameterController;