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
        // Find the parameter definition
        const parameter = allParameters.find(p => p.id === paramId);
        
        if (!parameter) {
          console.warn(`Parameter ${paramId} not found in database`);
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
              formattedValue = value;
            }
            break;
            
          case 'Slider':
            // Slider value is just a number
            formattedValue = value;
            break;
            
          case 'Toggle':
            // Toggle is a boolean, get the appropriate label
            formattedValue = value ? parameter.values.on : parameter.values.off;
            break;
            
          default:
            formattedValue = value;
        }
        
        // Add to formatted parameters
        formattedParameters[parameter.name] = formattedValue;
      }
      
      // Generate fiction using AI service
      const generatedFiction = await aiService.generateFiction(formattedParameters);
      
      res.json({
        fiction: generatedFiction,
        parameters: formattedParameters
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = generateController;