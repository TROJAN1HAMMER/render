const express = require('express');
const router = express.Router();

const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const catalogController = require('../../controllers/catalogController');

/**
 * @swagger
 * tags:
 *   name: Distributor Catalog
 *   description: Product catalog accessible to Distributors
 */

router.use(authenticate);
router.use(authorizeRoles('Distributor'));

/**
 * @swagger
 * /distributor/catalog:
 *   get:
 *     summary: Get product catalog
 *     tags: [Distributor Catalog]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products in catalog
 *       401:
 *         description: Unauthorized or token missing
 *       403:
 *         description: Access denied (not a Distributor)
 *       500:
 *         description: Server error while fetching catalog
 */
router.get('/', catalogController.getCatalog);

module.exports = router;
