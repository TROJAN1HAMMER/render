const express = require("express");
const router = express.Router();

const authenticate = require("../../middlewares/auth");
const authorizeRoles = require("../../middlewares/roleCheck");
const auditController = require("../../controllers/auditController");

/**
 * @swagger
 * tags:
 *   name: Admin Audit Logs
 *   description: View and create audit logs (Admin only)
 */

router.use(authenticate);
router.use(authorizeRoles("Admin","SalesManager"));

/**
 * @swagger
 * /admin/audit:
 *   get:
 *     summary: Get all audit logs
 *     tags: [Admin Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: resource
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Audit logs retrieved
 *       500:
 *         description: Failed to retrieve audit logs
 */
router.get("/", auditController.getAudits);

/**
 * @swagger
 * /admin/audit:
 *   post:
 *     summary: Create a new audit log
 *     tags: [Admin Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *               - resource
 *             properties:
 *               action:
 *                 type: string
 *                 example: "Created Product"
 *               resource:
 *                 type: string
 *                 example: "Product"
 *               details:
 *                 type: string
 *                 example: "Added new product with ID 123"
 *     responses:
 *       201:
 *         description: Audit log created
 *       400:
 *         description: Invalid data
 *       500:
 *         description: Server error
 */
router.post("/", auditController.createAudit);

module.exports = router;
