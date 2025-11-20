const prisma = require('../prisma/prisma');

const companyController = {
  // GET /admin/companies - Get all companies
  getAllCompanies: async (req, res) => {
    try {
      const companies = await prisma.company.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          description: true,
          logoUrl: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { name: 'asc' }
      });
      res.json(companies);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch companies' });
    }
  },

  // GET /admin/companies/:id - Get company by ID
  getCompanyById: async (req, res) => {
    try {
      const { id } = req.params;
      const company = await prisma.company.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          logoUrl: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          admins: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });
      if (!company) return res.status(404).json({ message: 'Company not found' });
      res.json(company);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch company' });
    }
  },

  // POST /admin/companies - Create new company
  createCompany: async (req, res) => {
    try {
      const { name, description, logoUrl } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Company name is required' });
      }

      // Check if company with same name already exists
      const existingCompany = await prisma.company.findUnique({
        where: { name }
      });
      if (existingCompany) {
        return res.status(400).json({ message: 'Company with this name already exists' });
      }

      const company = await prisma.company.create({
        data: {
          name,
          description,
          logoUrl
        },
        select: {
          id: true,
          name: true,
          description: true,
          logoUrl: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });

      res.status(201).json({ message: 'Company created successfully', company });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to create company' });
    }
  },

  // PUT /admin/companies/:id - Update company
  updateCompany: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, logoUrl, isActive } = req.body;

      const existingCompany = await prisma.company.findUnique({
        where: { id }
      });
      if (!existingCompany) {
        return res.status(404).json({ message: 'Company not found' });
      }

      // Check if new name conflicts with existing company
      if (name && name !== existingCompany.name) {
        const nameConflict = await prisma.company.findUnique({
          where: { name }
        });
        if (nameConflict) {
          return res.status(400).json({ message: 'Company with this name already exists' });
        }
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
      if (isActive !== undefined) updateData.isActive = isActive;

      const updatedCompany = await prisma.company.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          description: true,
          logoUrl: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });

      res.json({ message: 'Company updated successfully', company: updatedCompany });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to update company' });
    }
  },

  // DELETE /admin/companies/:id - Soft delete company (set isActive to false)
  deleteCompany: async (req, res) => {
    try {
      const { id } = req.params;

      const existingCompany = await prisma.company.findUnique({
        where: { id }
      });
      if (!existingCompany) {
        return res.status(404).json({ message: 'Company not found' });
      }

      // Check if company has any admins
      const adminCount = await prisma.admin.count({
        where: { companyId: id }
      });
      if (adminCount > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete company with associated admins. Please reassign admins first.' 
        });
      }

      await prisma.company.update({
        where: { id },
        data: { isActive: false }
      });

      res.json({ message: 'Company deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to delete company' });
    }
  },

  // POST /admin/companies/:id/switch - Switch admin to a different company
  switchCompany: async (req, res) => {
    try {
      const { id: companyId } = req.params;
      const adminId = req.user.id; // Assuming user ID is available from auth middleware

      // Verify the company exists and is active
      const company = await prisma.company.findUnique({
        where: { id: companyId, isActive: true }
      });
      if (!company) {
        return res.status(404).json({ message: 'Company not found or inactive' });
      }

      // Get admin record
      const admin = await prisma.admin.findUnique({
        where: { userId: adminId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          company: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      if (!admin) {
        return res.status(404).json({ message: 'Admin record not found' });
      }

      // Update admin's company
      const updatedAdmin = await prisma.admin.update({
        where: { userId: adminId },
        data: { companyId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          company: {
            select: {
              id: true,
              name: true,
              description: true,
              logoUrl: true
            }
          }
        }
      });

      res.json({ 
        message: 'Company switched successfully', 
        admin: updatedAdmin,
        previousCompany: admin.company
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to switch company' });
    }
  },

  // GET /admin/companies/current - Get current admin's company
  getCurrentCompany: async (req, res) => {
    try {
      const adminId = req.user.id; // Assuming user ID is available from auth middleware

      const admin = await prisma.admin.findUnique({
        where: { userId: adminId },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              description: true,
              logoUrl: true,
              isActive: true
            }
          }
        }
      });

      if (!admin) {
        return res.status(404).json({ message: 'Admin record not found' });
      }

      if (!admin.company) {
        return res.status(404).json({ message: 'No company assigned to this admin' });
      }

      res.json({ company: admin.company });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch current company' });
    }
  },

  // POST /admin/companies/:id/assign-admin - Assign admin to company
  assignAdminToCompany: async (req, res) => {
    try {
      const { id: companyId } = req.params;
      const { adminId } = req.body;

      if (!adminId) {
        return res.status(400).json({ message: 'Admin ID is required' });
      }

      // Verify the company exists and is active
      const company = await prisma.company.findUnique({
        where: { id: companyId, isActive: true }
      });
      if (!company) {
        return res.status(404).json({ message: 'Company not found or inactive' });
      }

      // Verify the admin exists
      const admin = await prisma.admin.findUnique({
        where: { userId: adminId }
      });
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }

      // Update admin's company
      const updatedAdmin = await prisma.admin.update({
        where: { userId: adminId },
        data: { companyId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          company: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      res.json({ 
        message: 'Admin assigned to company successfully', 
        admin: updatedAdmin
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to assign admin to company' });
    }
  }
};

module.exports = companyController;
