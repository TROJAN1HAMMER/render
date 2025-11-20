const { PrismaClient } = require('@prisma/client');
const prisma = require('../prisma/prisma');

const stockController = {
  // Create stock entry
  createStock: async (req, res) => {
    const { productId, status, location } = req.body;

    try {
      const stock = await prisma.stock.create({
        data: {
          productId,
          status,
          location,
        }
      });

      res.status(201).json({ message: 'Stock entry created', stock });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error creating stock entry' });
    }
  },

  // Get all stock entries
  getAllStock: async (req, res) => {
  try {
    // Fetch all stock entries (including possibly broken ones)
    const stocks = await prisma.stock.findMany();

    // Filter out invalid entries by trying to manually resolve product
    const validStocks = [];

    for (const stock of stocks) {
      const product = await prisma.product.findUnique({
        where: { id: stock.productId }
      });

      if (product) {
        validStocks.push({
          ...stock,
          product: {
            name: product.name,
            price: product.price,
            warrantyPeriodInMonths: product.warrantyPeriodInMonths
          }
        });
      }
    }

    res.json(validStocks);
  } catch (err) {
    console.error('Error in getAllStock:', err);
    res.status(500).json({ message: 'Error fetching stock entries' });
  }
},

  // Update stock
  updateStock: async (req, res) => {
    const { id } = req.params;
    const { status, location } = req.body;

    try {
      const updatedStock = await prisma.stock.update({
        where: { id },
        data: { status, location }
      });

      res.json({ message: 'Stock entry updated', stock: updatedStock });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error updating stock entry' });
    }
  },

  // Delete stock by ID
  deleteStock: async (req, res) => {
    try {
      const { id } = req.params;
      // Ensure stock exists
      const existing = await prisma.stock.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ message: 'Stock entry not found' });
      }
      await prisma.stock.delete({ where: { id } });
      res.json({ message: 'Stock entry deleted' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error deleting stock entry' });
    }
  },

  // GET /distributor/stock
