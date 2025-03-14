const express = require('express');
const parameterController = require('../controllers/parameterController');

const router = express.Router();

// GET /api/parameters - Get all parameters
router.get('/', parameterController.getAllParameters);

// GET /api/parameters/:id - Get parameter by ID
router.get('/:id', parameterController.getParameterById);

// POST /api/parameters - Create a new parameter
router.post('/', parameterController.createParameter);

// PUT /api/parameters/:id - Update a parameter
router.put('/:id', parameterController.updateParameter);

// DELETE /api/parameters/:id - Delete a parameter
router.delete('/:id', parameterController.deleteParameter);

module.exports = router;