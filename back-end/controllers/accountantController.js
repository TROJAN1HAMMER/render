

const prisma = require('../prisma/prisma');

const accountantController = {
  getFinancialSummary: async (req, res) => {
    try {
      
      const incomeResult = await prisma.financialLog.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          type: 'Income',
        },
      });

      const expenseResult = await prisma.financialLog.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          type: 'Expense',
        },
      });

      const pendingInvoicesResult = await prisma.invoice.aggregate({
        _sum: {
          totalAmount: true,
        },
        where: {
          status: { in: ['Sent', 'Overdue', 'Draft'] },
        },
      });

     
      const totalIncome = incomeResult._sum.amount ?? 0;
      const totalExpenses = expenseResult._sum.amount ?? 0;
      const pendingInvoicesAmount = pendingInvoicesResult._sum.totalAmount ?? 0;
      const netProfit = totalIncome - totalExpenses;

      res.status(200).json({
        totalIncome,
        totalExpenses,
        netProfit,
        pendingInvoicesAmount,
      });
    } catch (error) {
      console.error('getFinancialSummary error:', error);
      res.status(500).json({ message: 'Failed to fetch financial summary', error: error.message });
    }
  },

  getAllFinancialLogs: async (req, res) => {
    try {
      const financialLogs = await prisma.financialLog.findMany({
        orderBy: { createdAt: 'desc' },
        include: { createdByUser: { select: { name: true } } },
      });

      
      const formattedLogs = financialLogs.map(log => ({
        ...log,
        amount: parseFloat(log.amount),
      }));

      res.json({ financialLogs: formattedLogs });
    } catch (err) {
      console.error('getAllFinancialLogs error:', err);
      res.status(500).json({ message: 'Failed to fetch financial logs', error: err.message });
    }
  },

  createFinancialLog: async (req, res) => {
    try {
      
      const { type, amount, description, category, reference } = req.body;
      const createdBy = req.user.id;

      const financialLog = await prisma.financialLog.create({
        data: {
          type,
          amount: parseFloat(amount),
          description,
          category,
          reference,
          createdBy,
        },
      });

      res.status(201).json(financialLog);
    } catch (err) {
      console.error('createFinancialLog error:', err);
      res.status(500).json({ message: 'Failed to create financial log', error: err.message });
    }
  },

 

  deleteFinancialLog: async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.financialLog.delete({ where: { id } });
      res.json({ message: 'Financial log deleted successfully' });
    } catch (err) {
      console.error('deleteFinancialLog error:', err);
      res.status(500).json({ message: 'Failed to delete financial log', error: err.message });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
      res.json(users);
    } catch (err) {
      console.error('getAllUsers error:', err);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  },
   

  getAllInvoices: async (req, res) => {
    try {
      const invoices = await prisma.invoice.findMany({
        orderBy: { invoiceDate: 'desc' },
        include: {
          order: {
            include: {
              user: { select: { id: true, name: true, email: true } }
            }
          }
        }
      });
      res.json(invoices);
    } catch (err) {
      console.error('getAllInvoices error:', err);
      res.status(500).json({ message: 'Failed to fetch invoices', error: err.message });
    }
  },

  createInvoice: async (req, res) => {
    try {
      const { userId, totalAmount, items, description, dueDate } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required to create an invoice.' });
      }

      const order = await prisma.order.create({
        data: {
          status: 'Completed',
          orderDate: new Date(),
          user: {
            connect: {
              id: userId 
            }
          },
        }
      });

      const invoice = await prisma.invoice.create({
        data: {
          orderId: order.id,
          invoiceDate: new Date(),
          totalAmount: parseFloat(totalAmount),
          pdfUrl: `https://invoices.example.com/manual_invoice_${order.id}.pdf`,
          status: 'Draft',
          dueDate: dueDate ? new Date(dueDate) : null
        },
      });

      res.status(201).json({ message: 'Invoice created successfully', invoice });
    } catch (err) {
      console.error('createInvoice error:', err);
      res.status(500).json({ message: 'Failed to create invoice', error: err.message });
    }
  },

  sendInvoice: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedInvoice = await prisma.invoice.update({
        where: { id },
        data: { status: 'Sent', sentAt: new Date() },
      });
      res.json({ message: 'Invoice sent successfully', invoice: updatedInvoice });
    } catch (err)
 {
      console.error('sendInvoice error:', err);
      res.status(500).json({ message: 'Failed to send invoice', error: err.message });
    }
  },


  

  verifyPayment: async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await prisma.invoice.findUnique({ where: { id } });
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }
      
      const updatedInvoice = await prisma.invoice.update({
        where: { id },
        data: { status: 'Paid', paidAt: new Date() },
      });

      await prisma.financialLog.create({
        data: {
          type: 'Income',
          amount: invoice.totalAmount,
          description: `Payment for invoice ${invoice.id}`,
          category: 'Invoice Payment',
          reference: invoice.id,
          createdBy: req.user.id
        }
      });
      res.json({ message: 'Payment verified', invoice: updatedInvoice });
    } catch (err) {
      console.error('verifyPayment error:', err);
      res.status(500).json({ message: 'Failed to verify payment', error: err.message });
    }
  }
};

module.exports = accountantController;