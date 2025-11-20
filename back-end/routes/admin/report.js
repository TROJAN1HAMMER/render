const express = require('express');
const router = express.Router();

const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const reportController = require('../../controllers/reportController');

/**
 * @swagger
 * tags:
 *   name: Admin Reports
 *   description: Reporting and analytics for Admin
 */

router.use(authenticate);
router.use(authorizeRoles('Admin',"SalesManager"));

/**
 * @swagger
 * /admin/reports/sales:
 *   get:
 *     summary: Get sales report
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter up to this date
 *     responses:
 *       200:
 *         description: Sales report data
 *       500:
 *         description: Failed to generate sales report
 */
router.get('/sales', reportController.getSalesReport);

/**
 * @swagger
 * /admin/reports/inventory:
 *   get:
 *     summary: Get inventory report
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory report data
 *       500:
 *         description: Failed to generate inventory report
 */
router.get('/inventory', reportController.getInventoryReport);

/**
 * @swagger
 * /admin/reports/performance:
 *   get:
 *     summary: Get performance report
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Performance report data
 *       500:
 *         description: Failed to generate performance report
 */
router.get('/performance', reportController.getPerformanceReport);

/**
 * @swagger
 * /admin/reports/individual:
 *   get:
 *     summary: Get individual user performance report
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID for the report
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter up to this date
 *       - in: query
 *         name: reportType
 *         schema:
 *           type: string
 *           enum: [sales, attendance, points, performance]
 *         description: Type of report to generate
 *     responses:
 *       200:
 *         description: Individual report data
 *       400:
 *         description: Missing user ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to generate individual report
 */
router.get('/individual', reportController.getIndividualReport);


module.exports = router;
