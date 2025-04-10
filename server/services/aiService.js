// services/aiService.js
const axios = require('axios');

/**
 * Service for interacting with OpenAI API
 */
class AIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseUrl = 'https://api.openai.com/v1';
    this.chatCompletionUrl = `${this.baseUrl}/chat/completions`;
    this.imageGenerationUrl = `${this.baseUrl}/images/generations`;
    
    if (!this.apiKey) {
      console.warn('WARNING: OPENAI_API_KEY not set in environment variables');
    }
  }

  /**
   * Generate content based on provided parameters and type (fiction or image)
   * @param {Object} parameters - User-selected parameters for generation
   * @param {String} type - Type of content to generate ('fiction' or 'image')
   * @returns {Promise<Object>} - Generated content from OpenAI
   */
  async generateContent(parameters, type = 'fiction') {
    try {
      // Call appropriate generation method based on type
      if (type === 'fiction') {
        return this.generateFiction(parameters);
      } else if (type === 'image') {
        return this.generateImage(parameters);
      } else {
        throw new Error(`Unsupported generation type: ${type}`);
      }
    } catch (error) {
      console.error(`Error generating ${type}:`, error.response ? error.response.data : error.message);
      return {
        success: false,
        error: error.response ? error.response.data.error.message : error.message
      };
    }
  }

  /**
   * Generate fiction content based on provided parameters
   * @param {Object} parameters - User-selected parameters for fiction generation
   * @returns {Promise<Object>} - Generated fiction content from OpenAI
   */
  async generateFiction(parameters) {
    try {
      // Format parameters into a clean markdown prompt
      const prompt = this.formatFictionPrompt(parameters);
      
      // Call OpenAI API
      const response = await axios.post(
        this.chatCompletionUrl,
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a speculative fiction generator that creates compelling, imaginative stories based on the parameters provided by the user."
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
      console.error('Error calling OpenAI text generation API:', error.response ? error.response.data : error.message);
      return {
        success: false,
        error: error.response ? error.response.data.error.message : error.message
      };
    }
  }

  /**
   * Generate image based on provided parameters
   * @param {Object} parameters - User-selected parameters for image generation
   * @returns {Promise<Object>} - Generated image URL from OpenAI
   */
  async generateImage(parameters) {
    try {
      // Format parameters into a prompt for image generation
      const prompt = this.formatImagePrompt(parameters);
      
      // Call OpenAI API for image generation
      const response = await axios.post(
        this.imageGenerationUrl,
        {
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
          response_format: "url"
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      
      // Extract the generated image URL from response
      return {
        success: true,
        imageUrl: response.data.data[0].url,
        metadata: {
          model: "dall-e-3",
          prompt: prompt
        }
      };
    } catch (error) {
      console.error('Error calling OpenAI image generation API:', error.response ? error.response.data : error.message);
      return {
        success: false,
        error: error.response ? error.response.data.error.message : error.message
      };
    }
  }

  /**
   * Format user parameters into a clean markdown prompt for OpenAI text generation
   * @param {Object} parameters - User-selected parameters
   * @returns {String} - Formatted prompt
   */
  formatFictionPrompt(parameters) {
    // Extract the story length parameter if present
    let storyLength = 1000; // Default length in words
    let storyLengthFound = false;
    
    // Look for a story length parameter in any category
    Object.values(parameters).forEach(categoryParams => {
      Object.entries(categoryParams).forEach(([paramName, paramValue]) => {
        if (paramName.toLowerCase().includes('length') && typeof paramValue === 'number') {
          storyLength = paramValue;
          storyLengthFound = true;
        }
      });
    });
    
    // Start the prompt
    let prompt = "# Story Parameters\n\n";
    
    // Add each category and its selected parameters to the prompt as a clean markdown list
    Object.entries(parameters).forEach(([categoryName, categoryParams]) => {
      prompt += `## ${categoryName}\n\n`;
      
      // Add each parameter and its value
      Object.entries(categoryParams).forEach(([paramName, paramValue]) => {
        // Handle different parameter types with clean formatting
        if (Array.isArray(paramValue)) {
          // For multi-select parameters (checkboxes)
          prompt += `- **${paramName}**: ${paramValue.join(', ')}\n`;
        } else if (typeof paramValue === 'boolean') {
          // For toggle parameters
          prompt += `- **${paramName}**: ${paramValue ? 'Yes' : 'No'}\n`;
        } else {
          // For other parameter types (dropdown, radio, slider)
          prompt += `- **${paramName}**: ${paramValue}\n`;
        }
      });
      
      prompt += '\n';
    });
    
    // Add instructions for the story generation
    prompt += "# Instructions\n\n";
    prompt += `Please create a compelling and imaginative story that incorporates all the elements above. `;
    prompt += `The story should be approximately ${storyLength} words in length. `;
    prompt += `Focus on creating an engaging narrative with a clear beginning, middle, and end. `;
    prompt += `Be creative and develop the story elements that best fit these parameters.`;
    
    return prompt;
  }

  /**
   * Format user parameters into a prompt for DALL-E image generation
   * @param {Object} parameters - User-selected parameters
   * @returns {String} - Formatted prompt
   */
  formatImagePrompt(parameters) {
    let prompt = "Create a detailed, visually striking image with the following elements:\n\n";
    
    // Collect all parameter values for the image prompt
    Object.entries(parameters).forEach(([categoryName, categoryParams]) => {
      prompt += `${categoryName}: `;
      
      const paramValues = [];
      
      // Add each parameter and its value
      Object.entries(categoryParams).forEach(([paramName, paramValue]) => {
        // Handle different parameter types
        if (Array.isArray(paramValue)) {
          // For multi-select parameters (checkboxes)
          paramValues.push(`${paramName}: ${paramValue.join(', ')}`);
        } else if (typeof paramValue === 'boolean') {
          // For toggle parameters
          if (paramValue) {
            paramValues.push(paramName);
          }
        } else {
          // For other parameter types (dropdown, radio, slider)
          paramValues.push(`${paramName}: ${paramValue}`);
        }
      });
      
      prompt += paramValues.join(', ');
      prompt += '.\n';
    });
    
    // Add additional instructions for high-quality images
    prompt += "\nUse high-quality, photorealistic rendering with attention to lighting, detail, and composition. The image should be visually cohesive and striking.";
    
    return prompt;
  }
}

module.exports = new AIService();