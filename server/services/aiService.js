// services/aiService.js
const axios = require('axios');

/**
 * Service for interacting with OpenAI API
 */
class AIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';
    
    if (!this.apiKey) {
      console.warn('WARNING: OPENAI_API_KEY not set in environment variables');
    }
  }

  /**
   * Generate content based on provided parameters
   * @param {Object} parameters - User-selected parameters for generation
   * @returns {Promise<Object>} - Generated content from OpenAI
   */
  async generateContent(parameters) {
    try {
      // Format parameters into a prompt
      const prompt = this.formatPrompt(parameters);
      
      // Call OpenAI API
      const response = await axios.post(
        this.baseUrl,
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a speculative fiction generator that creates content based on user parameters."
            },
            {
              role: "user",
              content: prompt
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      
      // Extract the generated content from response
      return {
        success: true,
        content: response.data.choices[0].message.content,
        metadata: {
          model: response.data.model,
          tokens: response.data.usage.total_tokens
        }
      };
    } catch (error) {
      console.error('Error calling OpenAI API:', error.response ? error.response.data : error.message);
      return {
        success: false,
        error: error.response ? error.response.data.error.message : error.message
      };
    }
  }

  /**
   * Format user parameters into a prompt for OpenAI
   * @param {Object} parameters - User-selected parameters
   * @returns {String} - Formatted prompt
   */
  formatPrompt(parameters) {
    let prompt = "Generate a speculative fiction story with the following elements:\n\n";
    
    // Add each category and its selected parameters to the prompt
    Object.entries(parameters).forEach(([categoryName, categoryParams]) => {
      prompt += `${categoryName}:\n`;
      
      // Add each parameter and its value
      Object.entries(categoryParams).forEach(([paramName, paramValue]) => {
        // Handle different parameter types
        if (Array.isArray(paramValue)) {
          // For multi-select parameters (checkboxes)
          prompt += `- ${paramName}: ${paramValue.join(', ')}\n`;
        } else if (typeof paramValue === 'boolean') {
          // For toggle parameters
          prompt += `- ${paramName}: ${paramValue ? 'Yes' : 'No'}\n`;
        } else {
          // For other parameter types (dropdown, radio, slider)
          prompt += `- ${paramName}: ${paramValue}\n`;
        }
      });
      
      prompt += '\n';
    });
    
    prompt += "Create a compelling and imaginative story that incorporates these elements. The story should be around 1000 words.";
    
    return prompt;
  }
}

module.exports = new AIService();