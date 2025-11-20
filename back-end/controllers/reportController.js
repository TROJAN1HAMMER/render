const prisma = require('../prisma/prisma');

const reportController = {
  // GET /admin/reports/sales
  getSalesReport: async (req, res) => {
    try {
      const { startDate, endDate, productId, userId } = req.query;
      const orderWhere = {};
      if (startDate || endDate) {
        orderWhere.orderDate = {};
        if (startDate) orderWhere.orderDate.gte = new Date(startDate);
        if (endDate) orderWhere.orderDate.lte = new Date(endDate);
      }
      if (userId) orderWhere.userId = userId;
      const orders = await prisma.order.findMany({
        where: orderWhere,
        include: {
          orderItems: {
            include: {
              product: true
            }
          },
          user: true
        }
      });
      // Flatten all order items
      let allItems = [];
      orders.forEach(order => {
        order.orderItems.forEach(item => {
          if (!productId || item.productId === productId) {
            allItems.push({
              ...item,
              order,
              user: order.user,
              product: item.product
            });
          }
        });
      });
      // Total sales and count
      const totalSales = allItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      const salesCount = allItems.length;
      // Breakdown by product
      const salesByProduct = {};
      allItems.forEach(item => {
        const key = item.productId;
        if (!salesByProduct[key]) {
          salesByProduct[key] = {
            productId: key,
            productName: item.product.name,
            totalSold: 0,
            totalRevenue: 0
          };
        }
        salesByProduct[key].totalSold += item.quantity;
        salesByProduct[key].totalRevenue += item.unitPrice * item.quantity;
      });
      // Breakdown by user
      const salesByUser = {};
      allItems.forEach(item => {
        const key = item.user.id;
        if (!salesByUser[key]) {
          salesByUser[key] = {
            userId: key,
            userName: item.user.name,
            userRole: item.user.role,
            totalSold: 0,
            totalRevenue: 0
          };
        }
        salesByUser[key].totalSold += item.quantity;
        salesByUser[key].totalRevenue += item.unitPrice * item.quantity;
      });
      res.json({
        totalSales,
        salesCount,
        salesByProduct: Object.values(salesByProduct),
        salesByUser: Object.values(salesByUser)
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to generate sales report' });
    }
  },

  // GET /admin/reports/inventory
  getInventoryReport: async (req, res) => {
    try {
      const products = await prisma.product.findMany();
      // For each product, get current stock (stockQuantity), warranty, and low stock alert
      const inventory = products.map(product => ({
        id: product.id,
        name: product.name,
        stockQuantity: product.stockQuantity,
        warrantyPeriodInMonths: product.warrantyPeriodInMonths,
        lowStock: product.stockQuantity < 10
      }));
      res.json(inventory);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to generate inventory report' });
    }
  },

  // GET /admin/reports/performance
  getPerformanceReport: async (req, res) => {
    try {
      // Top-selling products
      const orderItems = await prisma.orderItem.findMany({
        include: { product: true, order: { include: { user: true } } }
      });
      const productSales = {};
      const userSales = {};
      orderItems.forEach(item => {
        // By product
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            productId: item.productId,
            productName: item.product.name,
            totalSold: 0
          };
        }
        productSales[item.productId].totalSold += item.quantity;
        // By user
        const user = item.order.user;
        if (!userSales[user.id]) {
          userSales[user.id] = {
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            totalSold: 0
          };
        }
        userSales[user.id].totalSold += item.quantity;
      });
      // Sort and get top 5
      const topProducts = Object.values(productSales).sort((a, b) => b.totalSold - a.totalSold).slice(0, 5);
      const topUsers = Object.values(userSales).sort((a, b) => b.totalSold - a.totalSold).slice(0, 5);
      res.json({ topProducts, topUsers });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to generate performance report' });
    }
  },

  // GET /admin/reports/individual
  getIndividualReport: async (req, res) => {
  try {
    const { userId, startDate, endDate, reportType = 'performance' } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Date filter builder
    const buildDateFilter = (field) => {
      if (!startDate && !endDate) return {};
      return {
        [field]: {
          ...(startDate ? { gte: new Date(startDate) } : {}),
          ...(endDate ? { lte: new Date(endDate) } : {})
        }
      };
    };

    const report = {
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      reportType,
      period: { startDate: startDate || 'All time', endDate: endDate || 'All time' },
      generatedAt: new Date()
    };

    switch (reportType) {
      case 'sales': {
        const userOrders = await prisma.order.findMany({
          where: {
            userId,
            ...buildDateFilter('orderDate')
          },
          include: {
            orderItems: { include: { product: true } }
          }
        });

        const totalSales = userOrders.reduce((sum, order) =>
          sum + order.orderItems.reduce((orderSum, item) =>
            orderSum + (item.unitPrice * item.quantity), 0), 0
        );

        const totalOrders = userOrders.length;
        const totalItems = userOrders.reduce((sum, order) =>
          sum + order.orderItems.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
        );

        report.salesData = {
          totalSales,
          totalOrders,
          totalItems,
          orders: userOrders.map(order => ({
            id: order.id,
            orderDate: order.orderDate,
            status: order.status,
            totalAmount: order.orderItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0),
            items: order.orderItems.map(item => ({
              productName: item.product?.name || 'Unknown Product',
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.unitPrice * item.quantity
            }))
          }))
        };
        break;
      }

      case 'attendance': {
        const attendances = await prisma.attendance.findMany({
          where: {
            userId,
            ...buildDateFilter('date')
          },
          orderBy: { date: 'desc' }
        });

        const totalDays = attendances.length;
        const presentDays = attendances.filter(att => att.checkIn && att.checkOut).length;
        const averageWorkHours = presentDays > 0
          ? attendances.reduce((sum, att) => {
              if (att.checkIn && att.checkOut) {
                const hours = (new Date(att.checkOut) - new Date(att.checkIn)) / (1000 * 60 * 60);
                return sum + hours;
              }
              return sum;
            }, 0) / presentDays
          : 0;

        report.attendanceData = {
          totalDays,
          presentDays,
          absentDays: totalDays - presentDays,
          attendanceRate: totalDays > 0 ? (presentDays / totalDays) * 100 : 0,
          averageWorkHours: Math.round(averageWorkHours * 100) / 100,
          attendances: attendances.map(att => ({
            date: att.date,
            checkIn: att.checkIn,
            checkOut: att.checkOut,
            workHours: att.checkIn && att.checkOut
              ? Math.round(((new Date(att.checkOut) - new Date(att.checkIn)) / (1000 * 60 * 60)) * 100) / 100
              : 0
          }))
        };
        break;
      }

      case 'points': {
        const pointTransactions = await prisma.pointTransaction.findMany({
          where: {
            userId,
            ...buildDateFilter('date')
          },
          orderBy: { date: 'desc' }
        });

        const totalPointsEarned = pointTransactions
          .filter(txn => txn.points > 0)
          .reduce((sum, txn) => sum + txn.points, 0);

        const totalPointsClaimed = pointTransactions
          .filter(txn => txn.points < 0)
          .reduce((sum, txn) => sum + Math.abs(txn.points), 0);

        const totalCashEarned = pointTransactions
          .filter(txn => txn.creditAmount > 0)
          .reduce((sum, txn) => sum + txn.creditAmount, 0);

        const currentBalance = pointTransactions.reduce((sum, txn) => sum + txn.points, 0);

        report.pointsData = {
          totalPointsEarned,
          totalPointsClaimed,
          totalCashEarned,
          currentBalance,
          transactions: pointTransactions.map(txn => ({
            date: txn.date,
            type: txn.type,
            points: txn.points,
            creditAmount: txn.creditAmount,
            reason: txn.reason
          }))
        };
        break;
      }

      case 'performance':
      default: {
        const [salesData, attendanceData, pointsData] = await Promise.all([
          prisma.order.findMany({
            where: { userId, ...buildDateFilter('orderDate') },
            include: { orderItems: { include: { product: true } } }
          }),
          prisma.attendance.findMany({
            where: { userId, ...buildDateFilter('date') }
          }),
          prisma.pointTransaction.findMany({
            where: { userId, ...buildDateFilter('date') }
          })
        ]);

        const totalSales = salesData.reduce((sum, order) =>
          sum + order.orderItems.reduce((orderSum, item) =>
            orderSum + (item.unitPrice * item.quantity), 0), 0
        );

        const attendanceRate = attendanceData.length > 0
          ? (attendanceData.filter(att => att.checkIn && att.checkOut).length / attendanceData.length) * 100
          : 0;

        const totalPoints = pointsData.reduce((sum, txn) => sum + txn.points, 0);

        report.performanceData = {
          totalSales,
          totalOrders: salesData.length,
          attendanceRate: Math.round(attendanceRate * 100) / 100,
          totalPoints
        };
        break;
      }
    }

    return res.json(report);
  } catch (err) {
    console.error('getIndividualReport error:', err);
    return res.status(500).json({ message: 'Failed to generate individual report' });
  }
}

};

module.exports = reportController; 