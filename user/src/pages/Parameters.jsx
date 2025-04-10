import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Button, CircularProgress, 
  Alert, Paper, Divider, Grid, Accordion, AccordionSummary,
  AccordionDetails, RadioGroup, FormControlLabel, Radio, Card, CardContent
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { fetchParameters } from '../services/api';
import { 
  DropdownParameter, 
  SliderParameter, 
  ToggleParameter, 
  RadioParameter, 
  CheckboxParameter 
} from '../components/parameters';

const Parameters = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedCategories = location.state?.selectedCategories || [];
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parameters, setParameters] = useState([]);
  const [parameterValues, setParameterValues] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [generationType, setGenerationType] = useState('fiction');
  
  // Redirect if no categories are selected
  useEffect(() => {
    if (selectedCategories.length === 0) {
      navigate('/categories');
    }
  }, [selectedCategories, navigate]);
  
  // Fetch parameters for selected categories
  useEffect(() => {
    const fetchParametersForCategories = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const parameterData = {};
        const allParameters = [];
        
        // Fetch parameters for each selected category
        for (const category of selectedCategories) {
          const result = await fetchParameters(category.id);
          
          // Extract parameters from the data property in the API response
          const categoryParameters = result.data || [];
          
          if (categoryParameters.length > 0) {
            allParameters.push(...categoryParameters);
            
            // Initialize parameter values
            categoryParameters.forEach(param => {
              const categoryParams = parameterValues[category.id] || {};
              
              // Set initial values based on parameter type
              if (!categoryParams[param.id]) {
                switch (param.type) {
                  case 'Dropdown':
                    categoryParams[param.id] = param.values[0]?.id || '';
                    break;
                  case 'Radio':
                    categoryParams[param.id] = param.values[0]?.value || '';
                    break;
                  case 'Slider':
                    categoryParams[param.id] = param.config?.default || param.config?.min || 0;
                    break;
                  case 'Toggle Switch':
                    categoryParams[param.id] = false;
                    break;
                  case 'Checkbox':
                    categoryParams[param.id] = [];
                    break;
                  default:
                    categoryParams[param.id] = '';
                }
              }
              
              parameterData[category.id] = categoryParams;
            });
          }
        }
        
        setParameters(allParameters);
        setParameterValues(parameterData);
      } catch (err) {
        console.error('Error fetching parameters:', err);
        setError('Failed to load parameters. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (selectedCategories.length > 0) {
      fetchParametersForCategories();
    }
  }, [selectedCategories]);
  
  // Handle parameter value changes
  const handleParameterChange = (categoryId, parameterId, newValue) => {
    setParameterValues(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [parameterId]: newValue
      }
    }));
    
    // Clear validation error when value is updated
    if (validationErrors[parameterId]) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[parameterId];
        return newErrors;
      });
    }
  };
  
  // Handle generation type change
  const handleGenerationTypeChange = (event) => {
    setGenerationType(event.target.value);
  };
  
  // Validate parameters before generating
  const validateParameters = () => {
    // We're suppressing validation errors, so always return true
    // Just keep track of what errors we would have shown for debugging purposes
    const debugErrors = {};
    
    parameters.forEach(param => {
      const value = parameterValues[param.categoryId]?.[param.id];
      
      // Check for potential issues but don't block submission
      switch (param.type) {
        case 'Dropdown':
          if (!value) {
            debugErrors[param.id] = `Missing value for ${param.name}`;
          }
          break;
        case 'Radio':
          if (!value) {
            debugErrors[param.id] = `Missing value for ${param.name}`;
          }
          break;
        case 'Checkbox':
          if (!Array.isArray(value) || value.length === 0) {
            debugErrors[param.id] = `No options selected for ${param.name}`;
          }
          break;
        default:
          break;
      }
    });
    
    // Log issues for debugging but don't show to user
    if (Object.keys(debugErrors).length > 0) {
      console.log('Non-blocking parameter warnings:', debugErrors);
    }
    
    // Clear any existing validation errors in the UI
    setValidationErrors({});
    
    // Always return true to let the user proceed
    return true;
  };
  
  // Handle generation button click
  const handleGenerate = () => {
    // Skip validation and just proceed with whatever data we have
    // Create a clean parameter values object that excludes null/empty values
    const cleanParameterValues = {};
    
    // Process each category
    Object.entries(parameterValues).forEach(([categoryId, categoryParams]) => {
      cleanParameterValues[categoryId] = {};
      
      // Filter out null/empty values from each category
      Object.entries(categoryParams).forEach(([paramId, value]) => {
        // Skip null/undefined values
        if (value === null || value === undefined) return;
        
        // Skip empty strings
        if (value === '') return;
        
        // Skip empty arrays
        if (Array.isArray(value) && value.length === 0) return;
        
        // Otherwise include the parameter
        cleanParameterValues[categoryId][paramId] = value;
      });
      
      // If category has no parameters after filtering, remove it
      if (Object.keys(cleanParameterValues[categoryId]).length === 0) {
        delete cleanParameterValues[categoryId];
      }
    });
    
    navigate('/generate', { 
      state: { 
        parameterValues: cleanParameterValues, 
        categoryIds: selectedCategories.map(cat => cat.id),
        generationType
      } 
    });
  };
  
  // Render parameter component based on type
  const renderParameter = (parameter) => {
    const categoryId = parameter.categoryId;
    const value = parameterValues[categoryId]?.[parameter.id];
    const error = validationErrors[parameter.id];
    
    switch (parameter.type) {
      case 'Dropdown':
        return (
          <DropdownParameter
            parameter={parameter}
            value={value}
            onChange={(newValue) => handleParameterChange(categoryId, parameter.id, newValue)}
            error={error}
          />
        );
      case 'Slider':
        return (
          <SliderParameter
            parameter={parameter}
            value={value !== null ? value : parameter.defaultValue}
            onChange={(newValue) => handleParameterChange(categoryId, parameter.id, newValue)}
            error={error}
          />
        );
      case 'Toggle Switch':
        return (
          <ToggleParameter
            parameter={parameter}
            value={value !== null ? value : false}
            onChange={(newValue) => handleParameterChange(categoryId, parameter.id, newValue)}
            error={error}
          />
        );
      case 'Radio':
        return (
          <RadioParameter
            parameter={parameter}
            value={value}
            onChange={(newValue) => handleParameterChange(categoryId, parameter.id, newValue)}
            error={error}
          />
        );
      case 'Checkbox':
        return (
          <CheckboxParameter
            parameter={parameter}
            value={value || []}
            onChange={(newValue) => handleParameterChange(categoryId, parameter.id, newValue)}
            error={error}
          />
        );
      default:
        return (
          <Typography color="error">
            Unknown parameter type: {parameter.type}
          </Typography>
        );
    }
  };
  
  // Group parameters by category
  const parametersByCategory = {};
  selectedCategories.forEach(category => {
    parametersByCategory[category.id] = parameters.filter(param => param.categoryId === category.id);
  });
  
  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading parameters...</Typography>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button variant="contained" onClick={() => navigate('/categories')}>
            Back to Categories
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Set Parameters
        </Typography>
        
        <Typography variant="subtitle1" gutterBottom>
          Selected categories: {selectedCategories.map(cat => cat.name).join(', ')}
        </Typography>
        
        {/* Generation Type Selection */}
        <Card sx={{ mb: 3, mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              What would you like to generate?
            </Typography>
            <RadioGroup
              row
              value={generationType}
              onChange={handleGenerationTypeChange}
            >
              <FormControlLabel value="fiction" control={<Radio />} label="Fiction Story" />
              <FormControlLabel value="image" control={<Radio />} label="AI Image" />
            </RadioGroup>
          </CardContent>
        </Card>
        
        {Object.keys(validationErrors).length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Please fix the errors below before continuing.
          </Alert>
        )}
        
        <Box sx={{ mt: 3 }}>
          {selectedCategories.map(category => (
            <Accordion key={category.id} defaultExpanded sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">{category.name}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {parametersByCategory[category.id].length > 0 ? (
                    parametersByCategory[category.id].map(parameter => (
                      <Grid item xs={12} key={parameter.id}>
                        <Box sx={{ mb: 2 }}>
                          {renderParameter(parameter)}
                        </Box>
                        <Divider />
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography>No parameters available for this category.</Typography>
                    </Grid>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/categories')}
          >
            Back to Categories
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleGenerate}
            disabled={parameters.length === 0}
          >
            {generationType === 'fiction' ? 'Generate Story' : 'Generate Image'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Parameters; 