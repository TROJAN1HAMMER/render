const express = require('express');
const router = express.Router();
const authorizeRoles = require('../../middlewares/roleCheck');
const authenticate = require('../../middlewares/auth');
const deliveryReportController = require('../../controllers/deliveryReportController');

/**
 * @swagger
 * tags:
 *   name: Plumber Delivery Reports
 *   description: Delivery report management for Plumbers
 */

router.use(authenticate);
router.use(authorizeRoles('Plumber'));

/**
 * @swagger
 * /user/delivery-report:
 *   post:
 *     summary: Submit a delivery report
 *     tags: [Plumber Delivery Reports]
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
 *                 description: Product name or description
 *               quantity:
 *                 type: number
 *                 description: Quantity delivered
 *               qrRequested:
 *                 type: boolean
 *                 description: Whether QR code is requested
 *     responses:
 *       201:
 *         description: Delivery report submitted successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', deliveryReportController.submitDeliveryReport);

module.exports = router;
