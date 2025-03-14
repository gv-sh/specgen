const express = require('express');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

// GET /api/categories - Get all categories
router.get('/', categoryController.getAllCategories);

// GET /api/categories/:id - Get category by ID
router.get('/:id', categoryController.getCategoryById);

// POST /api/categories - Create a new category
router.post('/', categoryController.createCategory);

// PUT /api/categories/:id - Update a category
router.put('/:id', categoryController.updateCategory);

// DELETE /api/categories/:id - Delete a category
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;