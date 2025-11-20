const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const shiftAlertController = require('../../controllers/shiftAlertController');

/**
 * @swagger
 * tags:
 *   name: Shift Alerts
 *   description: Alerts for shift-related updates, visible to Workers
 */

router.use(authenticate);
router.use(authorizeRoles('Worker'));

/**
 * @swagger
 * /worker/shift-alerts:
 *   get:
 *     summary: Get all shift alerts for the logged-in Worker
 *     tags: [Shift Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of shift alerts
 *       500:
 *         description: Failed to fetch shift alerts
 */
router.get('/', shiftAlertController.getMyAlerts);

/**
 * @swagger
 * /worker/shift-alerts/{id}/acknowledge:
 *   put:
 *     summary: Acknowledge a shift alert
 *     tags: [Shift Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the shift alert to acknowledge
 *     responses:
 *       200:
 *         description: Alert acknowledged successfully
 *       404:
 *         description: Alert not found
 *       500:
 *         description: Failed to acknowledge alert
 */
router.put('/:id/acknowledge', shiftAlertController.acknowledgeAlert);

module.exports = router;
