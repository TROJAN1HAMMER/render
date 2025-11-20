const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const locationController = require('../../controllers/locationController');

router.use(authenticate);
router.get('/', locationController.getLocationByUser);

/**
 * @swagger
 * tags:
 *   name: FieldExecutiveLocations
 *   description: Field Executive location management
 */

/**
 * @swagger
 * /fieldExecutive/location:
 *   post:
 *     summary: Field Executive submits current location
 *     tags: [FieldExecutiveLocations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       201:
 *         description: Location recorded
 *       400:
 *         description: Latitude and longitude required
 *       500:
 *         description: Failed to record location
 */
router.post('/', authorizeRoles('FieldExecutive'), locationController.submitLocation);

/**
 * @swagger
 * /fieldExecutive/location:
 *   get:
 *     summary: Get logged-in Field Executive's location history
 *     tags: [FieldExecutiveLocations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of locations
 *       500:
 *         description: Failed to fetch location history
 */
router.get('/', authorizeRoles('FieldExecutive'), locationController.getMyLocationHistory);

module.exports = router;
