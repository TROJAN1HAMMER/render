const prisma = require('../prisma/prisma');

const chatController = {
  // GET /fieldExecutive/chat/messages
  getMessages: async (req, res) => {
    try {
      const userId = req.user.id;

      const fieldExec = await prisma.fieldExecutive.findUnique({
        where: { userId }
      });

      if (!fieldExec) {
        return res.status(403).json({ message: 'Not a Field Executive' });
      }

      // Mock response since we don't have the actual model yet
      res.status(200).json({
        messages: [
          {
            id: '1',
            sender: 'admin',
            content: 'Welcome to the chat system!',
            timestamp: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: '2',
            sender: 'system',
            content: 'You have new tasks assigned.',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          }
        ]
      });
    } catch (err) {
      console.error('Error in getMessages:', err);
      res.status(500).json({ message: 'Failed to retrieve messages' });
    }
  },

  // POST /fieldExecutive/chat/send
  sendMessage: async (req, res) => {
    try {
      const { content, recipientId } = req.body;
      const userId = req.user.id;

      if (!content) {
        return res.status(400).json({ message: 'Message content is required' });
      }

      const fieldExec = await prisma.fieldExecutive.findUnique({
        where: { userId }
      });

      if (!fieldExec) {
        return res.status(403).json({ message: 'Not a Field Executive' });
      }

      // Mock response since we don't have the actual model yet
      res.status(201).json({
        message: 'Message sent successfully',
        data: {
          id: Math.random().toString(36).substring(7),
          sender: userId,
          recipient: recipientId,
          content,
          timestamp: new Date().toISOString()
        }
      });
    } catch (err) {
      console.error('Error in sendMessage:', err);
      res.status(500).json({ message: 'Failed to send message' });
    }
  }
};

module.exports = chatController;