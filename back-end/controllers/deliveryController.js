const prisma = require('../prisma/prisma');

const deliveryController = {
  // POST /fieldExecutive/delivery
  submitDelivery: async (req, res) => {
    try {
      const { product, quantity, isForecasted } = req.body;
      const userId = req.user.id;

      const report = await prisma.deliveryReport.create({
        data: {
          product,
          quantity,
          isForecasted: !!isForecasted,
          submittedAt: new Date(),
          userId
        }
      });

      res.status(201).json({ message: 'Delivery report submitted', report });
    } catch (err) {
      console.error('submitDelivery error:', err);
      res.status(500).json({ message: 'Failed to submit delivery report' });
    }
  },

  // GET /fieldExecutive/delivery
  getMyDeliveries: async (req, res) => {
    try {
      const userId = req.user.id;
      const reports = await prisma.deliveryReport.findMany({
        where: { userId },
        orderBy: { submittedAt: 'desc' }
      });

      res.json(reports);
    } catch (err) {
      console.error('getMyDeliveries error:', err);
      res.status(500).json({ message: 'Failed to fetch delivery reports' });
    }
  }
};

module.exports = deliveryController;
