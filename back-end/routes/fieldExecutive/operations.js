const express = require('express');
const router = express.Router();
const salesExecutiveController = require('../../controllers/salesExecutiveController');
const auth = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');

/**
 * @swagger
 * components:
 *   schemas:
 *     Signature:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         context:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     
 *     OfflineData:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         dataType:
 *           type: string
 *         data:
 *           type: string
 *         synced:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         syncedAt:
 *           type: string
 *           format: date-time
 *     
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         type:
 *           type: string
 *         message:
 *           type: string
 *         isRead:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Field Executive Operations
 *   description: Additional operations for Field Executives
 */

router.use(auth);
router.use(authorizeRoles('FieldExecutive'));

/**
 * @swagger
 * /fieldExecutive/operations/signature:
 *   post:
 *     summary: Capture signature
 *     tags: [Field Executive Operations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - signatureData
 *             properties:
 *               signatureData:
 *                 type: string
 *                 description: Base64 encoded signature data
 *               context:
 *                 type: string
 *                 description: Context for the signature (e.g., "Order Confirmation", "Visit Report")
 *     responses:
 *       201:
 *         description: Signature captured successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 signature:
 *                   $ref: '#/components/schemas/Signature'
 *       400:
 *         description: Signature data is required
 *       403:
 *         description: Not a Field Executive
 *       500:
 *         description: Server error
 */
router.post('/signature', salesExecutiveController.captureSignature);

/**
 * @swagger
 * /fieldExecutive/operations/sync:
 *   post:
 *     summary: Sync offline data
 *     tags: [Field Executive Operations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - offlineData
 *             properties:
 *               offlineData:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - dataType
 *                     - data
 *                   properties:
 *                     dataType:
 *                       type: string
 *                       enum: [order, visit, image, task]
 *                     data:
 *                       type: object
 *                       description: The actual data to sync
 *     responses:
 *       200:
 *         description: Offline data synced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 syncedItems:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       dataType:
 *                         type: string
 *                       syncedAt:
 *                         type: string
 *                         format: date-time
 *                 totalSynced:
 *                   type: integer
 *       400:
 *         description: Offline data array is required
 *       403:
 *         description: Not a Field Executive
 *       500:
 *         description: Server error
 */
router.post('/sync', salesExecutiveController.syncOfflineData);

/**
 * @swagger
 * /fieldExecutive/operations/sync:
 *   get:
 *     summary: Get offline data
 *     tags: [Field Executive Operations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: synced
 *         schema:
 *           type: boolean
 *         description: Filter by sync status
 *     responses:
 *       200:
 *         description: Offline data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OfflineData'
 *       403:
 *         description: Not a Field Executive
 *       500:
 *         description: Server error
 */
router.get('/sync', salesExecutiveController.getOfflineData);

/**
 * @swagger
 * /fieldExecutive/operations/notifications:
 *   get:
 *     summary: Get my notifications
 *     tags: [Field Executive Operations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *         description: Filter unread notifications only
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       500:
 *         description: Server error
 */
router.get('/notifications', salesExecutiveController.getMyNotifications);

/**
 * @swagger
 * /fieldExecutive/operations/notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Field Executive Operations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
router.patch('/notifications/:id/read', salesExecutiveController.markNotificationAsRead);

/**
 * @swagger
 * /fieldExecutive/operations/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Field Executive Operations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       500:
 *         description: Server error
 */
router.patch('/notifications/read-all', salesExecutiveController.markAllNotificationsAsRead);

module.exports = router;
