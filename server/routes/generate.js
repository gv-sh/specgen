const express = require('express');
const generateController = require('../controllers/generateController');

const router = express.Router();

// POST /api/generate - Generate fiction based on parameters
router.post('/', generateController.generateFiction);

module.exports = router;