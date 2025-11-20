const express = require('express');
const router = express.Router();

const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const searchController = require('../../controllers/searchController');

/**
 * @swagger
 * tags:
 *   name: Admin Search
 *   description: Admin-level search endpoints for users, products, and orders
 */

router.use(authenticate);
router.use(authorizeRoles('Admin',"SalesManager"));

/**
 * @swagger
 * /admin/search/users:
 *   get:
 *     summary: Search users
 *     tags: [Admin Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Keyword to search by name, email, etc.
 *     responses:
 *       200:
 *         description: Matching users returned
 *       500:
 *         description: Server error
 */
router.get('/users', searchController.searchUsers);

/**
 * @swagger
 * /admin/search/products:
 *   get:
 *     summary: Search products
 *     tags: [Admin Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Product name, code, etc.
 *     responses:
 *       200:
 *         description: Matching products returned
 *       500:
 *         description: Server error
 */
router.get('/products', searchController.searchProducts);

/**
 * @swagger
 * /admin/search/orders:
 *   get:
 *     summary: Search orders
 *     tags: [Admin Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Order ID, user info, etc.
 *     responses:
 *       200:
 *         description: Matching orders returned
 *       500:
 *         description: Server error
 */
router.get('/orders', searchController.searchOrders);

module.exports = router;
