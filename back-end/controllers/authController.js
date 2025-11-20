
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = require('../prisma/prisma');
const { generateToken } = require('../utils/jwt');

const authController = {

  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = generateToken({ id: user.id, role: user.role });
      return res.json({ token, user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Login failed' });
    }
  },


  register: async (req, res) => {
    const { name, email, phone, password, role } = req.body;

    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({ message: 'User already exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);

    
      const user = await prisma.user.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
          role,
        },
      });


      const roleModel = {
        Admin: () => prisma.admin.create({ data: { userId: user.id } }),
        SalesManager: () => prisma.salesManager.create({ data: { userId: user.id } }),
        Plumber: () => prisma.plumber.create({ data: { userId: user.id } }),
        Accountant: () => prisma.accountant.create({ data: { userId: user.id } }),
        Distributor: () => prisma.distributor.create({ data: { userId: user.id } }),
        FieldExecutive: () => prisma.fieldExecutive.create({ data: { userId: user.id } }),
        Worker: () => prisma.worker.create({ data: { userId: user.id } }),
      };

      if (roleModel[role]) await roleModel[role]();

      const token = generateToken({ id: user.id, role: user.role });
      return res.status(201).json({ token, user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Registration failed' });
    }
  },
};

module.exports = authController;
