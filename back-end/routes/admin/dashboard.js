const express = require('express');
const router = express.Router();

const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const dashboardController = require('../../controllers/dashboardController');

/**
 * @swagger
 * tags:
 *   name: Admin Dashboard
 *   description: Admin-only access to dashboard analytics
 */

router.use(authenticate);
router.use(authorizeRoles('Admin'));

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get admin dashboard summary
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved successfully
 *       500:
 *         description: Failed to retrieve dashboard data
 */
router.get('/', dashboardController.getDashboardSummary);

module.exports = router;