getAssignedStock: async (req, res) => {
  try {
    const userId = req.user.id;

    const stocks = await prisma.stock.findMany({
      where: {
        OR: [
          {
            location: {
              contains: "Distributor",
              mode: "insensitive"
            }
          },
          {
            status: {
              in: ["Available", "Moved"] // ✅ must match enum values
            }
          }
        ]
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            warrantyPeriodInMonths: true
          }
        }
      },
      orderBy: { id: "desc" }
    });

    res.json(stocks);
  } catch (err) {
    console.error("Error in getAssignedStock:", err);
    res.status(500).json({ message: "Failed to fetch assigned stock" });
  }
},


  // PUT /distributor/stock/:id
  updateStockStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, location } = req.body;
      const userId = req.user.id;
      
      // Verify stock exists and is assigned to distributor
      const stock = await prisma.stock.findUnique({
        where: { id },
        include: { product: true }
      });
      
      if (!stock) {
        return res.status(404).json({ message: 'Stock not found' });
      }
      
      // Update stock status
      const updatedStock = await prisma.stock.update({
        where: { id },
        data: { 
          status: status || stock.status,
          location: location || stock.location
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true
            }
          }
        }
      });
      
      res.json({ message: 'Stock status updated', stock: updatedStock });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to update stock status' });
    }
  },

  cleanup: async(req, res) => {
try {
    const stocks = await prisma.stock.findMany();
    const productIds = (await prisma.product.findMany()).map(p => p.id);

    let deletedCount = 0;
    for (const stock of stocks) {
      if (!productIds.includes(stock.productId)) {
        await prisma.stock.delete({ where: { id: stock.id } });
        deletedCount++;
      }
    }

    res.json({ message: `Deleted ${deletedCount} orphaned stock entries` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Cleanup failed' });
  }
  },

  // POST /distributor/stock/items - Add new stock item
  addStockItem: async (req, res) => {
    const userId = req.user.id;
    const { name, price, stockQuantity, warrantyPeriodInMonths, categoryId, location } = req.body;

    try {
      if (!name || !price || !stockQuantity || !warrantyPeriodInMonths) {
        return res.status(400).json({
          message: 'Name, price, stock quantity, and warranty period are required'
        });
      }

      if (price <= 0 || stockQuantity <= 0 || warrantyPeriodInMonths <= 0) {
        return res.status(400).json({
          message: 'Price, stock quantity, and warranty period must be positive numbers'
        });
      }

      // Create product first
      const product = await prisma.product.create({
        data: {
          name: name.trim(),
          price: parseFloat(price),
          stockQuantity: parseInt(stockQuantity),
          warrantyPeriodInMonths: parseInt(warrantyPeriodInMonths),
          categoryId: categoryId || null
        }
      });

      // Create stock entry
      const stock = await prisma.stock.create({
        data: {
          productId: product.id,
          status: 'Available',
          location: location || 'Distributor Warehouse'
        }
      });

      const result = {
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          stockQuantity: product.stockQuantity,
          warrantyPeriodInMonths: product.warrantyPeriodInMonths,
          categoryId: product.categoryId
        },
        stock: {
          id: stock.id,
          status: stock.status,
          location: stock.location
        }
      };

      res.status(201).json({
        message: 'Stock item added successfully',
        data: result
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to add stock item' });
    }
  },

  // DELETE /distributor/stock/items/:id - Delete stock item
  deleteStockItem: async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
      // Find the stock item
      const stock = await prisma.stock.findUnique({
        where: { id },
        include: { product: true }
      });

      if (!stock) {
        return res.status(404).json({ message: 'Stock item not found' });
      }

      // Check if stock is available for deletion
      if (stock.status !== 'Available') {
        return res.status(400).json({
          message: 'Cannot delete stock item that is not available'
        });
      }

      // Delete stock and product in transaction
      await prisma.$transaction(async (tx) => {
        // Delete stock first
        await tx.stock.delete({
          where: { id }
        });

        // Delete product
        await tx.product.delete({
          where: { id: stock.productId }
        });
      });

      res.json({ message: 'Stock item deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to delete stock item' });
    }
  },

  // PUT /distributor/stock/items/:id - Update stock item
  updateStockItem: async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, price, stockQuantity, warrantyPeriodInMonths, categoryId, location } = req.body;

    try {
      // Find the stock item
      const stock = await prisma.stock.findUnique({
        where: { id },
        include: { product: true }
      });

      if (!stock) {
        return res.status(404).json({ message: 'Stock item not found' });
      }

      // Update product and stock in transaction
      const [updatedProduct, updatedStock] = await prisma.$transaction(async (tx) => {
        const product = await tx.product.update({
          where: { id: stock.productId },
          data: {
            name: name ? name.trim() : undefined,
            price: price ? parseFloat(price) : undefined,
            stockQuantity: stockQuantity ? parseInt(stockQuantity) : undefined,
            warrantyPeriodInMonths: warrantyPeriodInMonths ? parseInt(warrantyPeriodInMonths) : undefined,
            categoryId: categoryId !== undefined ? categoryId : undefined
          }
        });

        const stockUpdate = await tx.stock.update({
          where: { id },
          data: {
            location: location || undefined
          }
        });

        return [product, stockUpdate];
      });

      const result = {
        product: {
          id: updatedProduct.id,
          name: updatedProduct.name,
          price: updatedProduct.price,
          stockQuantity: updatedProduct.stockQuantity,
          warrantyPeriodInMonths: updatedProduct.warrantyPeriodInMonths,
          categoryId: updatedProduct.categoryId
        },
        stock: {
          id: updatedStock.id,
          status: updatedStock.status,
          location: updatedStock.location
        }
      };

      res.json({
        message: 'Stock item updated successfully',
        data: result
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to update stock item' });
    }
  }
};



module.exports = stockController;

