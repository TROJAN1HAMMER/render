const prisma = require('../prisma/prisma');

const shiftAlertController = {
  // Admin/SalesManager creates a shift alert
  createAlert: async (req, res) => {
    try {
      const { userId, message } = req.body;
      if (!userId || !message) {
        return res.status(400).json({ message: 'userId and message required' });
      }

      const alert = await prisma.shiftAlert.create({
        data: {
          userId,
          message
        }
      });

      res.status(201).json({ message: 'Alert created', alert });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to create alert' });
    }
  },

  // Admin/SalesManager get all alerts
  getAllAlerts: async (req, res) => {
    try {
      const alerts = await prisma.shiftAlert.findMany({
        orderBy: { createdAt: 'desc' }
      });
      res.json(alerts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch alerts' });
    }
  },

  // Worker gets their alerts
  getMyAlerts: async (req, res) => {
    try {
      const userId = req.user.id;
      const alerts = await prisma.shiftAlert.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      res.json(alerts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch alerts' });
    }
  },

  // Worker acknowledges alert
  acknowledgeAlert: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const alert = await prisma.shiftAlert.findFirst({
        where: { id, userId }
      });

      if (!alert) return res.status(404).json({ message: 'Alert not found' });

      const updated = await prisma.shiftAlert.update({
        where: { id },
        data: { acknowledged: true }
      });

      res.json({ message: 'Alert acknowledged', alert: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to acknowledge alert' });
    }
  }
};

module.exports = shiftAlertController;
