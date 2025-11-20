const express = require("express");
const router = express.Router();
const stockController = require("../../controllers/stockController");

/**
 * @swagger
 * tags:
 *   name: WorkerStock
 *   description: APIs for workers to manage stock
 */

/**
 * @swagger
 * /worker/stock:
 *   get:
 *     summary: Get all stock entries (worker view)
 *     tags: [WorkerStock]
 *     responses:
 *       200:
 *         description: List of stock entries
 *       500:
 *         description: Error fetching stock
 */
router.get("/", stockController.getAllStock);

/**
 * @swagger
 * /worker/stock:
 *   post:
 *     summary: Create a new stock entry
 *     tags: [WorkerStock]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - status
 *               - location
 *             properties:
 *               productId:
 *                 type: string
 *               status:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Stock entry created
 *       500:
 *         description: Error creating stock entry
 */
router.post("/", stockController.createStock);

/**
 * @swagger
 * /worker/stock/cleanup:
 *   delete:
 *     summary: Cleanup orphaned stock entries (products deleted but stock remains)
 *     tags: [WorkerStock]
 *     responses:
 *       200:
 *         description: Cleanup completed
 *       500:
 *         description: Error during cleanup
 */
router.delete("/cleanup", stockController.cleanup);

/**
 * @swagger
 * /worker/stock/{id}:
 *   put:
 *     summary: Update stock entry by ID
 *     tags: [WorkerStock]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stock entry updated
 *       404:
 *         description: Stock entry not found
 *       500:
 *         description: Error updating stock entry
 */
router.put("/:id", stockController.updateStock);

/**
 * @swagger
 * /worker/stock/{id}:
 *   delete:
 *     summary: Delete stock entry by ID
 *     tags: [WorkerStock]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock ID
 *     responses:
 *       200:
 *         description: Stock entry deleted
 *       404:
 *         description: Stock entry not found
 *       500:
 *         description: Error deleting stock entry
 */
router.delete("/:id", stockController.deleteStock);

module.exports = router;
