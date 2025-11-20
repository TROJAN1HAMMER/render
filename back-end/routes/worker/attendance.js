const express = require('express');
const router = express.Router();

const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const attendanceController = require('../../controllers/attendanceController');

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Attendance management for Workers
 */

router.use(authenticate);
router.use(authorizeRoles('Worker'));

/**
 * @swagger
 * /worker/attendance:
 *   post:
 *     summary: Mark attendance (Check-in/Check-out)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Optional data for attendance marking (can be empty if handled server-side)
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {}
 *     responses:
 *       201:
 *         description: Attendance marked successfully
 *       400:
 *         description: Invalid or duplicate attendance
 *       500:
 *         description: Internal server error
 */
router.post('/', attendanceController.markAttendance);

/**
 * @swagger
 * /worker/attendance/today:
 *   get:
 *     summary: View today's attendance record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's attendance fetched
 *       404:
 *         description: No attendance found
 *       500:
 *         description: Server error
 */
router.get('/today', attendanceController.getTodayAttendance);

/**
 * @swagger
 * /worker/attendance:
 *   get:
 *     summary: View all attendance records for the logged-in Worker
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of attendance records
 *       500:
 *         description: Failed to fetch attendance history
 */
router.get('/', attendanceController.getMyAttendance);

module.exports = router;
