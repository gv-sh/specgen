// controllers/generateController.js
const aiService = require('../services/aiService');
const databaseService = require('../services/databaseService');

/**
 * Controller for handling generation requests
 */
const generateController = {
  /**
   * Generate content based on submitted parameters
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async generate(req, res, next) {
    try {
      const parameters = req.body;
      
      // Validate parameters
      if (!parameters || Object.keys(parameters).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No parameters provided for generation'
        });
      }
      
      // Validate parameters against database
      const validationResult = await validateParameters(parameters);
      if (!validationResult.valid) {
        return res.status(400).json({
          success: false,
          error: `Invalid parameters: ${validationResult.message}`
        });
      }
      
      // Generate content using AI service
      const result = await aiService.generateContent(parameters);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          content: result.content,
          metadata: result.metadata
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error || 'Failed to generate content'
        });
      }
    } catch (error) {
      next(error);
    }
  }
};

/**
 * Validate parameters against database
 * @param {Object} parameters - Parameters to validate
 * @returns {Object} - Validation result
 */
async function validateParameters(parameters) {
  try {
    // Get categories and parameters from database
    const { categories, parameters: dbParameters } = await databaseService.getData();
    
    // Create lookup maps for faster validation
    const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
    const parameterMap = new Map(dbParameters.map(param => [param.id, param]));
    
    // Check if parameters match expected structure
    for (const [categoryName, categoryParams] of Object.entries(parameters)) {
      // Find category by name
      const category = categories.find(c => c.name === categoryName);
      
      if (!category) {
        return { valid: false, message: `Category "${categoryName}" not found` };
      }
      
      if (category.visibility !== 'Show') {
        return { valid: false, message: `Category "${categoryName}" is not visible` };
      }
      
      // Check each parameter in the category
      for (const [paramName, paramValue] of Object.entries(categoryParams)) {
        // Find parameter by name and category
        const parameter = dbParameters.find(
          p => p.name === paramName && p.categoryId === category.id
        );
        
        if (!parameter) {
          return { valid: false, message: `Parameter "${paramName}" not found in category "${categoryName}"` };
        }
        
        if (parameter.visibility !== 'Basic' && parameter.visibility !== 'Advanced') {
          return { valid: false, message: `Parameter "${paramName}" is not visible` };
        }
        
        // Validate parameter value based on type
        const validationError = validateParameterValue(parameter, paramValue);
        if (validationError) {
          return { valid: false, message: validationError };
        }
      }
    }
    
    return { valid: true };
  } catch (error) {
    console.error('Error validating parameters:', error);
    return { valid: false, message: 'Error validating parameters' };
  }
}

/**
 * Validate a parameter value based on its type
 * @param {Object} parameter - Parameter definition
 * @param {*} value - Value to validate
 * @returns {String|null} - Error message or null if valid
 */
function validateParameterValue(parameter, value) {
  switch (parameter.type) {
    case 'Dropdown':
      if (!parameter.values.some(v => v.label === value)) {
        return `Value "${value}" is not valid for dropdown parameter "${parameter.name}"`;
      }
      break;
      
    case 'Slider':
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return `Value for slider parameter "${parameter.name}" must be a number`;
      }
      
      const min = parameter.config?.min || 0;
      const max = parameter.config?.max || 100;
      
      if (numValue < min || numValue > max) {
        return `Value ${value} is outside the range [${min}-${max}] for slider parameter "${parameter.name}"`;
      }
      break;
      
    case 'Toggle Switch':
      if (typeof value !== 'boolean') {
        return `Value for toggle parameter "${parameter.name}" must be a boolean`;
      }
      break;
      
    case 'Radio Buttons':
      if (!parameter.values.some(v => v.label === value)) {
        return `Value "${value}" is not valid for radio parameter "${parameter.name}"`;
      }
      break;
      
    case 'Checkbox':
      if (!Array.isArray(value)) {
        return `Value for checkbox parameter "${parameter.name}" must be an array`;
      }
      
      // Check if all selected values are valid
      for (const item of value) {
        if (!parameter.values.some(v => v.label === item)) {
          return `Value "${item}" is not valid for checkbox parameter "${parameter.name}"`;
        }
      }
      break;
      
    default:
      return `Unknown parameter type: ${parameter.type}`;
  }
  
  return null;
}

module.exports = generateController;