const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const shiftAlertController = require('../../controllers/shiftAlertController');

/**
 * @swagger
 * tags:
 *   name: Shift Alerts
 *   description: Admin and SalesManager shift alert management
 */

router.use(authenticate);
router.use(authorizeRoles('Admin', 'SalesManager'));

/**
 * @swagger
 * /admin/shift-alerts:
 *   post:
 *     summary: Create a shift alert for workers
 *     tags: [Shift Alerts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Shift alert details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - shiftTime
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Shift delay due to power outage"
 *               shiftTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-07-30T09:00:00Z"
 *     responses:
 *       201:
 *         description: Shift alert created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', shiftAlertController.createAlert);

/**
 * @swagger
 * /admin/shift-alerts:
 *   get:
 *     summary: Get all shift alerts
 *     tags: [Shift Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of shift alerts
 *       500:
 *         description: Internal server error
 */
router.get('/', shiftAlertController.getAllAlerts);

module.exports = router;
