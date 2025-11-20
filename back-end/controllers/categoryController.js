const { PrismaClient } = require('@prisma/client');
const prisma = require('../prisma/prisma');

const categoryController = {
  // Get all categories
  getAllCategories: async (req, res) => {
    try {
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: { products: true }
          }
        },
        orderBy: { name: 'asc' }
      });

      res.json(categories);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  },

  // Get category by ID
  getCategoryById: async (req, res) => {
    const { id } = req.params;

    try {
      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              price: true,
              stockQuantity: true
            }
          }
        }
      });

      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      res.json(category);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch category' });
    }
  },

  // Get category by NAME
  getCategoryByName: async (req, res) => {
    const { name } = req.params;
    try {
      const category = await prisma.category.findUnique({
        where: { name },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              price: true,
              stockQuantity: true
            }
          }
        }
      });
      if (!category) return res.status(404).json({ message: 'Category not found' });
      res.json(category);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch category' });
    }
  },

  // Create new category
  createCategory: async (req, res) => {
    const { name, description } = req.body;

    try {
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: 'Category name is required' });
      }

      // Check if category already exists
      const existingCategory = await prisma.category.findUnique({
        where: { name: name.trim() }
      });

      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }

      const category = await prisma.category.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null
        }
      });

      res.status(201).json({ message: 'Category created successfully', category });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to create category' });
    }
  },

  // Update category
  updateCategory: async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: 'Category name is required' });
      }

      // Check if category exists
      const existingCategory = await prisma.category.findUnique({
        where: { id }
      });

      if (!existingCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }

      // Check if new name conflicts with existing category
      if (name !== existingCategory.name) {
        const nameConflict = await prisma.category.findUnique({
          where: { name: name.trim() }
        });

        if (nameConflict) {
          return res.status(400).json({ message: 'Category with this name already exists' });
        }
      }

      const updatedCategory = await prisma.category.update({
        where: { id },
        data: {
          name: name.trim(),
          description: description?.trim() || null
        }
      });

      res.json({ message: 'Category updated successfully', category: updatedCategory });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to update category' });
    }
  },

  // Update category by NAME
  updateCategoryByName: async (req, res) => {
    const { name } = req.params;
    const { name: newName, description } = req.body;
    try {
      const existingCategory = await prisma.category.findUnique({ where: { name } });
      if (!existingCategory) return res.status(404).json({ message: 'Category not found' });
      if (newName && newName !== name) {
        const conflict = await prisma.category.findUnique({ where: { name: newName.trim() } });
        if (conflict) return res.status(400).json({ message: 'Category with this name already exists' });
      }
      const updatedCategory = await prisma.category.update({
        where: { id: existingCategory.id },
        data: {
          name: newName ? newName.trim() : undefined,
          description: description?.trim() || undefined
        }
      });
      res.json({ message: 'Category updated successfully', category: updatedCategory });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to update category' });
    }
  },

  // Delete category
  deleteCategory: async (req, res) => {
    const { id } = req.params;

    try {
      // Check if category exists
      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          _count: { select: { products: true } }
        }
      });

      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      // Check if category has products
      if (category._count.products > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete category with existing products. Please reassign or remove products first.' 
        });
      }

      await prisma.category.delete({
        where: { id }
      });

      res.json({ message: 'Category deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to delete category' });
    }
  },

  // Delete category by NAME
  deleteCategoryByName: async (req, res) => {
    const { name } = req.params;
    try {
      const category = await prisma.category.findUnique({
        where: { name },
        include: { _count: { select: { products: true } } }
      });
      if (!category) return res.status(404).json({ message: 'Category not found' });
      if (category._count.products > 0) {
        return res.status(400).json({ message: 'Cannot delete category with existing products. Please reassign or remove products first.' });
      }
      await prisma.category.delete({ where: { id: category.id } });
      res.json({ message: 'Category deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to delete category' });
    }
  }
};

module.exports = categoryController;

