const express = require("express");
const router = express.Router();

const authenticate = require("../../middlewares/auth");
const authorizeRoles = require("../../middlewares/roleCheck");
const notificationController = require("../../controllers/notificationController");

/**
 * @swagger
 * tags:
 *   name: Admin Notifications
 *   description: Admin notification management
 */

router.use(authenticate);
router.use(authorizeRoles("Admin","SalesManager"));

/**
 * @swagger
 * /admin/notifications:
 *   get:
 *     summary: Get all notifications (optionally filter unread)
 *     tags: [Admin Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *         description: Only return unread notifications
 *     responses:
 *       200:
 *         description: List of notifications
 *       500:
 *         description: Server error
 */
router.get("/", notificationController.getNotifications);

/**
 * @swagger
 * /admin/notifications:
 *   post:
 *     summary: Send a notification
 *     tags: [Admin Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - message
 *             properties:
 *               type:
 *                 type: string
 *                 example: "info"
 *               message:
 *                 type: string
 *                 example: "System update scheduled at midnight"
 *               userId:
 *                 type: string
 *                 example: "user_id"
 *     responses:
 *       201:
 *         description: Notification created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post("/", notificationController.createNotification);

/**
 * @swagger
 * /admin/notifications/{id}/read:
 *   put:
 *     summary: Mark a specific notification as read
 *     tags: [Admin Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
router.put("/:id/read", notificationController.markAsRead);

/**
 * @swagger
 * /admin/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Admin Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       500:
 *         description: Server error
 */
router.put("/read-all", notificationController.markAllAsRead);

module.exports = router;
