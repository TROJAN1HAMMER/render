const { PrismaClient } = require('@prisma/client');
const prisma = require('../prisma/prisma');

const invoiceController = {
  generateInvoice: async (req, res) => {
    const { orderId } = req.params;

    try {
      // Check if invoice already exists
      const existing = await prisma.invoice.findUnique({
        where: { orderId }
      });

      if (existing) {
        return res.status(400).json({ message: 'Invoice already generated for this order' });
      }

      // Fetch the order with items
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          orderItems: true
        }
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Calculate total amount
      const totalAmount = order.orderItems.reduce((sum, item) => {
        return sum + item.unitPrice * item.quantity;
      }, 0);

      // Simulate PDF URL generation
      const pdfUrl = `https://invoices.example.com/invoice_${order.id}.pdf`;

      // Create the invoice
      const invoice = await prisma.invoice.create({
        data: {
          orderId,
          invoiceDate: new Date(),
          totalAmount,
          pdfUrl
        }
      });

      res.status(201).json({ message: 'Invoice generated', invoice });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Invoice generation failed', error: err.message });
    }
  },
  getInvoice: async (req, res) => {
  const { orderId } = req.params;

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { orderId },
      include: {
        order: {
          include: {
            orderItems: {
              include: {
                product: {
                  select: {
                    name: true,
                    price: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch invoice', error: err.message });
  }
},
  // GET /admin/invoices
  getAllInvoices: async (req, res) => {
    try {
      const { orderId, userId, startDate, endDate } = req.query;
      const where = {};
      if (orderId) where.orderId = orderId;
      if (startDate || endDate) {
        where.invoiceDate = {};
        if (startDate) where.invoiceDate.gte = new Date(startDate);
        if (endDate) where.invoiceDate.lte = new Date(endDate);
      }
      const invoices = await prisma.invoice.findMany({
        where,
        include: {
          order: {
            include: {
              user: { select: { id: true, name: true, email: true, role: true } },
              orderItems: {
                include: { product: { select: { name: true, price: true } } }
              }
            }
          }
        },
        orderBy: { invoiceDate: 'desc' }
      });
      // Optionally filter by userId
      const filtered = userId ? invoices.filter(inv => inv.order.user.id === userId) : invoices;
      res.json(filtered);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch invoices' });
    }
  },

  // GET /admin/invoices/:id
  getInvoiceById: async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
          order: {
            include: {
              user: { select: { id: true, name: true, email: true, role: true } },
              orderItems: {
                include: { product: { select: { name: true, price: true } } }
              }
            }
          }
        }
      });
      if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
      res.json(invoice);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch invoice' });
    }
  },

  // POST /admin/invoices
  createInvoice: async (req, res) => {
    try {
      const { userId, totalAmount, items, description, dueDate } = req.body;

      if (!userId || !totalAmount || !items || !Array.isArray(items)) {
        return res.status(400).json({ message: 'Missing required fields or invalid items format' });
      }

      // Validate items array
      if (items.length === 0) {
        return res.status(400).json({ message: 'Items array cannot be empty' });
      }

      // Validate each item
      for (const item of items) {
        if (!item.productName || !item.quantity || !item.unitPrice) {
          return res.status(400).json({ 
            message: 'Each item must have productName, quantity, and unitPrice' 
          });
        }
        if (item.quantity <= 0 || item.unitPrice <= 0) {
          return res.status(400).json({ 
            message: 'Quantity and unitPrice must be positive' 
          });
        }
      }

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Calculate total from items to validate
      const calculatedTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      
      if (Math.abs(calculatedTotal - totalAmount) > 0.01) { // Allow small floating point differences
        return res.status(400).json({ 
          message: 'Total amount does not match calculated total from items',
          calculatedTotal: calculatedTotal,
          providedTotal: totalAmount
        });
      }

      // For custom invoices, we'll create a simple order
      // Since we can't have null productId, we'll create a custom product for each item
      const order = await prisma.order.create({
        data: {
          userId,
          status: 'Completed', // Since this is a posted invoice
          orderDate: new Date()
        }
      });

      // Create order items with custom products
      const orderItems = [];
      for (const item of items) {
        // Create a custom product for this invoice item
        const customProduct = await prisma.product.create({
          data: {
            name: item.productName,
            price: item.unitPrice,
            stockQuantity: 0,
            warrantyPeriodInMonths: 0
          }
        });

        const orderItem = await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: customProduct.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }
        });

        orderItems.push(orderItem);
      }

      // Create the invoice
      const invoice = await prisma.invoice.create({
        data: {
          orderId: order.id,
          invoiceDate: new Date(),
          totalAmount,
          pdfUrl: `https://invoices.example.com/manual_invoice_${order.id}.pdf`
        }
      });

      res.status(201).json({ 
        message: 'Invoice created successfully',
        invoice: {
          ...invoice,
          order: {
            id: order.id,
            userId: order.userId,
            status: order.status,
            orderDate: order.orderDate,
            orderItems: orderItems
          },
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      });
    } catch (err) {
      console.error('createInvoice error:', err);
      res.status(500).json({ message: 'Failed to create invoice' });
    }
  }
};

module.exports = invoiceController;
