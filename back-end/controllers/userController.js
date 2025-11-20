const prisma = require('../prisma/prisma');
const bcrypt = require('bcrypt');

const userController = {
  // GET /admin/users?role=RoleName
  getAllUsers: async (req, res) => {
    try {
      const { role } = req.query;
      const where = role ? { role } : {};
      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true
        }
      });
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  },

  // GET /admin/users/by-username/:username
  getUserByUsername: async (req, res) => {
    try {
      const { username } = req.params;
      const user = await prisma.user.findFirst({
        where: { name: username },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true
        }
      });
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  },

  // GET /admin/users/:id
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true
        }
      });
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  },

  // PUT /admin/users/by-username/:username
  updateUserByUsername: async (req, res) => {
    try {
      const { username } = req.params;
      const { name, email, phone, password, role } = req.body;
      const user = await prisma.user.findFirst({ where: { name: username } });
      if (!user) return res.status(404).json({ message: 'User not found' });
      let updateData = { name, email, phone };
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }
      if (role && role !== user.role) {
        const oldRoleModel = {
          Admin: () => prisma.admin.deleteMany({ where: { userId: user.id } }),
          SalesManager: () => prisma.salesManager.deleteMany({ where: { userId: user.id } }),
          Plumber: () => prisma.plumber.deleteMany({ where: { userId: user.id } }),
          Accountant: () => prisma.accountant.deleteMany({ where: { userId: user.id } }),
          Distributor: () => prisma.distributor.deleteMany({ where: { userId: user.id } }),
          FieldExecutive: () => prisma.fieldExecutive.deleteMany({ where: { userId: user.id } }),
          Worker: () => prisma.worker.deleteMany({ where: { userId: user.id } }),
        };
        if (oldRoleModel[user.role]) await oldRoleModel[user.role]();
        const newRoleModel = {
          Admin: () => prisma.admin.create({ data: { userId: user.id } }),
          SalesManager: () => prisma.salesManager.create({ data: { userId: user.id } }),
          Plumber: () => prisma.plumber.create({ data: { userId: user.id } }),
          Accountant: () => prisma.accountant.create({ data: { userId: user.id } }),
          Distributor: () => prisma.distributor.create({ data: { userId: user.id } }),
          FieldExecutive: () => prisma.fieldExecutive.create({ data: { userId: user.id } }),
          Worker: () => prisma.worker.create({ data: { userId: user.id } }),
        };
        if (newRoleModel[role]) await newRoleModel[role]();
        updateData.role = role;
      }
      const updated = await prisma.user.update({ where: { id: user.id }, data: updateData });
      res.json({ message: 'User updated', user: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to update user' });
    }
  },

  // POST /admin/users
  createUser: async (req, res) => {
    try {
      const { name, email, phone, password, role } = req.body;
      if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({ message: 'User already exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, phone, password: hashedPassword, role }
      });
      // Attach role-specific data
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
      res.status(201).json({ message: 'User created', user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to create user' });
    }
  },

  // PUT /admin/users/:id
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, phone, password, role } = req.body;
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return res.status(404).json({ message: 'User not found' });
      let updateData = { name, email, phone };
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }
      if (role && role !== user.role) {
        // Remove old role-specific record
        const oldRoleModel = {
          Admin: () => prisma.admin.deleteMany({ where: { userId: id } }),
          SalesManager: () => prisma.salesManager.deleteMany({ where: { userId: id } }),
          Plumber: () => prisma.plumber.deleteMany({ where: { userId: id } }),
          Accountant: () => prisma.accountant.deleteMany({ where: { userId: id } }),
          Distributor: () => prisma.distributor.deleteMany({ where: { userId: id } }),
          FieldExecutive: () => prisma.fieldExecutive.deleteMany({ where: { userId: id } }),
          Worker: () => prisma.worker.deleteMany({ where: { userId: id } }),
        };
        if (oldRoleModel[user.role]) await oldRoleModel[user.role]();
        // Add new role-specific record
        const newRoleModel = {
          Admin: () => prisma.admin.create({ data: { userId: id } }),
          SalesManager: () => prisma.salesManager.create({ data: { userId: id } }),
          Plumber: () => prisma.plumber.create({ data: { userId: id } }),
          Accountant: () => prisma.accountant.create({ data: { userId: id } }),
          Distributor: () => prisma.distributor.create({ data: { userId: id } }),
          FieldExecutive: () => prisma.fieldExecutive.create({ data: { userId: id } }),
          Worker: () => prisma.worker.create({ data: { userId: id } }),
        };
        if (newRoleModel[role]) await newRoleModel[role]();
        updateData.role = role;
      }
      const updated = await prisma.user.update({ where: { id }, data: updateData });
      res.json({ message: 'User updated', user: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to update user' });
    }
  },

  // DELETE /admin/users/:id
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return res.status(404).json({ message: 'User not found' });
      // Remove role-specific record
      const roleModel = {
        Admin: () => prisma.admin.deleteMany({ where: { userId: id } }),
        SalesManager: () => prisma.salesManager.deleteMany({ where: { userId: id } }),
        Plumber: () => prisma.plumber.deleteMany({ where: { userId: id } }),
        Accountant: () => prisma.accountant.deleteMany({ where: { userId: id } }),
        Distributor: () => prisma.distributor.deleteMany({ where: { userId: id } }),
        FieldExecutive: () => prisma.fieldExecutive.deleteMany({ where: { userId: id } }),
        Worker: () => prisma.worker.deleteMany({ where: { userId: id } }),
      };
      if (roleModel[user.role]) await roleModel[user.role]();
      await prisma.user.delete({ where: { id } });
      res.json({ message: 'User deleted' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  },

  // DELETE /admin/users/by-username/:username
  deleteUserByUsername: async (req, res) => {
    try {
      const { username } = req.params;
      const user = await prisma.user.findFirst({ where: { name: username } });
      if (!user) return res.status(404).json({ message: 'User not found' });
      const roleModel = {
        Admin: () => prisma.admin.deleteMany({ where: { userId: user.id } }),
        SalesManager: () => prisma.salesManager.deleteMany({ where: { userId: user.id } }),
        Plumber: () => prisma.plumber.deleteMany({ where: { userId: user.id } }),
        Accountant: () => prisma.accountant.deleteMany({ where: { userId: user.id } }),
        Distributor: () => prisma.distributor.deleteMany({ where: { userId: user.id } }),
        FieldExecutive: () => prisma.fieldExecutive.deleteMany({ where: { userId: user.id } }),
        Worker: () => prisma.worker.deleteMany({ where: { userId: user.id } }),
      };
      if (roleModel[user.role]) await roleModel[user.role]();
      await prisma.user.delete({ where: { id: user.id } });
      res.json({ message: 'User deleted' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  },
};

module.exports = userController; 