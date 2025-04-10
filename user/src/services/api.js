import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const fetchParameters = async (categoryId) => {
  try {
    const response = await api.get(`/parameters?categoryId=${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching parameters for category ${categoryId}:`, error);
    throw error;
  }
};

export const generateContent = async (parameters) => {
  try {
    const response = await api.post('/generate', parameters);
    return response.data;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
};

export const generateFiction = async (parameterValues, categoryIds, generationType = 'fiction') => {
  try {
    const payload = {
      parameterValues,
      categoryIds,
      generationType
    };
    
    console.log(`Sending ${generationType} generation request:`, payload);
    
    const response = await api.post('/generate', payload);
    return response.data;
  } catch (error) {
    console.error(`Error generating ${generationType}:`, error);
    throw error;
  }
};

export default api; 