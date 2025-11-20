const express = require('express');
const router = express.Router();

const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const locationController = require('../../controllers/locationController');

/**
 * @swagger
 * tags:
 *   name: Admin Location
 *   description: Location tracking for Admin
 */

router.use(authenticate);
router.use(authorizeRoles('Admin',"SalesManager"));

/**
 * @swagger
 * /admin/location:
 *   get:
 *     summary: Get location history of a specific user
 *     tags: [Admin Location]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to fetch location data for
 *     responses:
 *       200:
 *         description: List of location records for the user
 *       400:
 *         description: userId is required
 *       500:
 *         description: Failed to fetch location history
 */
router.get('/', locationController.getLocationByUser);

module.exports = router;
