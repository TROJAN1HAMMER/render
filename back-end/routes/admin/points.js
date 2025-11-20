const express = require('express');
const router = express.Router();

const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const pointController = require('../../controllers/pointController');

/**
 * @swagger
 * tags:
 *   name: Admin Points
 *   description: Admin management of point transactions
 */

router.use(authenticate);
router.use(authorizeRoles('Admin',"SalesManager"));

/**
 * @swagger
 * /admin/points:
 *   get:
 *     summary: View all point transactions
 *     tags: [Admin Points]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [credit, debit]
 *         description: Filter by transaction type
 *     responses:
 *       200:
 *         description: List of point transactions
 *       500:
 *         description: Failed to fetch transactions
 */
router.get('/', pointController.getAllTransactions);

/**
 * @swagger
 * /admin/points/adjust:
 *   post:
 *     summary: Adjust points for a user (credit or debit)
 *     tags: [Admin Points]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Details for adjusting points
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - type
 *               - amount
 *             properties:
 *               userId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [credit, debit]
 *               amount:
 *                 type: number
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Points adjusted successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Failed to adjust points
 */
router.post('/adjust', pointController.adjustPoints);

/**
 * @swagger
 * /admin/points/convert:
 *   post:
 *     summary: Convert user points to cash
 *     tags: [Admin Points]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Details for converting points to cash
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - points
 *               - conversionRate
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID whose points will be converted
 *               points:
 *                 type: number
 *                 description: Number of points to convert
 *               conversionRate:
 *                 type: number
 *                 description: Rate at which points are converted to cash
 *               reason:
 *                 type: string
 *                 description: Reason for conversion
 *     responses:
 *       200:
 *         description: Points converted to cash successfully
 *       400:
 *         description: Invalid input or insufficient points
 *       500:
 *         description: Failed to convert points
 */
router.post('/convert', pointController.convertPointsToCash);

module.exports = router;
