const prisma = require("../prisma/prisma");

const notificationController = {
  // GET /admin/notifications
  getNotifications: async (req, res) => {
    try {
      const { unreadOnly } = req.query;
      const where = {};
      if (unreadOnly === "true") where.isRead = false;

      const notifications = await prisma.notification.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } }
        },
        orderBy: { createdAt: "desc" }
      });

      res.json(notifications);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  },

  // POST /admin/notifications
  createNotification: async (req, res) => {
    try {
      const { type, message, userId } = req.body;

      const notification = await prisma.notification.create({
        data: {
          type,
          message,
          userId: userId || null,
          isRead: false // 👈 ensure default on creation
        }
      });

      res.status(201).json({ message: "Notification created", notification });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create notification" });
    }
  },

  // PUT /admin/notifications/:id/read
  markAsRead: async (req, res) => {
    try {
      const { id } = req.params;

      const notification = await prisma.notification.update({
        where: { id },
        data: { isRead: true }
      });

      res.json({ message: "Notification marked as read", notification });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  },

  // PUT /admin/notifications/read-all
  markAllAsRead: async (req, res) => {
    try {
      await prisma.notification.updateMany({
        where: { isRead: false },
        data: { isRead: true }
      });

      res.json({ message: "All notifications marked as read" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  }
};

module.exports = notificationController;
