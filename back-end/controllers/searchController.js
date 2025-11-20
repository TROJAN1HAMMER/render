const prisma = require('../prisma/prisma');

const searchController = {
  // GET /admin/search/users?q=...&role=...&date=...
  searchUsers: async (req, res) => {
    try {
      const { q, role, startDate, endDate } = req.query;
      const where = {};
      if (q) {
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } }
        ];
      }
      if (role) where.role = role;
      if (startDate || endDate) {
        // Note: User model doesn't have createdAt, so we'll skip date filtering for now
        // where.createdAt = {};
        // if (startDate) where.createdAt.gte = new Date(startDate);
        // if (endDate) where.createdAt.lte = new Date(endDate);
      }
      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true
        },
        orderBy: { name: 'asc' }
      });
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Search failed' });
    }
  },

  // GET /admin/search/products?q=...&minPrice=...&maxPrice=...
  searchProducts: async (req, res) => {
    try {
      const { q, minPrice, maxPrice } = req.query;
      const where = {};
      if (q) {
        where.name = { contains: q, mode: 'insensitive' };
      }
      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = Number(minPrice);
        if (maxPrice) where.price.lte = Number(maxPrice);
      }
      const products = await prisma.product.findMany({
        where,
        orderBy: { name: 'asc' }
      });
      res.json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Search failed' });
    }
  },

  // GET /admin/search/orders?q=...&status=...&startDate=...&endDate=...
  searchOrders: async (req, res) => {
    try {
      const { q, status, startDate, endDate, userId } = req.query;
      const where = {};
      if (status) where.status = status;
      if (userId) where.userId = userId;
      if (startDate || endDate) {
        where.orderDate = {};
        if (startDate) where.orderDate.gte = new Date(startDate);
        if (endDate) where.orderDate.lte = new Date(endDate);
      }
      const orders = await prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          orderItems: {
            include: {
              product: { select: { name: true, price: true } }
            }
          }
        },
        orderBy: { orderDate: 'desc' }
      });
      // Filter by product name if q is provided
      const filtered = q ? orders.filter(order => 
        order.orderItems.some(item => 
          item.product.name.toLowerCase().includes(q.toLowerCase())
        )
      ) : orders;
      res.json(filtered);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Search failed' });
    }
  }
};

module.exports = searchController; 