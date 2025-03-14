// routes/generate.js
const express = require('express');
const router = express.Router();
const generateController = require('../controllers/generateController');

/**
 * POST /api/generate
 * Generate content based on submitted parameters
 */
router.post('/', generateController.generate);

module.exports = router;