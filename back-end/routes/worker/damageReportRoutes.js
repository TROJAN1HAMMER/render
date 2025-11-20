const express = require('express');
const router = express.Router();

const authenticate = require('../../middlewares/auth'); // auth middleware
const authorizeRoles = require('../../middlewares/roleCheck'); // role check middleware
const damageReportController = require('../../controllers/damageReportController'); // controller

/**
 * @swagger
 * tags:
 *   name: DamageReports
 *   description: Damage reporting management for Workers, Admins, and Distributors
 */

// Apply authentication globally
router.use(authenticate);

/**
 * Worker routes: list stocks and report damage
 */
router.use(authorizeRoles('Worker')); // Only workers can access these routes

// List stocks available for workers
router.get('/worker/stocks', damageReportController.listStocksForWorkers);

// Report a damaged stock item
router.post('/', damageReportController.reportDamage);

/**
 * Admin/Distributor routes: view all damage reports
 * Here we override the role restriction for Admin and Distributor
 */
router.get(
  '/damage-reports',
  authorizeRoles('Admin', 'Distributor'),
  damageReportController.getDamageReports
);

module.exports = router;