const express = require('express');
const router = express.Router();

const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const invoiceController = require('../../controllers/invoiceController');

/**
 * @swagger
 * tags:
 *   name: Admin Invoices
 *   description: Invoice management for Admins
 */

router.use(authenticate);
router.use(authorizeRoles('Admin',"SalesManager"));

/**
 * @swagger
 * /admin/invoices:
 *   get:
 *     summary: Get all invoices (with optional filters)
 *     tags: [Admin Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: string
 *         description: Filter by order ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by invoice creation date
 *     responses:
 *       200:
 *         description: List of filtered invoices
 *       500:
 *         description: Server error
 */
router.get('/', invoiceController.getAllInvoices);

/**
 * @swagger
 * /admin/invoices/{id}:
 *   get:
 *     summary: Get a specific invoice by ID
 *     tags: [Admin Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice data
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Failed to fetch invoice
 */
router.get('/:id', invoiceController.getInvoiceById);


/**
 * @swagger
 * /admin/invoices:
 *   post:
 *     summary: Create a new invoice manually
 *     tags: [Admin Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Invoice details
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - totalAmount
 *               - items
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID for the invoice
 *               totalAmount:
 *                 type: number
 *                 description: Total invoice amount
 *               items:
 *                 type: array
 *                 description: Array of invoice items
 *                 items:
 *                   type: object
 *                   properties:
 *                     productName:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     unitPrice:
 *                       type: number
 *               description:
 *                 type: string
 *                 description: Optional invoice description
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Optional due date
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Failed to create invoice
 */
router.post('/', invoiceController.createInvoice);

module.exports = router;
