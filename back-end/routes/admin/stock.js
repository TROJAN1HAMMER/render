const express = require('express');
const router = express.Router();

const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const stockController = require('../../controllers/stockController');

/**
 * @swagger
 * tags:
 *   name: Stock
 *   description: Admin stock management APIs
 */

router.use(authenticate);
router.use(authorizeRoles('Admin',"SalesManager"));

/**
 * @swagger
 * /admin/stock:
 *   post:
 *     summary: Create a new stock entry
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Stock data to create
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "abc123"
 *               quantity:
 *                 type: number
 *                 example: 100
 *               location:
 *                 type: string
 *                 example: "Warehouse A"
 *     responses:
 *       201:
 *         description: Stock created
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post('/', stockController.createStock);

/**
 * @swagger
 * /admin/stock:
 *   get:
 *     summary: Get all stock entries
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of stock entries
 *       500:
 *         description: Server error
 */
router.get('/', stockController.getAllStock);

/**
 * @swagger
 * /admin/stock/{id}:
 *   put:
 *     summary: Update stock entry by ID
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the stock to update
 *     requestBody:
 *       description: Updated stock data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 example: 120
 *               location:
 *                 type: string
 *                 example: "Warehouse B"
 *     responses:
 *       200:
 *         description: Stock updated
 *       404:
 *         description: Stock not found
 *       500:
 *         description: Server error
 */
router.put('/:id', stockController.updateStock);

/**
 * @swagger
 * /admin/stock/cleanup-broken:
 *   delete:
 *     summary: Cleanup broken stock entries
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Broken stock entries cleaned
 *       500:
 *         description: Server error
 */
router.delete('/cleanup-broken', stockController.cleanup);

/**
 * @swagger
 * /admin/stock/{id}:
 *   delete:
 *     summary: Delete stock entry by ID
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the stock to delete
 *     responses:
 *       200:
 *         description: Stock deleted
 *       404:
 *         description: Stock not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', stockController.deleteStock);

module.exports = router;
