const express = require('express');
const router = express.Router();
const authorizeRoles = require('../../middlewares/roleCheck');
const authenticate = require('../../middlewares/auth');
const incentiveController = require('../../controllers/incentiveController');

/**
 * @swagger
 * tags:
 *   name: Plumber Incentives
 *   description: Incentive tracking for Plumbers
 */

router.use(authenticate);
router.use(authorizeRoles('Plumber'));

/**
 * @swagger
 * /user/incentives:
 *   get:
 *     summary: Get logged-in Plumber's incentives
 *     tags: [Plumber Incentives]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of incentives
 *       401:
 *         description: Unauthorized or invalid token
 *       500:
 *         description: Server error while fetching incentives
 */
router.get('/', incentiveController.getMyIncentives);

module.exports = router;
