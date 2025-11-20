const express = require('express');
const router = express.Router();
const authorizeRoles = require('../../middlewares/roleCheck');
const authenticate = require('../../middlewares/auth');
const commissionedWorkController = require('../../controllers/commissionedWorkController');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

/**
 * @swagger
 * tags:
 *   name: Plumber Commissioned Work
 *   description: Commissioned work management for Plumbers
 */

router.use(authenticate);
router.use(authorizeRoles('Plumber'));

/**
 * @swagger
 * /user/commissioned-work:
 *   post:
 *     summary: Submit commissioned work with location and QR data
 *     tags: [Plumber Commissioned Work]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *               - qrCode
 *             properties:
 *               latitude:
 *                 type: number
 *                 description: Latitude coordinate
 *               longitude:
 *                 type: number
 *                 description: Longitude coordinate
 *               qrCode:
 *                 type: string
 *                 description: QR code data or JSON string
 *               qrImage:
 *                 type: string
 *                 format: binary
 *                 description: Selfie or QR image file
 *     responses:
 *       201:
 *         description: Commissioned work submitted successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', upload.single('qrImage'), commissionedWorkController.submitCommissionedWork);

module.exports = router;
