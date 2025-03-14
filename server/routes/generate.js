// routes/generate.js
const express = require('express');
const router = express.Router();
const generateController = require('../controllers/generateController');

/**
 * @swagger
 * tags:
 *   name: Generation
 *   description: Story generation endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GenerationParameters:
 *       type: object
 *       description: Dynamic object where keys are category names and values are parameter selections
 *       example:
 *         "Science Fiction":
 *           "Story Length": 5000
 *           "Include Aliens": true
 *           "Setting": "Deep Space"
 *         "Character Development":
 *           "Protagonist Type": "Anti-hero"
 *           "Character Count": 3
 *     GenerationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         content:
 *           type: string
 *           description: Generated story content
 *         metadata:
 *           type: object
 *           properties:
 *             model:
 *               type: string
 *               example: "gpt-3.5-turbo"
 *             tokens:
 *               type: integer
 *               example: 1250
 */

/**
 * @swagger
 * /api/generate:
 *   post:
 *     summary: Generate a story based on selected parameters
 *     tags: [Generation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GenerationParameters'
 *     responses:
 *       200:
 *         description: Story generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenerationResponse'
 *       400:
 *         description: Invalid parameters provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid parameters: Category 'Science Fiction' not found"
 *       500:
 *         description: AI service error or other server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Failed to connect to AI service"
 */
router.post('/', generateController.generate);

module.exports = router;