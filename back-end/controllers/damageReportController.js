const prisma = require('../prisma/prisma');
const damageReportController = {
  // GET /worker/stocks
  listStocksForWorkers: async (req, res) => {
    try {
      const stocks = await prisma.stock.findMany({
        where: {
          NOT: { status: 'Damaged' },                  
        },
        include: {
          product: { select: { name: true } },
        },
      });

      const stockList = stocks.map((s) => ({
        id: s.id,
        product: s.product.name,
        location: s.location,
        status: s.status,
      }));

      res.json(stockList);
    } catch (err) {
      console.error('listStocksForWorkers error:', err);
      res.status(500).json({ error: 'Error fetching stock list' });
    }
  },

  // POST /worker/damage-reports
  reportDamage: async (req, res) => {
    try {
      const { stockId, reason, quantity, location } = req.body;
      const workerId = req.user.id;

      if (!stockId || !reason || !quantity || !location) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const stock = await prisma.stock.findUnique({ where: { id: stockId } });
      if (!stock) return res.status(404).json({ error: 'Stock not found' });

      const report = await prisma.damageReport.create({
        data: {
          stockId,
          workerId,
          reason,
          quantity,
          location,
        },
      });

      // Optional: mark stock as damaged
      if (quantity >= 1) {
        await prisma.stock.update({
          where: { id: stockId },
          data: { status: 'Damaged' },
        });
      }

      res.status(201).json(report);
    } catch (err) {
      console.error('reportDamage error:', err);
      res.status(500).json({ error: 'Error reporting damage' });
    }
  },

  // GET /damage-reports
  getDamageReports: async (req, res) => {
    try {
      const reports = await prisma.damageReport.findMany({
        include: {
          stock: { select: { productId: true, location: true, status: true } },
          worker: { select: { id: true, name: true } },
        },
      });

      res.json(reports);
    } catch (err) {
      console.error('getDamageReports error:', err);
      res.status(500).json({ error: 'Error fetching damage reports' });
    }
  },
};

module.exports = damageReportController;
