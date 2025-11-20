const prisma = require('../prisma/prisma');

const pointController = {
  // Admin: GET /admin/points?userId=&type=
  getAllTransactions: async (req, res) => {
    try {
      const { userId, type } = req.query;
      const filters = {};
      if (userId) filters.userId = userId;
      if (type) filters.type = type;

      const txns = await prisma.pointTransaction.findMany({
        where: filters,
        include: {
          user: {
            select: { id: true, name: true, role: true }
          }
        },
        orderBy: { date: 'desc' }
      });

      res.json(txns);
    } catch (err) {
      console.error('getAllTransactions error:', err);
      res.status(500).json({ message: 'Failed to fetch transactions' });
    }
  },

  // User: GET /user/points
  getMyTransactions: async (req, res) => {
    try {
      const userId = req.user.id;

      const txns = await prisma.pointTransaction.findMany({
        where: { userId },
        orderBy: { date: 'desc' }
      });

      res.json(txns);
    } catch (err) {
      console.error('getMyTransactions error:', err);
      res.status(500).json({ message: 'Failed to fetch your transactions' });
    }
  },

  // User: POST /user/points/claim
  claimPoints: async (req, res) => {
    try {
      const userId = req.user.id;
      const { points, reason } = req.body;

      if (!points || !reason) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const txn = await prisma.pointTransaction.create({
        data: {
          userId,
          points: -Math.abs(points),
          creditAmount: 0,
          reason,
          type: 'Claimed',
          date: new Date()
        }
      });

      res.status(201).json({ message: 'Points claimed', transaction: txn });
    } catch (err) {
      console.error('claimPoints error:', err);
      res.status(500).json({ message: 'Failed to claim points' });
    }
  },

  // Admin: POST /admin/points/adjust
  adjustPoints: async (req, res) => {
    try {
      const { userId, points, reason } = req.body;

      if (!userId || !points || !reason) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const txn = await prisma.pointTransaction.create({
        data: {
          userId,
          points,
          creditAmount: 0,
          reason,
          type: 'Adjusted',
          date: new Date()
        }
      });

      res.status(201).json({ message: 'Points adjusted', transaction: txn });
    } catch (err) {
      console.error('adjustPoints error:', err);
      res.status(500).json({ message: 'Failed to adjust points' });
    }
  },

  // Admin: POST /admin/points/convert
  convertPointsToCash: async (req, res) => {
    try {
      const { userId, points, conversionRate, reason } = req.body;

      if (!userId || !points || !conversionRate) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      if (points <= 0 || conversionRate <= 0) {
        return res.status(400).json({ message: 'Points and conversion rate must be positive' });
      }

      // Check if user has sufficient points
      const userTransactions = await prisma.pointTransaction.findMany({
        where: { userId }
      });

      const totalPoints = userTransactions.reduce((sum, txn) => sum + txn.points, 0);
      
      if (totalPoints < points) {
        return res.status(400).json({ 
          message: 'Insufficient points', 
          available: totalPoints, 
          requested: points 
        });
      }

      // Calculate cash amount
      const cashAmount = points * conversionRate;

      // Create transaction record for points deduction
      const pointsTransaction = await prisma.pointTransaction.create({
        data: {
          userId,
          points: -points, // Negative to deduct points
          creditAmount: 0,
          reason: reason || `Points converted to cash at rate ${conversionRate}`,
          type: 'Claimed',
          date: new Date()
        }
      });

      // Create transaction record for cash credit
      const cashTransaction = await prisma.pointTransaction.create({
        data: {
          userId,
          points: 0,
          creditAmount: cashAmount,
          reason: reason || `Cash credit from points conversion`,
          type: 'Earned',
          date: new Date()
        }
      });

      res.status(200).json({ 
        message: 'Points converted to cash successfully',
        pointsConverted: points,
        cashAmount: cashAmount,
        conversionRate: conversionRate,
        pointsTransaction: pointsTransaction,
        cashTransaction: cashTransaction
      });
    } catch (err) {
      console.error('convertPointsToCash error:', err);
      res.status(500).json({ message: 'Failed to convert points to cash' });
    }
  }
};

module.exports = pointController;
