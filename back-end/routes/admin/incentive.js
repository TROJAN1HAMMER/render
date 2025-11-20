const express = require('express');
const router = express.Router();

const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const incentiveController = require('../../controllers/incentiveController');

/**
 * @swagger
 * tags:
 *   name: Admin Incentives
 *   description: Incentive management by Admin
 */

router.use(authenticate);
router.use(authorizeRoles('Admin',"SalesManager"));

/**
 * @swagger
 * /admin/incentives:
 *   post:
 *     summary: Assign an incentive to a user
 *     tags: [Admin Incentives]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               amount:
 *                 type: number
 *               reason:
 *                 type: string
 *             required:
 *               - userId
 *               - amount
 *               - reason
 *     responses:
 *       201:
 *         description: Incentive assigned successfully
 *       400:
 *         description: Missing or invalid data
 *       500:
 *         description: Server error
 */
router.post('/', incentiveController.assignIncentive);

/**
 * @swagger
 * /admin/incentives:
 *   get:
 *     summary: Get all assigned incentives (optional filter by userId)
 *     tags: [Admin Incentives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Optional user ID to filter incentives
 *     responses:
 *       200:
 *         description: List of incentives
 *       500:
 *         description: Failed to fetch incentives
 */
router.get('/', incentiveController.getAllIncentives);

module.exports = router;
