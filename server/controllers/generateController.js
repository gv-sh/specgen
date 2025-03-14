const aiService = require('../services/aiService');
const db = require('../services/databaseService');

/**
 * Controller for fiction generation
 */
const generateController = {
  /**
   * Generate fiction based on parameters
   */
  async generateFiction(req, res, next) {
    try {
      const { selectedParameters } = req.body;
      
      if (!selectedParameters || Object.keys(selectedParameters).length === 0) {
        const error = new Error('No parameters selected');
        error.statusCode = 400;
        return next(error);
      }
      
      // Format parameters for AI
      const formattedParameters = {};
      
      // Get all parameters from database
      const allParameters = await db.getAll('parameters');
      
      // Process each selected parameter
      for (const [paramId, value] of Object.entries(selectedParameters)) {
        // Skip empty values
        if (value === "" || value === null || value === undefined) {
          console.warn(`Empty value for parameter ${paramId}, skipping`);
          continue;
        }
        
        // Find the parameter definition
        const parameter = allParameters.find(p => p.id === paramId);
        
        if (!parameter) {
          console.warn(`Parameter ${paramId} not found in database`);
          // Instead of skipping, use a default value for testing
          formattedParameters[`Unknown Parameter (${paramId})`] = typeof value === 'string' ? value : JSON.stringify(value);
          continue;
        }
        
        // Format value based on parameter type
        let formattedValue;
        
        switch (parameter.type) {
          case 'Dropdown':
          case 'Radio':
            // Find the label for the selected value
            const selectedOption = parameter.values.find(v => v.id === value);
            formattedValue = selectedOption ? selectedOption.label : value;
            break;
            
          case 'Checkbox':
            // Multiple values might be selected, format as list
            if (Array.isArray(value)) {
              const selectedLabels = value.map(v => {
                const option = parameter.values.find(opt => opt.id === v);
                return option ? option.label : v;
              });
              formattedValue = selectedLabels.join(', ');
            } else {
              // Handle case where a single value is passed instead of an array
              const option = parameter.values.find(opt => opt.id === value);
              formattedValue = option ? option.label : value;
            }
            break;
            
          case 'Slider':
            // Slider value is just a number
            formattedValue = value.toString();
            break;
            
          case 'Toggle':
            // Toggle is a boolean, get the appropriate label
            const isTrue = value === true || value === "true" || value === 1 || value === "1";
            formattedValue = isTrue ? parameter.values.on : parameter.values.off;
            break;
            
          default:
            formattedValue = String(value);
        }
        
        // Add to formatted parameters
        formattedParameters[parameter.name] = formattedValue;
      }
      
      // If no valid parameters were processed, return an error
      if (Object.keys(formattedParameters).length === 0) {
        const error = new Error('No valid parameters provided');
        error.statusCode = 400;
        return next(error);
      }
      
      // Generate fiction using AI service
      const generatedFiction = await aiService.generateFiction(formattedParameters);
      
      res.json({
        fiction: generatedFiction,
        parameters: formattedParameters
      });
    } catch (error) {
      console.error('Generation error:', error);
      next(error);
    }
  }
};

module.exports = generateController;