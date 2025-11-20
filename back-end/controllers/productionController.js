const prisma = require('../prisma/prisma');

const productionController = {
  // Log production entry by creating a stock unit
  logProduction: async (req, res) => {
    try {
      const { productId, quantity, location } = req.body;

      if (!productId || !quantity) {
        return res.status(400).json({ message: 'Product ID and quantity are required' });
      }

      const createdStocks = await Promise.all(
        Array.from({ length: quantity }, () =>
          prisma.stock.create({
            data: {
              productId,
              location: location || 'Factory',
              status: 'Available'
            }
          })
        )
      );

      res.status(201).json({ message: 'Production entry logged', createdCount: createdStocks.length });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to log production' });
    }
  },

  // Get all production-related stock (optional)
  getProductionLogs: async (req, res) => {
    try {
      const stocks = await prisma.stock.findMany({
        where: { location: { contains: 'Factory', mode: 'insensitive' } },
        include: { product: true },
        orderBy: { id: 'desc' }
      });
      res.json(stocks);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch production logs' });
    }
  }
};

module.exports = productionController;
