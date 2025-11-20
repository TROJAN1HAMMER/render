// controllers/workerStockController.js
const prisma = require('../prisma/prisma');

const workerStockController = {
  // Create stock entry
  createStock: async (req, res) => {
    const { productId, status, location } = req.body;
    try {
      const stock = await prisma.stock.create({
        data: { productId, status, location }
      });
      res.status(201).json({ message: 'Stock entry created', stock });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error creating stock entry' });
    }
  },

  // Get all stock entries
  getAllStock: async (req, res) => {
    try {
      const stocks = await prisma.stock.findMany({
        include: {
          product: {
            select: { id: true, name: true, price: true, warrantyPeriodInMonths: true }
          }
        }
      });
      res.json(stocks);
    } catch (err) {
      console.error('Error in getAllStock:', err);
      res.status(500).json({ message: 'Error fetching stock entries' });
    }
  },

  // Get stock by ID
  getStockById: async (req, res) => {
    try {
      const { id } = req.params;
      const stock = await prisma.stock.findUnique({
        where: { id },
        include: {
          product: { select: { id: true, name: true, price: true, warrantyPeriodInMonths: true } }
        }
      });
      if (!stock) return res.status(404).json({ message: 'Stock not found' });
      res.json(stock);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching stock entry' });
    }
  },

  // Update stock
  updateStock: async (req, res) => {
    const { id } = req.params;
    const { status, location } = req.body;
    try {
      const updatedStock = await prisma.stock.update({
        where: { id },
        data: { status, location }
      });
      res.json({ message: 'Stock entry updated', stock: updatedStock });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error updating stock entry' });
    }
  },

  // Delete stock
  deleteStock: async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await prisma.stock.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ message: 'Stock entry not found' });

      await prisma.stock.delete({ where: { id } });
      res.json({ message: 'Stock entry deleted' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error deleting stock entry' });
    }
  }
};

module.exports = workerStockController;
