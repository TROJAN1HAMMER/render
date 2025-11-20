const prisma = require('../prisma/prisma');

const incentiveController = {
  // POST /admin/incentive
  assignIncentive: async (req, res) => {
    try {
      const { assignedId, description, points } = req.body;
      if (!assignedId || !description || !points) {
        return res.status(400).json({ message: 'Missing fields' });
      }

      const incentive = await prisma.incentive.create({
        data: {
          assignedId,
          description,
          points,
          assignedAt: new Date(),
        }
      });

      res.status(201).json({ message: 'Incentive assigned', incentive });
    } catch (err) {
      console.error('assignIncentive error:', err);
      res.status(500).json({ message: 'Failed to assign incentive' });
    }
  },

  // GET /admin/incentive?userId=...
  getAllIncentives: async (req, res) => {
    try {
      const { userId } = req.query;
      const where = userId ? { assignedId: userId } : {};

      const incentives = await prisma.incentive.findMany({
        where,
        include: {
          assignedTo: {
            select: { id: true, name: true, role: true }
          }
        },
        orderBy: { assignedAt: 'desc' }
      });

      res.json(incentives);
    } catch (err) {
      console.error('getAllIncentives error:', err);
      res.status(500).json({ message: 'Failed to fetch incentives' });
    }
  },

  // GET /user/incentive
  getMyIncentives: async (req, res) => {
    try {
      const userId = req.user.id;

      const myIncentives = await prisma.incentive.findMany({
        where: { assignedId: userId },
        orderBy: { assignedAt: 'desc' }
      });

      res.json(myIncentives);
    } catch (err) {
      console.error('getMyIncentives error:', err);
      res.status(500).json({ message: 'Failed to fetch incentives' });
    }
  }
};

module.exports = incentiveController;
