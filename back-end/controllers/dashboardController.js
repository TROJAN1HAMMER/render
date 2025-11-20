const prisma = require('../prisma/prisma');

const dashboardController = {
  // GET /admin/dashboard
  getDashboardSummary: async (req, res) => {
    try {
      // Get counts
      const totalUsers = await prisma.user.count();
      const totalProducts = await prisma.product.count();
      const totalOrders = await prisma.order.count();
      
      // Get total revenue
      const orders = await prisma.order.findMany({
        include: { orderItems: true }
      });
      const totalRevenue = orders.reduce((sum, order) => {
        return sum + order.orderItems.reduce((orderSum, item) => {
          return orderSum + (item.unitPrice * item.quantity);
        }, 0);
      }, 0);

      // Get low stock products
      const lowStockProducts = await prisma.product.findMany({
        where: { stockQuantity: { lt: 10 } },
        select: { id: true, name: true, stockQuantity: true }
      });

      // Get recent orders
      const recentOrders = await prisma.order.findMany({
        take: 5,
        include: {
          user: { select: { name: true, role: true } },
          orderItems: { include: { product: { select: { name: true } } } }
        },
        orderBy: { orderDate: 'desc' }
      });

      // Get unread notifications count
      const unreadNotifications = await prisma.notification.count({
        where: { read: false }
      });

      // Get users by role
      const usersByRole = await prisma.user.groupBy({
        by: ['role'],
        _count: { role: true }
      });

      res.json({
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        lowStockProducts,
        recentOrders,
        unreadNotifications,
        usersByRole
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch dashboard summary' });
    }
  }
};

module.exports = dashboardController; 