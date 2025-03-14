const axios = require('axios');
require('dotenv').config();

/**
 * Service for OpenAI API integration
 */
class AIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1/chat/completions';
  }

  /**
   * Generate speculative fiction based on parameters
   */
  async generateFiction(parameters) {
    try {
      if (!this.apiKey) {
        throw new Error('OpenAI API key is not configured');
      }

      // Format the parameters for the prompt
      const formattedParams = Object.entries(parameters)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

      // Create the prompt for the AI
      const prompt = `Generate a short speculative fiction story based on the following parameters:\n\n${formattedParams}`;

      // Make request to OpenAI API
      const response = await axios.post(
        this.baseURL,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a creative speculative fiction writer who specializes in creating engaging and thought-provoking stories.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      // Extract the generated text
      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('AI generation failed:', error);
      
      // Provide more detailed error information
      if (error.response) {
        console.error('OpenAI API error:', error.response.data);
      }
      
      throw new Error('Failed to generate fiction: ' + (error.message || 'Unknown error'));
    }
  }
}

module.exports = new AIService();