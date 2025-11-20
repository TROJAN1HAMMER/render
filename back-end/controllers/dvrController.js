const prisma = require('../prisma/prisma');

const dvrController = {
  // POST /fieldExecutive/dvr
  createDVR: async (req, res) => {
    try {
      const { feedback, location } = req.body;
      const executiveId = req.user.id;

      const fieldExec = await prisma.fieldExecutive.findUnique({
        where: { userId: executiveId }
      });

      if (!fieldExec) {
        return res.status(403).json({ message: 'Not a Field Executive' });
      }

      const dvr = await prisma.dVR.create({
        data: {
          feedback,
          location,
          executiveId: fieldExec.id
        }
      });

      res.status(201).json({ message: 'DVR submitted', dvr });
    } catch (err) {
      console.error('Error in createDVR:', err);
      res.status(500).json({ message: 'Failed to submit DVR' });
    }
  },

  // GET /fieldExecutive/dvr
  getMyDVRs: async (req, res) => {
    try {
      const requesterUserId = req.user.id;
      const requesterRole = req.user.role;
      const { executiveUserId } = req.query;

      // Manager/Admin: fetch all or filter by executiveUserId
      if (requesterRole === 'SalesManager' || requesterRole === 'Admin') {
        if (executiveUserId) {
          const exec = await prisma.fieldExecutive.findUnique({ where: { userId: executiveUserId } });
          if (!exec) {
            return res.status(400).json({ message: 'Invalid executiveUserId: Field Executive not found' });
          }
          const list = await prisma.dVR.findMany({
            where: { executiveId: exec.id },
            orderBy: { id: 'desc' },
            include: {
              executive: {
                include: { user: true },
              },
            },
          });
          const withNames = list.map((d) => ({
            id: d.id,
            executiveId: d.executiveId,
            feedback: d.feedback,
            location: d.location,
            status: d.status,
            approvedBy: d.approvedBy,
            approvedAt: d.approvedAt,
            executiveName: d.executive?.user?.name || 'Field Executive',
          }));
          return res.json(withNames);
        }
        const list = await prisma.dVR.findMany({
          orderBy: { id: 'desc' },
          include: {
            executive: {
              include: { user: true },
            },
          },
        });
        const withNames = list.map((d) => ({
          id: d.id,
          executiveId: d.executiveId,
          feedback: d.feedback,
          location: d.location,
          status: d.status,
          approvedBy: d.approvedBy,
          approvedAt: d.approvedAt,
          executiveName: d.executive?.user?.name || 'Field Executive',
        }));
        return res.json(withNames);
      }

      // Field Executive: only own DVRs
      const fieldExec = await prisma.fieldExecutive.findUnique({
        where: { userId: requesterUserId }
      });

      if (!fieldExec) {
        return res.status(403).json({ message: 'Not a Field Executive' });
      }

      const dvrList = await prisma.dVR.findMany({
        where: { executiveId: fieldExec.id },
        orderBy: { id: 'desc' },
        include: {
          executive: {
            include: { user: true },
          },
        },
      });

      const withNames = dvrList.map((d) => ({
        id: d.id,
        executiveId: d.executiveId,
        feedback: d.feedback,
        location: d.location,
        status: d.status,
        approvedBy: d.approvedBy,
        approvedAt: d.approvedAt,
        executiveName: d.executive?.user?.name || 'Field Executive',
      }));

      res.json(withNames);
    } catch (err) {
      console.error('Error in getMyDVRs:', err);
      res.status(500).json({ message: 'Failed to fetch DVR reports' });
    }
  },

  // PATCH /fieldExecutive/dvr/:id/approve
  approveDVR: async (req, res) => {
    try {
      const { id } = req.params;
      const requesterRole = req.user.role;
      const requesterUserId = req.user.id;

      if (!(requesterRole === 'SalesManager' || requesterRole === 'Admin')) {
        return res.status(403).json({ message: 'Forbidden: only SalesManager/Admin can approve DVRs' });
      }

      const existing = await prisma.dVR.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ message: 'DVR not found' });
      }

      const updated = await prisma.dVR.update({
        where: { id },
        data: {
          status: 'Approved',
          approvedBy: requesterUserId,
          approvedAt: new Date(),
        },
      });

      return res.json({ message: 'DVR approved', dvr: updated });
    } catch (err) {
      console.error('Error in approveDVR:', err);
      return res.status(500).json({ message: 'Failed to approve DVR' });
    }
  },

  // PATCH /fieldExecutive/dvr/:id/reject
  rejectDVR: async (req, res) => {
    try {
      const { id } = req.params;
      const requesterRole = req.user.role;
      const requesterUserId = req.user.id;

      if (!(requesterRole === 'SalesManager' || requesterRole === 'Admin')) {
        return res.status(403).json({ message: 'Forbidden: only SalesManager/Admin can reject DVRs' });
      }

      const existing = await prisma.dVR.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ message: 'DVR not found' });
      }

      const updated = await prisma.dVR.update({
        where: { id },
        data: {
          status: 'Rejected',
          approvedBy: requesterUserId,
          approvedAt: new Date(),
        },
      });

      return res.json({ message: 'DVR rejected', dvr: updated });
    } catch (err) {
      console.error('Error in rejectDVR:', err);
      return res.status(500).json({ message: 'Failed to reject DVR' });
    }
  }
};

module.exports = dvrController;
