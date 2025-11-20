const prisma = require('../prisma/prisma');
const { startOfDay, endOfDay } = require('date-fns');

const attendanceController = {
  // POST /worker/attendance
  markAttendance: async (req, res) => {
    const userId = req.user.id;
    const now = new Date();

    try {
      // Check if already checked in today
      const today = await prisma.attendance.findFirst({
        where: {
          userId,
          date: {
            gte: startOfDay(now),
            lte: endOfDay(now),
          },
        },
      });

      if (!today) {
        // First time → Check-in
        const attendance = await prisma.attendance.create({
          data: {
            userId,
            date: now,
            checkIn: now,
          },
        });
        return res.status(201).json({ message: 'Check-in successful', attendance });
      } else if (!today.checkOut) {
        // Second time → Check-out
        const attendance = await prisma.attendance.update({
          where: { id: today.id },
          data: { checkOut: now },
        });
        return res.json({ message: 'Check-out successful', attendance });
      } else {
        return res.status(400).json({ message: 'You have already checked out today.' });
      }
    } catch (err) {
      console.error('Error marking attendance:', err);
      res.status(500).json({ message: 'Failed to mark attendance' });
    }
  },

  // GET /worker/attendance/today
  getTodayAttendance: async (req, res) => {
    const userId = req.user.id;
    const now = new Date();

    try {
      const attendance = await prisma.attendance.findFirst({
        where: {
          userId,
          date: {
            gte: startOfDay(now),
            lte: endOfDay(now),
          },
        },
      });

      if (!attendance) {
        return res.status(404).json({ message: 'No attendance record for today' });
      }

      res.json(attendance);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch today\'s attendance' });
    }
  },

  // GET /worker/attendance
  getMyAttendance: async (req, res) => {
    const userId = req.user.id;

    try {
      const records = await prisma.attendance.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
      });

      res.json(records);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch attendance records' });
    }
  },
};

module.exports = attendanceController;
