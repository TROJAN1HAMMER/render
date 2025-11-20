const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const followupController = require('../../controllers/followupController');

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: FollowUps
 *   description: Field Executive Follow-up management
 */

/**
 * @swagger
 * /fieldExecutive/followUp:
 *   get:
 *     summary: Get all follow-ups for logged-in Field Executive
 *     tags: [FollowUps]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of follow-ups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   executiveId:
 *                     type: integer
 *                   customerName:
 *                     type: string
 *                   contactDetails:
 *                     type: string
 *                   feedback:
 *                     type: string
 *                   status:
 *                     type: string
 *                   nextFollowUpDate:
 *                     type: string
 *                     format: date
 *       401:
 *         description: Unauthorized
 */
router.get('/', authorizeRoles('FieldExecutive'), followupController.getFollowUps);

/**
 * @swagger
 * /fieldExecutive/followUp:
 *   post:
 *     summary: Create a new follow-up
 *     tags: [FollowUps]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerName
 *               - contactDetails
 *               - feedback
 *               - status
 *               - nextFollowUpDate
 *             properties:
 *               customerName:
 *                 type: string
 *               contactDetails:
 *                 type: string
 *               feedback:
 *                 type: string
 *               status:
 *                 type: string
 *               nextFollowUpDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Follow-up created
 *       500:
 *         description: Failed to create follow-up
 */
router.post('/', authorizeRoles('FieldExecutive'), followupController.createFollowUp);

/**
 * @swagger
 * /fieldExecutive/followUp/{id}:
 *   put:
 *     summary: Update follow-up details
 *     tags: [FollowUps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Follow-up ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerName:
 *                 type: string
 *               contactDetails:
 *                 type: string
 *               feedback:
 *                 type: string
 *               nextFollowUpDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Follow-up updated
 *       404:
 *         description: Follow-up not found
 */
router.put('/:id', authorizeRoles('FieldExecutive'), followupController.updateFollowUp);

/**
 * @swagger
 * /fieldExecutive/followUp/{id}/status:
 *   patch:
 *     summary: Update follow-up status only
 *     tags: [FollowUps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Follow-up ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Follow-up status updated
 *       404:
 *         description: Follow-up not found
 */
router.patch('/:id/status', authorizeRoles('FieldExecutive'), followupController.updateFollowUpStatus);

module.exports = router;
