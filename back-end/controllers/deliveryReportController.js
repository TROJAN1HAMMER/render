const prisma = require('../prisma/prisma');

const deliveryReportController = {
  // POST /user/delivery-report
  submitDeliveryReport: async (req, res) => {
    try {
      const { product, quantity } = req.body;
      const userId = req.user.id; // From auth middleware

      if (!product || !quantity) {
        return res.status(400).json({ message: 'Product and quantity are required' });
      }

      if (quantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be positive' });
      }

      // ✅ Create PostDeliveryReport (correct table + schema)
      const report = await prisma.postDeliveryReport.create({
        data: {
          userId,
          product,
          quantity,
          submittedAt: new Date()
        }
      });

      res.status(201).json({
        message: 'Delivery report submitted',
        report: {
          id: report.id,
          userId: report.userId,
          product: report.product,
          quantity: report.quantity,
          submittedAt: report.submittedAt
        }
      });
    } catch (err) {
      console.error('submitDeliveryReport error:', err);
      res.status(500).json({ message: 'Failed to submit delivery report' });
    }
  }
};

module.exports = deliveryReportController;
