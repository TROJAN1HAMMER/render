const express = require('express');
const router = express.Router();

const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const orderController = require('../../controllers/orderController');

/**
 * @swagger
 * tags:
 *   name: Distributor Orders
 *   description: Order placement and viewing for Distributors
 */

router.use(authenticate);
router.use(authorizeRoles('Distributor'));

/**
 * @swagger
 * /distributor/order:
 *   post:
 *     summary: Place a new order
 *     tags: [Distributor Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 description: Array of order items
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                 example:
 *                   - productId: "prod123"
 *                     quantity: 5
 *     responses:
 *       201:
 *         description: Order placed successfully
 *       400:
 *         description: Invalid input (e.g. no items)
 *       500:
 *         description: Internal server error
 */
router.post('/', orderController.placeOrder);

/**
 * @swagger
 * /distributor/order:
 *   get:
 *     summary: Get all my orders
 *     tags: [Distributor Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', orderController.getMyOrders);

/**
 * @swagger
 * /distributor/order/{id}:
 *   get:
 *     summary: Track specific order
 *     tags: [Distributor Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID to track
 *     responses:
 *       200:
 *         description: Order details for tracking
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get('/:id', orderController.trackOrder);

/**
 * @swagger
 * /distributor/order/{id}/confirmation:
 *   get:
 *     summary: Get order confirmation details
 *     tags: [Distributor Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID for confirmation
 *     responses:
 *       200:
 *         description: Order confirmation details
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get('/:id/confirmation', orderController.getOrderConfirmation);

/**
 * @swagger
 * /distributor/order/with-promo:
 *   post:
 *     summary: Place order with promo code
 *     tags: [Distributor Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *               promoCode:
 *                 type: string
 *             required:
 *               - items
 *     responses:
 *       201:
 *         description: Order placed successfully with promo code
 *       400:
 *         description: Invalid input or promo code requirements not met
 *       500:
 *         description: Server error
 */
router.post('/with-promo', orderController.placeOrderWithPromo);

// /**
//  * @swagger
//  * /distributor/order/create:
//  *   post:
//  *     summary: Create a new order (basic without promo)
//  *     tags: [Distributor Orders]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               items:
//  *                 type: array
//  *                 description: Array of order items
//  *                 items:
//  *                   type: object
//  *                   properties:
//  *                     productId:
//  *                       type: string
//  *                     quantity:
//  *                       type: integer
//  *                 example:
//  *                   - productId: "prod123"
//  *                     quantity: 5
//  *     responses:
//  *       201:
//  *         description: Order created successfully
//  *       400:
//  *         description: Invalid input
//  *       500:
//  *         description: Server error
//  */
// router.post('/create', orderController.createOrder);

 module.exports = router;