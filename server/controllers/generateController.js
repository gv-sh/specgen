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
      // Extract data from request body
      const { parameterValues, categoryIds, generationType = 'fiction' } = req.body;
      
      // Validate input
      if (!parameterValues || Object.keys(parameterValues).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No parameters provided for generation'
        });
      }
      
      // Validate generation type
      if (!['fiction', 'image'].includes(generationType)) {
        return res.status(400).json({
          success: false,
          error: `Invalid generation type: "${generationType}". Valid types are "fiction" and "image".`
        });
      }
      
      // Get database data
      const { categories, parameters } = await databaseService.getData();
      
      // Create parameter map for quick lookups
      const parameterMap = new Map();
      parameters.forEach(param => parameterMap.set(param.id, param));
      
      // Create category map for quick lookups
      const categoryMap = new Map();
      categories.forEach(cat => categoryMap.set(cat.id, cat));
      
      // Build a structured parameters object with names for the AI service
      const formattedParameters = {};
      
      // Process each category of parameters
      for (const [categoryId, categoryParams] of Object.entries(parameterValues)) {
        // Find the category by ID
        const category = categoryMap.get(categoryId);
        
        if (!category) {
          return res.status(400).json({
            success: false,
            error: `Category "${categoryId}" not found`
          });
        }
        
        // Skip hidden categories
        if (category.visibility !== 'Show') {
          return res.status(400).json({
            success: false,
            error: `Category "${category.name}" is not visible`
          });
        }
        
        // Initialize the category in our formatted parameters
        formattedParameters[category.name] = {};
        
        // Process each parameter in this category
        for (const [paramId, paramValue] of Object.entries(categoryParams)) {
          // Find the parameter by ID
          const parameter = parameterMap.get(paramId);
          
          if (!parameter) {
            return res.status(400).json({
              success: false,
              error: `Parameter "${paramId}" not found`
            });
          }
          
          // Verify parameter belongs to the correct category
          if (parameter.categoryId !== category.id) {
            return res.status(400).json({
              success: false,
              error: `Parameter "${paramId}" does not belong to category "${category.name}"`
            });
          }
          
          // Skip hidden parameters
          if (parameter.visibility !== 'Basic' && parameter.visibility !== 'Advanced') {
            return res.status(400).json({
              success: false,
              error: `Parameter "${parameter.name}" is not visible`
            });
          }
          
          // Validate parameter value
          const validationError = validateParameterValue(parameter, paramValue);
          if (validationError) {
            return res.status(400).json({
              success: false,
              error: validationError
            });
          }
          
          // Add parameter to formatted parameters with its name (not ID)
          formattedParameters[category.name][parameter.name] = paramValue;
        }
      }
      
      // Generate content using AI service with specified generation type
      const result = await aiService.generateContent(formattedParameters, generationType);
      
      if (result.success) {
        // Structure response based on generation type
        const response = {
          success: true,
          metadata: result.metadata
        };
        
        // Add the appropriate content field based on generation type
        if (generationType === 'fiction') {
          response.content = result.content;
        } else if (generationType === 'image') {
          response.imageUrl = result.imageUrl;
        }
        
        res.status(200).json(response);
      } else {
        res.status(500).json({
          success: false,
          error: result.error || `Failed to generate ${generationType}`
        });
      }
    } catch (error) {
      console.error('Error in generate controller:', error);
      next(error);
    }
  }
};

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