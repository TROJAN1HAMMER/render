const { PrismaClient } = require('@prisma/client');
const prisma = require('../prisma/prisma');
const multer = require('multer');
const csvParse = require('csv-parse');
const { Parser } = require('json2csv');
const fs = require('fs');

// Multer setup for file upload
const upload = multer({ dest: 'uploads/' });

const productController = {
  // CREATE
  createProduct: async (req, res) => {
    const { name, price, stockQuantity, warrantyPeriodInMonths } = req.body;

    try {
      const product = await prisma.product.create({
        data: {
          name,
          price,
          stockQuantity,
          warrantyPeriodInMonths
        }
      });

      res.status(201).json({ message: 'Product created', product });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error creating product' });
    }
  },

  // READ ALL
  getAllProducts: async (req, res) => {
    try {
      const products = await prisma.product.findMany();
      res.json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching products' });
    }
  },

  // READ ONE
  getProductById: async (req, res) => {
    const { id } = req.params;

    try {
      const product = await prisma.product.findUnique({ where: { id } });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching product' });
    }
  },

  // READ ONE by NAME
  getProductByName: async (req, res) => {
    const { name } = req.params;
    try {
      const product = await prisma.product.findFirst({ where: { name } });
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching product' });
    }
  },

  // UPDATE
  updateProduct: async (req, res) => {
    const { id } = req.params;
    const { name, price, stockQuantity, warrantyPeriodInMonths } = req.body;

    try {
      const updated = await prisma.product.update({
        where: { id },
        data: { name, price, stockQuantity, warrantyPeriodInMonths }
      });

      res.json({ message: 'Product updated', product: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error updating product' });
    }
  },

  // UPDATE by NAME
  updateProductByName: async (req, res) => {
    const { name } = req.params;
    const { price, stockQuantity, warrantyPeriodInMonths, name: newName } = req.body;
    try {
      const product = await prisma.product.findFirst({ where: { name } });
      if (!product) return res.status(404).json({ message: 'Product not found' });
      const updated = await prisma.product.update({
        where: { id: product.id },
        data: {
          name: newName !== undefined ? newName : undefined,
          price,
          stockQuantity,
          warrantyPeriodInMonths
        }
      });
      res.json({ message: 'Product updated', product: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error updating product' });
    }
  },

  // DELETE
  deleteProduct: async (req, res) => {
    try {
      const productId = req.params.id;
      // Delete related warranty cards first
      await prisma.warrantyCard.deleteMany({ where: { productId } });
      // Delete related order items next
      await prisma.orderItem.deleteMany({ where: { productId } });
      // Now delete the product
      const result = await prisma.product.delete({ where: { id: productId } });
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  },

  // DELETE by NAME
  deleteProductByName: async (req, res) => {
    try {
      const { name } = req.params;
      const product = await prisma.product.findFirst({ where: { name } });
      if (!product) return res.status(404).json({ message: 'Product not found' });
      const productId = product.id;
      await prisma.warrantyCard.deleteMany({ where: { productId } });
      await prisma.orderItem.deleteMany({ where: { productId } });
      await prisma.product.delete({ where: { id: productId } });
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  },

  // POST /admin/products/import
  importProducts: [upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const filePath = req.file.path;
    const products = [];
    try {
      const parser = fs.createReadStream(filePath).pipe(csvParse({ columns: true, trim: true }));
      for await (const record of parser) {
        // record: { name, price, stockQuantity, warrantyPeriodInMonths }
        if (!record.name || !record.price) continue;
        // Upsert product by name
        await prisma.product.upsert({
          where: { name: record.name },
          update: {
            price: Number(record.price),
            stockQuantity: Number(record.stockQuantity || 0),
            warrantyPeriodInMonths: Number(record.warrantyPeriodInMonths || 0)
          },
          create: {
            name: record.name,
            price: Number(record.price),
            stockQuantity: Number(record.stockQuantity || 0),
            warrantyPeriodInMonths: Number(record.warrantyPeriodInMonths || 0)
          }
        });
        products.push(record.name);
      }
      fs.unlinkSync(filePath);
      res.json({ message: 'Products imported', products });
    } catch (err) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      console.error(err);
      res.status(500).json({ message: 'Failed to import products' });
    }
  }],

  // GET /admin/products/export
  exportProducts: async (req, res) => {
    try {
      const products = await prisma.product.findMany();
      const fields = ['id', 'name', 'price', 'stockQuantity', 'warrantyPeriodInMonths'];
      const parser = new Parser({ fields });
      const csv = parser.parse(products);
      res.header('Content-Type', 'text/csv');
      res.attachment('products.csv');
      res.send(csv);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to export products' });
    }
  }
};

module.exports = productController;
