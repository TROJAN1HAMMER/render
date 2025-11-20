const express = require('express');
const multer = require('multer');
const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');
const accountProfileController = require('../../controllers/accountProfileController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB
  },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
      cb(null, true);
      return;
    }

    const error = new Error('Only JPEG or PNG images are allowed');
    error.code = 'LIMIT_FILE_TYPE';
    cb(error);
  },
});

const handleUpload = (req, res, next) => {
  upload.single('upiQrImage')(req, res, (err) => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'Payload too large' });
      }

      return res.status(400).json({
        error: 'Validation failed',
        details: { upiQrImage: err.message },
      });
    }

    if (err.code === 'LIMIT_FILE_TYPE') {
      return res.status(400).json({
        error: 'Validation failed',
        details: { upiQrImage: err.message },
      });
    }

    return res.status(400).json({
      error: 'Validation failed',
      details: { upiQrImage: 'File upload error' },
    });
  });
};

router.use(authenticate);
router.use(authorizeRoles('Plumber'));

router.get('/', accountProfileController.getAccountProfile);
router.post('/', handleUpload, accountProfileController.upsertAccountProfile);

module.exports = router;

