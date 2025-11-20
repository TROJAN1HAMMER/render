const express = require('express');
const router = express.Router();
const authorizeRoles = require('../../middlewares/roleCheck');
const authenticate = require('../../middlewares/auth');
const warrantyController = require('../../controllers/warrantyController');

/**
 * @swagger
 * tags:
 *   name: Plumber Warranty
 *   description: Warranty management for Plumbers
 */

router.use(authenticate);
router.use(authorizeRoles('Plumber'));

/**
 * @swagger
 * /user/warranty/register:
 *   post:
 *     summary: Register a new warranty
 *     tags: [Plumber Warranty]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - serialNumber
 *               - purchaseDate
 *               - warrantyMonths
 *             properties:
 *               productId:
 *                 type: string
 *                 description: Product ID
 *               serialNumber:
 *                 type: string
 *                 description: Product serial number
 *               purchaseDate:
 *                 type: string
 *                 format: date
 *                 description: Purchase date (YYYY-MM-DD)
 *               warrantyMonths:
 *                 type: number
 *                 description: Warranty period in months
 *     responses:
 *       201:
 *         description: Warranty registered successfully
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Serial number already registered
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/register', warrantyController.registerWarranty);

/**
 * @swagger
 * /user/warranty/validate:
 *   post:
 *     summary: Validate a warranty by scanning QR code
 *     tags: [Plumber Warranty]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: JSON data from QR code scan
 *     responses:
 *       200:
 *         description: Warranty validated successfully
 *       400:
 *         description: Invalid QR data
 *       404:
 *         description: Warranty not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/validate', warrantyController.validateWarranty);

module.exports = router;
