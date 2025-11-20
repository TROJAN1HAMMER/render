const express = require('express');
const router = express.Router();

const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const companyController = require('../../controllers/companyController');

/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: Admin company management
 */

router.use(authenticate);
router.use(authorizeRoles('Admin'));

/**
 * @swagger
 * /admin/companies:
 *   get:
 *     summary: Get all companies
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of companies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   logoUrl:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error
 */
router.get('/', companyController.getAllCompanies);

/**
 * @swagger
 * /admin/companies/current:
 *   get:
 *     summary: Get current admin's company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current company details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 company:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     logoUrl:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *       404:
 *         description: No company assigned
 *       500:
 *         description: Server error
 */
router.get('/current', companyController.getCurrentCompany);

/**
 * @swagger
 * /admin/companies/{id}:
 *   get:
 *     summary: Get company by ID
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Company details
 *       404:
 *         description: Company not found
 *       500:
 *         description: Server error
 */
router.get('/:id', companyController.getCompanyById);

/**
 * @swagger
 * /admin/companies:
 *   post:
 *     summary: Create a new company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Company name
 *               description:
 *                 type: string
 *                 description: Company description
 *               logoUrl:
 *                 type: string
 *                 description: Company logo URL
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Company created successfully
 *       400:
 *         description: Invalid input or company already exists
 *       500:
 *         description: Server error
 */
router.post('/', companyController.createCompany);

/**
 * @swagger
 * /admin/companies/{id}:
 *   put:
 *     summary: Update company details
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Company updated successfully
 *       404:
 *         description: Company not found
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.put('/:id', companyController.updateCompany);

/**
 * @swagger
 * /admin/companies/{id}:
 *   delete:
 *     summary: Delete company (soft delete)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Company deleted successfully
 *       404:
 *         description: Company not found
 *       400:
 *         description: Cannot delete company with associated admins
 *       500:
 *         description: Server error
 */
router.delete('/:id', companyController.deleteCompany);

/**
 * @swagger
 * /admin/companies/{id}/switch:
 *   post:
 *     summary: Switch admin to a different company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID to switch to
 *     responses:
 *       200:
 *         description: Company switched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                     company:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                         logoUrl:
 *                           type: string
 *                 previousCompany:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *       404:
 *         description: Company or admin not found
 *       500:
 *         description: Server error
 */
router.post('/:id/switch', companyController.switchCompany);

/**
 * @swagger
 * /admin/companies/{id}/assign-admin:
 *   post:
 *     summary: Assign admin to company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminId:
 *                 type: string
 *                 description: Admin user ID
 *             required:
 *               - adminId
 *     responses:
 *       200:
 *         description: Admin assigned to company successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Company or admin not found
 *       500:
 *         description: Server error
 */
router.post('/:id/assign-admin', companyController.assignAdminToCompany);

module.exports = router;
