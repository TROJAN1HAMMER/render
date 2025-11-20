const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const productionController = require('../../controllers/productionController');

/**
 * @swagger
 * tags:
 *   name: Production
 *   description: Production logging for Workers
 */

router.use(authenticate);
router.use(authorizeRoles('Worker'));

/**
 * @swagger
 * /worker/production:
 *   post:
 *     summary: Log new production entry
 *     tags: [Production]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Data for production log
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - item
 *               - quantity
 *             properties:
 *               item:
 *                 type: string
 *               quantity:
 *                 type: number
 *             example:
 *               item: Widget A
 *               quantity: 25
 *     responses:
 *       201:
 *         description: Production logged
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', productionController.logProduction);

/**
 * @swagger
 * /worker/production:
 *   get:
 *     summary: Get logged production records for the current Worker
 *     tags: [Production]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of production entries
 *       500:
 *         description: Server error
 */
router.get('/', productionController.getProductionLogs);

module.exports = router;
