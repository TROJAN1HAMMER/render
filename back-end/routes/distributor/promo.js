const express = require('express');
const router = express.Router();

const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const promoCodeController = require('../../controllers/promoCodeController');

/**
 * @swagger
 * tags:
 *   name: Distributor Promo Codes
 *   description: Promo code operations for Distributors
 */

router.use(authenticate);
router.use(authorizeRoles('Distributor'));

/**
 * @swagger
 * /distributor/promo/apply:
 *   post:
 *     summary: Apply promo code to cart/order
 *     tags: [Distributor Promo Codes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               promoCode:
 *                 type: string
 *               orderAmount:
 *                 type: number
 *             required:
 *               - promoCode
 *               - orderAmount
 *     responses:
 *       200:
 *         description: Promo code applied successfully
 *       400:
 *         description: Invalid promo code or requirements not met
 *       404:
 *         description: Promo code not found
 *       500:
 *         description: Server error
 */
router.post('/apply', promoCodeController.applyPromoCode);

/**
 * @swagger
 * /distributor/promo/validate:
 *   post:
 *     summary: Validate promo code for order placement
 *     tags: [Distributor Promo Codes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               promoCode:
 *                 type: string
 *               orderAmount:
 *                 type: number
 *             required:
 *               - promoCode
 *               - orderAmount
 *     responses:
 *       200:
 *         description: Promo code validation result
 *       400:
 *         description: Validation failed
 *       500:
 *         description: Server error
 */
router.post('/validate', promoCodeController.validatePromoCode);

/**
 * @swagger
 * /distributor/promo/active:
 *   get:
 *     summary: Get all active promo codes
 *     tags: [Distributor Promo Codes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active promo codes
 *       500:
 *         description: Server error
 */
router.get('/active', promoCodeController.getActivePromoCodes);

/**
 * @swagger
 * /distributor/promo/by-code/{code}:
 *   get:
 *     summary: Get promo code details by code
 *     tags: [Distributor Promo Codes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Promo code string
 *     responses:
 *       200:
 *         description: Promo code details
 *       404:
 *         description: Promo code not found
 *       500:
 *         description: Server error
 */
router.get('/by-code/:code', promoCodeController.getPromoByCode);

module.exports = router;

