const prisma = require('../prisma/prisma');

const warrantyCardController = {
  // GET /admin/warranty-cards
  getAllWarrantyCards: async (req, res) => {
    try {
      const { productId, serialNumber } = req.query;
      const where = {};
      if (productId) where.productId = productId;
      if (serialNumber) where.serialNumber = serialNumber;
      const cards = await prisma.warrantyCard.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, price: true } }
        },
        orderBy: { purchaseDate: 'desc' }
      });
      res.json(cards);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch warranty cards' });
    }
  },

  // GET /admin/warranty-cards/:id
  getWarrantyCardById: async (req, res) => {
    try {
      const { id } = req.params;
      const card = await prisma.warrantyCard.findUnique({
        where: { id },
        include: {
          product: { select: { id: true, name: true, price: true } }
        }
      });
      if (!card) return res.status(404).json({ message: 'Warranty card not found' });
      res.json(card);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch warranty card' });
    }
  }
  ,
  // GET /admin/warranty-cards/by-serial/:serialNumber
  getWarrantyCardBySerial: async (req, res) => {
    try {
      const { serialNumber } = req.params;
      const card = await prisma.warrantyCard.findUnique({
        where: { serialNumber },
        include: {
          product: { select: { id: true, name: true, price: true } }
        }
      });
      if (!card) return res.status(404).json({ message: 'Warranty card not found' });
      res.json(card);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch warranty card' });
    }
  }
};

module.exports = warrantyCardController; 