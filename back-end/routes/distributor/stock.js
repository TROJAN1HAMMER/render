const express = require('express');
const router = express.Router();

const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const stockController = require('../../controllers/stockController');

/**
 * @swagger
 * tags:
 *   name: Distributor Stock
 *   description: View and manage assigned stock
 */

router.use(authenticate);
router.use(authorizeRoles('Distributor'));

/**
 * @swagger
 * /distributor/stock:
 *   get:
 *     summary: Get stock assigned to the distributor
 *     tags: [Distributor Stock]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assigned stock
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', stockController.getAssignedStock);

/**
 * @swagger
 * /distributor/stock/{id}:
 *   put:
 *     summary: Update status of a specific stock item
 *     tags: [Distributor Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the stock item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *             example:
 *               status: "Delivered"
 *     responses:
 *       200:
 *         description: Stock status updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Stock item not found
 *       500:
 *         description: Server error
 */
router.put('/:id', stockController.updateStockStatus);

/**
 * @swagger
 * /distributor/stock/items:
 *   post:
 *     summary: Add new stock item
 *     tags: [Distributor Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               stockQuantity:
 *                 type: integer
 *               warrantyPeriodInMonths:
 *                 type: integer
 *               categoryId:
 *                 type: string
 *               location:
 *                 type: string
 *             required:
 *               - name
 *               - price
 *               - stockQuantity
 *               - warrantyPeriodInMonths
 *     responses:
 *       201:
 *         description: Stock item added successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/items', stockController.addStockItem);

/**
 * @swagger
 * /distributor/stock/items/{id}:
 *   delete:
 *     summary: Delete stock item
 *     tags: [Distributor Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Stock item ID to delete
 *     responses:
 *       200:
 *         description: Stock item deleted successfully
 *       400:
 *         description: Cannot delete item that is not available
 *       404:
 *         description: Stock item not found
 *       500:
 *         description: Server error
 */
router.delete('/items/:id', stockController.deleteStockItem);

/**
 * @swagger
 * /distributor/stock/items/{id}:
 *   put:
 *     summary: Update stock item
 *     tags: [Distributor Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Stock item ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               stockQuantity:
 *                 type: integer
 *               warrantyPeriodInMonths:
 *                 type: integer
 *               categoryId:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stock item updated successfully
 *       404:
 *         description: Stock item not found
 *       500:
 *         description: Server error
 */
router.put('/items/:id', stockController.updateStockItem);

module.exports = router;
