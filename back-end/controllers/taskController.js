const prisma = require('../prisma/prisma');

const taskController = {
  // GET /field-executive/tasks
  getTasks: async (req, res) => {
    try {
      const requesterUserId = req.user.id;
      const requesterRole = req.user.role;
      const { executiveUserId } = req.query;

      // Manager/Admin can fetch for a specific executive via executiveUserId,
      // or fetch ALL tasks when no executiveUserId is provided.
      if ((requesterRole === 'SalesManager' || requesterRole === 'Admin')) {
        if (executiveUserId) {
          const targetExecutive = await prisma.fieldExecutive.findUnique({ where: { userId: executiveUserId } });
          if (!targetExecutive) {
            return res.status(400).json({ message: 'Invalid executiveUserId: Field Executive not found' });
          }
          const tasks = await prisma.task.findMany({
            where: { executiveId: targetExecutive.id },
            orderBy: { dueDate: 'asc' },
          });
          return res.json(tasks);
        }
        // No executive specified: return all tasks
        const tasks = await prisma.task.findMany({
          orderBy: { dueDate: 'asc' },
        });
        return res.json(tasks);
      }

      // Field Executive: only own tasks
      const targetExecutive = await prisma.fieldExecutive.findUnique({ where: { userId: requesterUserId } });
      if (!targetExecutive) {
        return res.status(403).json({ message: 'Not a Field Executive' });
      }
      const tasks = await prisma.task.findMany({
        where: { executiveId: targetExecutive.id },
        orderBy: { dueDate: 'asc' },
      });

      return res.json(tasks);
    } catch (err) {
      console.error('Error in getTasks:', err);
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  },

  // POST /field-executive/tasks
  createTask: async (req, res) => {
    try {
      const { title, description, status, dueDate, executiveUserId } = req.body;
      const requesterUserId = req.user.id;
      const requesterRole = req.user.role;

      // Determine target executive: if SalesManager provided an executiveUserId, use that.
      // Otherwise, default to the authenticated FieldExecutive user.
      let targetExecutive = null;
      if (executiveUserId && (requesterRole === 'SalesManager' || requesterRole === 'Admin')) {
        targetExecutive = await prisma.fieldExecutive.findUnique({
          where: { userId: executiveUserId },
        });
        if (!targetExecutive) {
          return res.status(400).json({ message: 'Invalid executiveUserId: Field Executive not found' });
        }
      } else {
        // Fallback to FE self action
        targetExecutive = await prisma.fieldExecutive.findUnique({
          where: { userId: requesterUserId },
        });
        if (!targetExecutive) {
          return res.status(403).json({ message: 'Not a Field Executive' });
        }
      }

      const task = await prisma.task.create({
        data: {
          title,
          description,
          status: status || 'Pending',
          dueDate: dueDate ? new Date(dueDate) : null,
          executiveId: targetExecutive.id,
        },
      });

      res.status(201).json({ message: 'Task created', task });
    } catch (err) {
      console.error('Error in createTask:', err);
      res.status(500).json({ message: 'Failed to create task' });
    }
  },

  // PUT /field-executive/tasks/:id
  updateTask: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, dueDate } = req.body;
      const requesterRole = req.user.role;
      const requesterUserId = req.user.id;

      let existingTask;
      if (requesterRole === 'SalesManager' || requesterRole === 'Admin') {
        // Manager/Admin can update any task
        existingTask = await prisma.task.findUnique({ where: { id } });
      } else {
        // Field Executive can only update own tasks
        const executive = await prisma.fieldExecutive.findUnique({ where: { userId: requesterUserId } });
        if (!executive) {
          return res.status(403).json({ message: 'Not a Field Executive' });
        }
        existingTask = await prisma.task.findFirst({ where: { id, executiveId: executive.id } });
      }

      if (!existingTask) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const updated = await prisma.task.update({
        where: { id },
        data: {
          title,
          description,
          dueDate: dueDate ? new Date(dueDate) : null,
        },
      });

      res.json({ message: 'Task updated', task: updated });
    } catch (err) {
      console.error('Error in updateTask:', err);
      res.status(500).json({ message: 'Failed to update task' });
    }
  },

  // PATCH /field-executive/tasks/:id/status
  updateTaskStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const executiveId = req.user.id;

      const executive = await prisma.fieldExecutive.findUnique({
        where: { userId: executiveId },
      });

      if (!executive) {
        return res.status(403).json({ message: 'Not a Field Executive' });
      }

      // Ensure the task belongs to this executive
      const existingTask = await prisma.task.findFirst({
        where: {
          id,
          executiveId: executive.id,
        },
      });

      if (!existingTask) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const updated = await prisma.task.update({
        where: { id },
        data: { status },
      });

      res.json({ message: 'Task status updated', task: updated });
    } catch (err) {
      console.error('Error in updateTaskStatus:', err);
      res.status(500).json({ message: 'Failed to update task status' });
    }
  },

  // DELETE /field-executive/tasks/:id
  deleteTask: async (req, res) => {
    try {
      const { id } = req.params;
      const requesterRole = req.user.role;
      const requesterUserId = req.user.id;

      let existingTask;
      if (requesterRole === 'SalesManager' || requesterRole === 'Admin') {
        // Manager/Admin can delete any task
        existingTask = await prisma.task.findUnique({ where: { id } });
      } else {
        // Field Executive can only delete own tasks
        const executive = await prisma.fieldExecutive.findUnique({ where: { userId: requesterUserId } });
        if (!executive) {
          return res.status(403).json({ message: 'Not a Field Executive' });
        }
        existingTask = await prisma.task.findFirst({ where: { id, executiveId: executive.id } });
      }

      if (!existingTask) {
        return res.status(404).json({ message: 'Task not found' });
      }

      await prisma.task.delete({
        where: { id },
      });

      res.json({ message: 'Task deleted' });
    } catch (err) {
      console.error('Error in deleteTask:', err);
      res.status(500).json({ message: 'Failed to delete task' });
    }
  },
};

module.exports = taskController;