const express = require('express');
const router = express.Router();

const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const warrantyCardController = require('../../controllers/warrantyCardController');

/**
 * @swagger
 * tags:
 *   name: WarrantyCards
 *   description: Admin warranty card management
 */

router.use(authenticate);
router.use(authorizeRoles('Admin',"SalesManager"));

/**
 * @swagger
 * /admin/warranty-cards:
 *   get:
 *     summary: List all warranty cards
 *     tags: [WarrantyCards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *         description: Optional filter by product ID
 *       - in: query
 *         name: serialNumber
 *         schema:
 *           type: string
 *         description: Optional filter by serial number
 *     responses:
 *       200:
 *         description: List of warranty cards
 *       500:
 *         description: Server error
 */
router.get('/', warrantyCardController.getAllWarrantyCards);

/**
 * @swagger
 * /admin/warranty-cards/{id}:
 *   get:
 *     summary: Get warranty card details by ID
 *     tags: [WarrantyCards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Warranty card ID
 *     responses:
 *       200:
 *         description: Warranty card details
 *       404:
 *         description: Warranty card not found
 *       500:
 *         description: Server error
 */
router.get('/:id', warrantyCardController.getWarrantyCardById);

/**
 * @swagger
 * /admin/warranty-cards/by-serial/{serialNumber}:
 *   get:
 *     summary: Get warranty card details by serial number
 *     tags: [WarrantyCards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serialNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Warranty card serial number
 *     responses:
 *       200:
 *         description: Warranty card details
 *       404:
 *         description: Warranty card not found
 *       500:
 *         description: Server error
 */
router.get('/by-serial/:serialNumber', warrantyCardController.getWarrantyCardBySerial);

module.exports = router;
