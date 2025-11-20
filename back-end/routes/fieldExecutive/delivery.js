const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const deliveryController = require('../../controllers/deliveryController');

/**
 * @swagger
 * tags:
 *   name: Field Executive Delivery
 *   description: Delivery report management for Field Executives
 */

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * /fieldExecutive/delivery:
 *   post:
 *     summary: Submit a delivery report (Field Executive)
 *     tags: [Field Executive Delivery]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product
 *               - quantity
 *             properties:
 *               product:
 *                 type: string
 *               quantity:
 *                 type: number
 *               isForecasted:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Delivery report submitted successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', authorizeRoles('FieldExecutive'), deliveryController.submitDelivery);

/**
 * @swagger
 * /fieldExecutive/delivery:
 *   get:
 *     summary: Get own delivery reports (Field Executive)
 *     tags: [Field Executive Delivery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of delivery reports
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authorizeRoles('FieldExecutive'), deliveryController.getMyDeliveries);

module.exports = router;
