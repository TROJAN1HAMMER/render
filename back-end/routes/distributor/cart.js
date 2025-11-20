const express = require('express');
const router = express.Router();

const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const cartController = require('../../controllers/cartController');

/**
 * @swagger
 * tags:
 *   name: Distributor Cart
 *   description: Shopping cart operations for Distributors
 */

router.use(authenticate);
router.use(authorizeRoles('Distributor'));

/**
 * @swagger
 * /distributor/cart:
 *   post:
 *     summary: Add item to cart
 *     tags: [Distributor Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *             required:
 *               - productId
 *               - quantity
 *     responses:
 *       200:
 *         description: Item added to cart successfully
 *       400:
 *         description: Invalid input or insufficient stock
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.post('/', cartController.addToCart);

/**
 * @swagger
 * /distributor/cart:
 *   get:
 *     summary: Get user's cart
 *     tags: [Distributor Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', cartController.getCart);

/**
 * @swagger
 * /distributor/cart/items/{itemId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Distributor Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the cart item to remove
 *     responses:
 *       200:
 *         description: Item removed from cart successfully
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */
router.delete('/items/:itemId', cartController.removeFromCart);

/**
 * @swagger
 * /distributor/cart:
 *   delete:
 *     summary: Clear entire cart
 *     tags: [Distributor Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       500:
 *         description: Server error
 */
router.delete('/', cartController.clearCart);

module.exports = router;

