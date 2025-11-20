const prisma = require("../prisma/prisma");

const auditController = {
  // GET /admin/audit
  getAudits: async (req, res) => {
    try {
      const { userId, action, resource, startDate, endDate, page = 1, limit = 20 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = {};
      if (userId) where.userId = userId;
      if (action) where.action = action;
      if (resource) where.resource = resource;
      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp.gte = new Date(startDate);
        if (endDate) where.timestamp.lte = new Date(endDate);
      }

      const audits = await prisma.audit.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          user: { select: { id: true, name: true, email: true, role: true } }
        },
        orderBy: { timestamp: "desc" }
      });

      const total = await prisma.audit.count({ where });

      res.json({
        data: audits,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  },

  // POST /admin/audit
  createAudit: async (req, res) => {
    try {
      const { action, resource, details } = req.body;

      // take userId from logged-in user instead of request body
      const userId = req.user.id;

      const audit = await prisma.audit.create({
        data: {
          userId,
          action,
          resource,
          details: details || null
        }
      });

      res.status(201).json({ message: "Audit log created", audit });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create audit log" });
    }
  }
};

module.exports = auditController;
