const express = require('express');
const router = express.Router();

const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const locationController = require('../../controllers/locationController');

/**
 * @swagger
 * tags:
 *   name: Location
 *   description: Location tracking for Field Executive and Worker
 */

router.use(authenticate);
router.use(authorizeRoles('FieldExecutive', 'Worker'));

/**
 * @swagger
 * /user/location:
 *   post:
 *     summary: Submit current location
 *     tags: [Location]
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
 *                 example: 12.9716
 *               longitude:
 *                 type: number
 *                 example: 77.5946
 *     responses:
 *       201:
 *         description: Location recorded successfully
 *       400:
 *         description: Missing latitude or longitude
 *       500:
 *         description: Internal server error
 */
router.post('/', locationController.submitLocation);

/**
 * @swagger
 * /user/location:
 *   get:
 *     summary: Get location history for the logged-in user
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of location entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *                   timeStamp:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Failed to fetch location history
 */
router.get('/', locationController.getMyLocationHistory);

module.exports = router;
