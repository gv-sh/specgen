// routes/parameters.js
const express = require('express');
const router = express.Router();
const parameterController = require('../controllers/parameterController');

/**
 * GET /api/parameters
 * Get all parameters (optionally filtered by categoryId)
 */
router.get('/', parameterController.getAllParameters);

/**
 * GET /api/parameters/:id
 * Get a parameter by ID
 */
router.get('/:id', parameterController.getParameterById);

/**
 * POST /api/parameters
 * Create a new parameter
 */
router.post('/', parameterController.createParameter);

/**
 * PUT /api/parameters/:id
 * Update a parameter
 */
router.put('/:id', parameterController.updateParameter);

/**
 * DELETE /api/parameters/:id
 * Delete a parameter
 */
router.delete('/:id', parameterController.deleteParameter);

module.exports = router;