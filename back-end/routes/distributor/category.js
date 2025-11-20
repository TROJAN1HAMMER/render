const express = require('express');
const router = express.Router();

const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const categoryController = require('../../controllers/categoryController');

/**
 * @swagger
 * tags:
 *   name: Distributor Categories
 *   description: Product category management for Distributors
 */

router.use(authenticate);
router.use(authorizeRoles('Distributor'));

/**
 * @swagger
 * /distributor/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Distributor Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all categories
 *       500:
 *         description: Server error
 */
router.get('/', categoryController.getAllCategories);

/**
 * @swagger
 * /distributor/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Distributor Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.get('/:id', categoryController.getCategoryById);

// Name-based endpoints
/**
 * @swagger
 * /distributor/categories/by-name/{name}:
 *   get:
 *     summary: Get category by name
 *     tags: [Distributor Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Category name
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.get('/by-name/:name', categoryController.getCategoryByName);

/**
 * @swagger
 * /distributor/categories:
 *   post:
 *     summary: Create new category
 *     tags: [Distributor Categories]
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
 *               description:
 *                 type: string
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Invalid input or category already exists
 *       500:
 *         description: Server error
 */
router.post('/', categoryController.createCategory);

/**
 * @swagger
 * /distributor/categories/{id}:
 *   put:
 *     summary: Update category
 *     tags: [Distributor Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Invalid input or name conflict
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.put('/:id', categoryController.updateCategory);

/**
 * @swagger
 * /distributor/categories/by-name/{name}:
 *   put:
 *     summary: Update category by name
 *     tags: [Distributor Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Category name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Invalid input or name conflict
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.put('/by-name/:name', categoryController.updateCategoryByName);

/**
 * @swagger
 * /distributor/categories/{id}:
 *   delete:
 *     summary: Delete category
 *     tags: [Distributor Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Cannot delete category with existing products
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', categoryController.deleteCategory);

/**
 * @swagger
 * /distributor/categories/by-name/{name}:
 *   delete:
 *     summary: Delete category by name
 *     tags: [Distributor Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Category name
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Cannot delete category with existing products
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.delete('/by-name/:name', categoryController.deleteCategoryByName);

module.exports = router;

