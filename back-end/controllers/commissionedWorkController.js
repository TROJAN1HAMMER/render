const prisma = require('../prisma/prisma');

const commissionedWorkController = {
  // POST /user/commissioned-work
  submitCommissionedWork: async (req, res) => {
    try {
      const { latitude, longitude, qrCode } = req.body;
      const qrImage = req.file; // From multer
      const userId = req.user.id; // From auth middleware

      if (!latitude || !longitude || !qrCode) {
        return res.status(400).json({ 
          message: 'Latitude, longitude, and QR code are required' 
        });
      }

      // Validate coordinates
      if (latitude < -90 || latitude > 90) {
        return res.status(400).json({ message: 'Invalid latitude value' });
      }

      if (longitude < -180 || longitude > 180) {
        return res.status(400).json({ message: 'Invalid longitude value' });
      }

      // Convert image to Buffer if provided
      let qrImageBuffer = null;
      if (qrImage) {
        qrImageBuffer = qrImage.buffer;
      }

      // Create commissioned work record
      const commissionedWork = await prisma.commissionedWork.create({
        data: {
          userId,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          qrCode: qrCode.toString(),
          qrImage: qrImageBuffer,
          appliedAt: new Date()
        }
      });

      res.status(201).json({
        message: 'Commissioned work submitted successfully',
        work: {
          id: commissionedWork.id,
          userId: commissionedWork.userId,
          latitude: commissionedWork.latitude,
          longitude: commissionedWork.longitude,
          qrCode: commissionedWork.qrCode,
          hasImage: !!commissionedWork.qrImage,
          appliedAt: commissionedWork.appliedAt
        }
      });
    } catch (err) {
      console.error('submitCommissionedWork error:', err);
      res.status(500).json({ message: 'Failed to submit commissioned work' });
    }
  }
};

module.exports = commissionedWorkController;
