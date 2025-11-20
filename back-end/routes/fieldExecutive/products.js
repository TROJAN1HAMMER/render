const express = require('express');
const router = express.Router();
const prisma = require('../../prisma/prisma');
const authenticate = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/roleCheck');

// List products accessible to Field Executive
router.use(authenticate);
router.use(authorizeRoles('FieldExecutive'));

// GET /fieldExecutive/products?search=...&categoryId=...
router.get('/', async (req, res) => {
  try {
    const { search, categoryId } = req.query;
    const where = {};
    if (search) {
      where.name = { contains: String(search), mode: 'insensitive' };
    }
    if (categoryId) {
      where.categoryId = String(categoryId);
    }
    const products = await prisma.product.findMany({
      where,
      select: { id: true, name: true, price: true },
      orderBy: { name: 'asc' },
    });
    res.json(products);
  } catch (err) {
    console.error('GET /fieldExecutive/products error:', err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

module.exports = router;
