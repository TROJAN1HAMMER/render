const prisma = require('../prisma/prisma');

const cameraController = {
  // POST /fieldExecutive/camera/upload
  uploadImage: async (req, res) => {
    try {
      console.log("📸 Incoming upload request:");
      console.log("Body:", req.body);
      console.log("File:", req.file);

      const { latitude, longitude, description } = req.body;
      const image = req.file; // From multer
      const userId = req.user.id; // From auth middleware

      if (!latitude || !longitude) {
        return res.status(400).json({ 
          message: 'Latitude and longitude are required' 
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
      let imageBuffer = null;
      if (image) {
        imageBuffer = image.buffer;
      } else {
        return res.status(400).json({ message: 'Image file is required' });
      }

      const fieldExec = await prisma.fieldExecutive.findUnique({
        where: { userId }
      });

      if (!fieldExec) {
        return res.status(403).json({ message: 'Not a Field Executive' });
      }

      // Store image data in a new model or use existing one
      // For now, we'll return success as the model isn't in schema yet
      res.status(201).json({
        message: 'Image uploaded successfully',
        data: {
          executiveId: fieldExec.id,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          description: description || '',
          hasImage: true,
          timestamp: new Date()
        }
      });
    } catch (err) {
      console.error('Error in uploadImage:', err);
      res.status(500).json({ message: 'Failed to upload image' });
    }
  },

  // GET /fieldExecutive/camera/images
  getMyImages: async (req, res) => {
    try {
      const userId = req.user.id;

      const fieldExec = await prisma.fieldExecutive.findUnique({
        where: { userId }
      });

      if (!fieldExec) {
        return res.status(403).json({ message: 'Not a Field Executive' });
      }

      // Mock response since we don't have the actual model yet
      res.status(200).json({
        message: 'Images retrieved successfully',
        images: []
      });
    } catch (err) {
      console.error('Error in getMyImages:', err);
      res.status(500).json({ message: 'Failed to retrieve images' });
    }
  }
};

module.exports = cameraController;