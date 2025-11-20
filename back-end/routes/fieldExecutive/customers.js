const express = require('express');
const router = express.Router();
const salesExecutiveController = require('../../controllers/salesExecutiveController');
const auth = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         location:
 *           type: string
 *         address:
 *           type: string
 *         assignedTo:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         visits:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CustomerVisit'
 *     
 *     CustomerVisit:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         customerId:
 *           type: string
 *         executiveId:
 *           type: string
 *         visitDate:
 *           type: string
 *           format: date-time
 *         location:
 *           type: string
 *         peoplePresent:
 *           type: string
 *         productsDiscussed:
 *           type: string
 *         reasonForVisit:
 *           type: string
 *         customerConcerns:
 *           type: string
 *         investigationStatus:
 *           type: string
 *         rootCause:
 *           type: string
 *         correctiveAction:
 *           type: string
 *         recommendations:
 *           type: string
 *         feedback:
 *           type: string
 *         reportCompletedBy:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Field Executive Customers
 *   description: Customer management for Field Executives
 */

router.use(auth);
router.use(authorizeRoles('FieldExecutive'));

/**
 * @swagger
 * /fieldExecutive/customers:
 *   get:
 *     summary: Get assigned customers
 *     tags: [Field Executive Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customer'
 *       403:
 *         description: Not a Field Executive
 *       500:
 *         description: Server error
 */
router.get('/', salesExecutiveController.getAssignedCustomers);


/**
 * @swagger
 * /fieldExecutive/customers/{id}/visits:
 *   post:
 *     summary: Create customer visit report
 *     tags: [Field Executive Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - visitDate
 *               - location
 *             properties:
 *               visitDate:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               peoplePresent:
 *                 type: string
 *               productsDiscussed:
 *                 type: string
 *               reasonForVisit:
 *                 type: string
 *               customerConcerns:
 *                 type: string
 *               investigationStatus:
 *                 type: string
 *               rootCause:
 *                 type: string
 *               correctiveAction:
 *                 type: string
 *               recommendations:
 *                 type: string
 *               feedback:
 *                 type: string
 *     responses:
 *       201:
 *         description: Visit report created successfully
 *       404:
 *         description: Customer not found or not assigned
 *       500:
 *         description: Server error
 */
router.post('/:id/visits', salesExecutiveController.createVisitReport);
/**
 * @swagger
 * /fieldExecutive/customers/visits:
 *   get:
 *     summary: Get visit reports
 *     tags: [Field Executive Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *         description: Filter visits by customer ID
 *     responses:
 *       200:
 *         description: Visit reports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CustomerVisit'
 *       500:
 *         description: Server error
 */
router.get('/visits', salesExecutiveController.getVisitReports);

/**
 * @swagger
 * /fieldExecutive/customers/{id}:
 *   get:
 *     summary: Get customer by ID with visit history
 *     tags: [Field Executive Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Server error
 */
router.get('/:id', salesExecutiveController.getCustomerById);

module.exports = router;
