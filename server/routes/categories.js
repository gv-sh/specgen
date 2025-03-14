// routes/categories.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

/**
 * GET /api/categories
 * Get all categories
 */
router.get('/', categoryController.getAllCategories);

/**
 * GET /api/categories/:id
 * Get a category by ID
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * POST /api/categories
 * Create a new category
 */
router.post('/', categoryController.createCategory);

/**
 * PUT /api/categories/:id
 * Update a category
 */
router.put('/:id', categoryController.updateCategory);

/**
 * DELETE /api/categories/:id
 * Delete a category and its parameters
 */
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;