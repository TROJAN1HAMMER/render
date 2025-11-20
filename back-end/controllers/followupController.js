const prisma = require('../prisma/prisma');

const followupController = {
  // GET all follow-ups for logged-in Field Executive
  getFollowUps: async (req, res) => {
    try {
      const executiveId = req.user.id;

      const executive = await prisma.fieldExecutive.findUnique({
        where: { userId: executiveId },
      });

      const followUps = await prisma.customerFollowUp.findMany({
        where: { executiveId: executive.id },
        orderBy: { nextFollowUpDate: 'asc' },
      });

      res.json(followUps);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch follow-ups' });
    }
  },

  // POST new follow-up
  createFollowUp: async (req, res) => {
    try {
      const { customerName, contactDetails, feedback, status, nextFollowUpDate } = req.body;
      const executiveId = req.user.id;

      const executive = await prisma.fieldExecutive.findUnique({
        where: { userId: executiveId },
      });

      const followUp = await prisma.customerFollowUp.create({
        data: {
          executiveId: executive.id,
          customerName,
          contactDetails,
          feedback,
          status,
          nextFollowUpDate: new Date(nextFollowUpDate),
        },
      });

      res.status(201).json({ message: 'Follow-up created', followUp });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to create follow-up' });
    }
  },

  // PUT update follow-up details
  updateFollowUp: async (req, res) => {
    try {
      const { id } = req.params;
      const { customerName, contactDetails, feedback, nextFollowUpDate } = req.body;

      const updated = await prisma.customerFollowUp.update({
        where: { id },
        data: {
          customerName,
          contactDetails,
          feedback,
          nextFollowUpDate: new Date(nextFollowUpDate),
        },
      });

      res.json({ message: 'Follow-up updated', followUp: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to update follow-up' });
    }
  },

  // PATCH update follow-up status only
  updateFollowUpStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updated = await prisma.customerFollowUp.update({
        where: { id },
        data: { status },
      });

      res.json({ message: 'Follow-up status updated', followUp: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to update status' });
    }
  },
};

module.exports = followupController;
