import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Button, 
  CircularProgress, 
  Alert,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Tabs,
  Tab
} from '@mui/material';
import { generateFiction } from '../services/api';

const Generation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse parameter values and category IDs from location state
  const parameterValues = location.state?.parameterValues || {};
  const categoryIds = location.state?.categoryIds || [];
  const generationType = location.state?.generationType || 'fiction';
  
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to handle generation with better error handling
  const handleGeneration = async (params, categories, type) => {
    try {
      setLoading(true);
      setError(null);
      
      // Log parameters for debugging
      console.log('Generating with parameters:', params);
      console.log('Categories:', categories);
      console.log('Generation type:', type);
      
      // Call the API
      const response = await generateFiction(params, categories, type);
      
      // Check for success response
      if (response && response.success === true) {
        if (type === 'fiction') {
          setGeneratedContent(response.content || '');
        } else {
          setGeneratedImage(response.imageUrl || '');
        }
        return true;
      } else {
        throw new Error(response?.error || 'Server returned an unsuccessful response');
      }
    } catch (err) {
      // Enhanced error reporting
      console.error('Generation error:', err);
      
      let errorMessage = 'Failed to generate content';
      
      if (err.response) {
        // Server responded with an error
        const serverError = err.response.data?.error || err.response.statusText;
        errorMessage = `Server error: ${serverError} (${err.response.status})`;
        console.error('Server response:', err.response.data);
      } else if (err.request) {
        // Request was made but no response
        errorMessage = 'No response from server. Please check if the server is running.';
      } else {
        // Client-side error
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Generate content on initial load
  useEffect(() => {
    // Check if we have parameters
    if (!location.state || Object.keys(parameterValues).length === 0) {
      navigate('/categories');
      return;
    }
    
    // Generate content and fallback to sample if needed
    handleGeneration(parameterValues, categoryIds, generationType).then(success => {
      if (!success) {
        if (generationType === 'fiction') {
          // If fiction generation failed, set sample content
          setGeneratedContent(
            "This is a sample story based on a science fiction theme set in the near future.\n\n" +
            "The year is 2045, and the world has changed dramatically with the advent of widespread neural interfaces. These devices, small enough to be implanted behind the ear, give people the ability to connect directly to the global network with a thought.\n\n" +
            "Maria Chen, a network security specialist, has been investigating a series of unusual disconnections affecting users in her district. The official explanation from NetCore, the company that maintains the neural interface infrastructure, is routine maintenance and occasional packet loss.\n\n" +
            "But Maria has noticed a pattern. The disconnections always happen at 3:42 AM local time, regardless of the user's location, and they always last exactly 7 seconds.\n\n" +
            "Tonight, Maria has set an alarm for 3:30 AM. She sits in her apartment, neural interface active, monitoring her own connection. As the clock ticks toward the designated time, she prepares a suite of diagnostic tools to capture whatever happens.\n\n" +
            "3:42 AM arrives. Maria feels the momentary disorientation of her neural link severing, but instead of waiting passively, she triggers her offline recording system.\n\n" +
            "Seven seconds later, when the connection reestablishes, Maria reviews what her system captured. What she discovers sends a chill down her spine. During those seven seconds, a foreign signal had briefly replaced the NetCore stream—something ancient, powerful, and unmistakably non-human in origin.\n\n" +
            "The signal contained a message that repeated in every known human language:\n\n" +
            "'Preparation 67% complete. Arrival in 33 days.'"
          );
        } else {
          // If image generation failed, set a placeholder image
          setGeneratedImage('https://via.placeholder.com/800x600?text=Sample+AI+Generated+Image');
        }
      }
    });
  }, [location.state, parameterValues, categoryIds, generationType, navigate]);

  // Handle regenerate button click
  const handleRegenerate = () => {
    // Attempt to regenerate with the API
    handleGeneration(parameterValues, categoryIds, generationType).then(success => {
      if (!success) {
        if (generationType === 'fiction') {
          // If regeneration failed, use a fallback story
          const sampleStories = [
            "In the year 2052, the streets of New Tokyo buzzed with the electric hum of personal hover vehicles. Taro Yamada, a neural interface technician, discovered strange anomalies in the city's automated systems...",
            
            "The space station Horizon orbited Earth silently, its observation deck offering an unparalleled view of the blue planet below. Commander Ellis stared at the notification blinking on her neural implant: 'Quantum anomaly detected in sector 7...'",
            
            "The neural interface felt cold against Maya's temple as she activated it for the first time. The world around her shimmered and expanded, revealing layers of digital information overlaid on physical reality..."
          ];
          
          // Pick a random story
          const randomStory = sampleStories[Math.floor(Math.random() * sampleStories.length)];
          setGeneratedContent(randomStory);
        } else {
          // If image regeneration failed, use a different placeholder image
          const placeholderImages = [
            'https://via.placeholder.com/800x600?text=AI+Generated+Space+Scene',
            'https://via.placeholder.com/800x600?text=AI+Generated+Fantasy+World',
            'https://via.placeholder.com/800x600?text=AI+Generated+Futuristic+City'
          ];
          
          // Pick a random placeholder
          const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
          setGeneratedImage(randomImage);
        }
      }
    });
  };

  // Handle back button click
  const handleBack = () => {
    navigate('/parameters', { 
      search: categoryIds.length > 0 ? `?categories=${categoryIds.join(',')}` : '',
      state: { parameterValues, generationType }
    });
  };

  // Display loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: 8 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {generationType === 'fiction' ? 'Generating your story...' : 'Generating your image...'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This may take a few moments
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        {generationType === 'fiction' ? 'Your Generated Story' : 'Your Generated Image'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {generationType === 'fiction' ? (
        // Fiction display
        <Paper sx={{ p: 3, mb: 4 }}>
          {generatedContent ? (
            <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
              {generatedContent}
            </Typography>
          ) : (
            <Card sx={{ minHeight: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CardContent>
                <Typography variant="body1" color="text.secondary" align="center">
                  No content generated yet. Click "Regenerate" to create a story.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Paper>
      ) : (
        // Image display
        <Paper sx={{ p: 3, mb: 4 }}>
          {generatedImage ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Card sx={{ maxWidth: '100%', mb: 2 }}>
                <CardMedia
                  component="img"
                  image={generatedImage}
                  alt="AI Generated Image"
                  sx={{ width: '100%', maxHeight: '600px', objectFit: 'contain' }}
                />
              </Card>
            </Box>
          ) : (
            <Card sx={{ minHeight: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CardContent>
                <Typography variant="body1" color="text.secondary" align="center">
                  No image generated yet. Click "Regenerate" to create an image.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button 
          variant="outlined" 
          onClick={handleBack}
        >
          Back to Parameters
        </Button>
        <Button 
          variant="contained" 
          onClick={handleRegenerate}
        >
          Regenerate {generationType === 'fiction' ? 'Story' : 'Image'}
        </Button>
      </Box>
    </Container>
  );
};

export default Generation; 