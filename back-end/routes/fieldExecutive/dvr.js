const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const dvrController = require('../../controllers/dvrController');

/**
 * @swagger
 * tags:
 *   name: Field Executive DVR
 *   description: DVR (Daily Visit Report) management for Field Executives
 */

// Auth middleware
router.use(authenticate);

/**
 * @swagger
 * /fieldExecutive/dvr:
 *   post:
 *     summary: Create a new DVR (Field Executive)
 *     tags: [Field Executive DVR]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - feedback
 *               - location
 *             properties:
 *               feedback:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: DVR submitted successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', authorizeRoles('FieldExecutive'), dvrController.createDVR);

/**
 * @swagger
 * /fieldExecutive/dvr:
 *   get:
 *     summary: Get DVRs (Field Executive sees own DVRs, Manager/Admin can filter)
 *     tags: [Field Executive DVR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: executiveUserId
 *         in: query
 *         schema:
 *           type: string
 *         description: (Optional) Field Executive's userId to filter (for Manager/Admin)
 *     responses:
 *       200:
 *         description: List of DVRs
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', dvrController.getMyDVRs);

/**
 * @swagger
 * /fieldExecutive/dvr/{id}/approve:
 *   patch:
 *     summary: Approve a DVR (SalesManager/Admin only)
 *     tags: [Field Executive DVR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: DVR ID
 *     responses:
 *       200:
 *         description: DVR approved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: DVR not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/approve', authorizeRoles('SalesManager', 'Admin'), dvrController.approveDVR);

/**
 * @swagger
 * /fieldExecutive/dvr/{id}/reject:
 *   patch:
 *     summary: Reject a DVR (SalesManager/Admin only)
 *     tags: [Field Executive DVR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: DVR ID
 *     responses:
 *       200:
 *         description: DVR rejected
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: DVR not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/reject', authorizeRoles('SalesManager', 'Admin'), dvrController.rejectDVR);

module.exports = router;
