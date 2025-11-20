const prisma = require('../prisma/prisma');

const locationController = {
  // POST /user/location
  submitLocation: async (req, res) => {
    try {
      const userId = req.user.id;
      const { latitude, longitude } = req.body;

      if (latitude == null || longitude == null) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }

      const location = await prisma.liveLocation.create({
        data: {
          userId,
          latitude,
          longitude,
          timeStamp: new Date()
        }
      });

      res.status(201).json({ message: 'Location recorded', location });
    } catch (err) {
      console.error('submitLocation error:', err);
      res.status(500).json({ message: 'Failed to record location' });
    }
  },

  // GET /user/location
  getMyLocationHistory: async (req, res) => {
    try {
      const userId = req.user.id;
      const locations = await prisma.liveLocation.findMany({
        where: { userId },
        orderBy: { timeStamp: 'desc' }
      });

      res.json(locations);
    } catch (err) {
      console.error('getMyLocationHistory error:', err);
      res.status(500).json({ message: 'Failed to fetch location history' });
    }
  },

  // GET /admin/location?userId=
  getLocationByUser: async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ message: 'userId is required' });
      }

      const locations = await prisma.liveLocation.findMany({
        where: { userId },
        orderBy: { timeStamp: 'desc' }
      });

      res.json(locations);
    } catch (err) {
      console.error('getLocationByUser error:', err);
      res.status(500).json({ message: 'Failed to fetch location history' });
    }
  }
};

module.exports = locationController;
