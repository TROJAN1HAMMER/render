const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const taskController = require('../../controllers/taskController');

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management for Field Executives
 */

/**
 * @swagger
 * /field-executive/tasks:
 *   get:
 *     summary: Get tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: executiveUserId
 *         schema:
 *           type: integer
 *         required: false
 *         description: "For Admin/Manager: fetch tasks of a specific Field Executive"
 *     responses:
 *       200:
 *         description: List of tasks
 *       500:
 *         description: Failed to fetch tasks
 */
router.get('/', authorizeRoles('FieldExecutive', 'SalesManager', 'Admin'), taskController.getTasks);

/**
 * @swagger
 * /field-executive/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: "Task details"
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Pending, InProgress, Completed]
 *               dueDate:
 *                 type: string
 *                 format: date
 *               executiveUserId:
 *                 type: integer
 *                 description: "Only Admin/Manager can assign task to a specific executive"
 *     responses:
 *       201:
 *         description: Task created
 *       400:
 *         description: Invalid executiveUserId
 *       500:
 *         description: Failed to create task
 */
router.post('/', authorizeRoles('FieldExecutive', 'SalesManager', 'Admin'), taskController.createTask);

/**
 * @swagger
 * /field-executive/tasks/{id}:
 *   put:
 *     summary: Update task details
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: "Task ID"
 *     requestBody:
 *       description: "Task data to update"
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Task updated
 *       404:
 *         description: Task not found
 *       500:
 *         description: Failed to update task
 */
router.put('/:id', authorizeRoles('FieldExecutive', 'SalesManager', 'Admin'), taskController.updateTask);

/**
 * @swagger
 * /field-executive/tasks/{id}/status:
 *   patch:
 *     summary: Update task status only
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: "Task ID"
 *     requestBody:
 *       description: "New task status"
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, InProgress, Completed]
 *     responses:
 *       200:
 *         description: Task status updated
 *       404:
 *         description: Task not found
 *       500:
 *         description: Failed to update status
 */
router.patch('/:id/status', authorizeRoles('FieldExecutive', 'SalesManager', 'Admin'), taskController.updateTaskStatus);

/**
 * @swagger
 * /field-executive/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: "Task ID"
 *     responses:
 *       200:
 *         description: Task deleted
 *       404:
 *         description: Task not found
 *       500:
 *         description: Failed to delete task
 */
router.delete('/:id', authorizeRoles('FieldExecutive', 'SalesManager', 'Admin'), taskController.deleteTask);

module.exports = router;
