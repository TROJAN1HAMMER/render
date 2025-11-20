const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const salesExecutiveController = require('../../controllers/salesExecutiveController');

/**
 * @swagger
 * tags:
 *   name: Field Executive Chat
 *   description: "Chat functionality for Field Executives"
 */

// Apply authentication and role-based access to all chat routes
router.use(authenticate);
router.use(authorizeRoles('FieldExecutive'));

/**
 * @swagger
 * /fieldExecutive/chat/messages:
 *   get:
 *     summary: "Retrieve all chat messages for the logged-in Field Executive"
 *     tags: [Field Executive Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: receiverId
 *         in: query
 *         schema:
 *           type: string
 *         description: "Optional receiver ID to filter messages by a specific user"
 *     responses:
 *       200:
 *         description: "Successfully retrieved messages"
 *       401:
 *         description: "Unauthorized access"
 *       403:
 *         description: "Not a Field Executive"
 *       500:
 *         description: "Server error"
 */
router.get('/messages', salesExecutiveController.getMessages);

/**
 * @swagger
 * /fieldExecutive/chat/send:
 *   post:
 *     summary: "Send a new chat message"
 *     tags: [Field Executive Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: "Message text"
 *               receiverId:
 *                 type: string
 *                 description: "Optional recipient ID (for direct messages)"
 *     responses:
 *       201:
 *         description: "Message sent successfully"
 *       400:
 *         description: "Invalid or missing fields"
 *       401:
 *         description: "Unauthorized"
 *       403:
 *         description: "Not a Field Executive"
 *       500:
 *         description: "Internal server error"
 */
router.post('/send', salesExecutiveController.sendMessage);

module.exports = router;
