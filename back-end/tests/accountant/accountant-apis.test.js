const request = require('supertest');
const app = require('../../app');
const prisma = require('../../prisma/prisma');

describe('Accountant APIs', () => {
  let authToken;
  let testUser;
  let testInvoice;

  beforeAll(async () => {
    // Use a unique email with timestamp to avoid conflicts
    const uniqueEmail = `accountant-${Date.now()}@test.com`;
    
    // Register a test user with Accountant role
    const registerResponse = await request(app)
      .post('/auth/register')
      .send({
        name: 'Test Accountant',
        email: uniqueEmail,
        phone: '1234567890',
        password: 'password123',
        role: 'Accountant'
      });

    console.log('Registration response:', registerResponse.status, registerResponse.body);
    
    if (registerResponse.status !== 201) {
      throw new Error(`Registration failed: ${registerResponse.body.message}`);
    }

    testUser = registerResponse.body.user;
    authToken = registerResponse.body.token;
  });

  afterAll(async () => {
    // Clean up test data in correct order (child records first)
    await prisma.financialLog.deleteMany({
      where: { createdBy: testUser.id }
    });
    
    // Delete order items first, then invoices, then orders
    const orders = await prisma.order.findMany({
      where: { userId: testUser.id },
      select: { id: true }
    });
    
    for (const order of orders) {
      await prisma.orderItem.deleteMany({
        where: { orderId: order.id }
      });
    }
    
    await prisma.invoice.deleteMany({
      where: { order: { userId: testUser.id } }
    });
    
    await prisma.order.deleteMany({
      where: { userId: testUser.id }
    });
    
    await prisma.accountant.deleteMany({
      where: { userId: testUser.id }
    });
    
    await prisma.user.deleteMany({
      where: { id: testUser.id }
    });
  });

  describe('Financial Logs APIs', () => {
    test('GET /accountant/financial-logs - should get all financial logs', async () => {
      const response = await request(app)
        .get('/accountant/financial-logs')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('financialLogs');
      expect(response.body).toHaveProperty('pagination');
    });

    test('POST /accountant/financial-logs - should create a new financial log', async () => {
      const financialLogData = {
        type: 'Income',
        amount: 1000.50,
        description: 'Test income entry',
        category: 'Sales',
        reference: 'TEST-REF-001'
      };

      const response = await request(app)
        .post('/accountant/financial-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(financialLogData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('financialLog');
      expect(response.body.financialLog.type).toBe('Income');
      expect(response.body.financialLog.amount).toBe(1000.50);
    });

    test('POST /accountant/financial-logs - should reject invalid data', async () => {
      const invalidData = {
        type: 'InvalidType',
        amount: -100,
        description: ''
      };

      const response = await request(app)
        .post('/accountant/financial-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });

    test('DELETE /accountant/financial-logs/:id - should delete a financial log', async () => {
      // First create a financial log
      const createResponse = await request(app)
        .post('/accountant/financial-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'Expense',
          amount: 500.25,
          description: 'Test expense entry',
          category: 'Office Supplies'
        });

      const financialLogId = createResponse.body.financialLog.id;

      // Then delete it
      const deleteResponse = await request(app)
        .delete(`/accountant/financial-logs/${financialLogId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.message).toBe('Financial log deleted successfully');
    });
  });

  describe('Invoice APIs', () => {
    test('GET /accountant/invoice - should get all invoices', async () => {
      const response = await request(app)
        .get('/accountant/invoice')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('invoices');
      expect(response.body).toHaveProperty('pagination');
    });

    test('POST /accountant/invoice - should create a new invoice manually', async () => {
      const invoiceData = {
        userId: testUser.id,
        totalAmount: 1500.75,
        items: [
          {
            productName: 'Test Product 1',
            quantity: 2,
            unitPrice: 500.25
          },
          {
            productName: 'Test Product 2',
            quantity: 1,
            unitPrice: 500.25
          }
        ],
        description: 'Test manual invoice',
        dueDate: '2024-12-31'
      };

      const response = await request(app)
        .post('/accountant/invoice')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invoiceData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('invoice');
      expect(response.body.invoice.totalAmount).toBe(1500.75);
      expect(response.body.invoice.status).toBe('Draft');

      testInvoice = response.body.invoice;
    });

    test('PATCH /accountant/invoice/:id/send - should mark invoice as sent', async () => {
      const response = await request(app)
        .patch(`/accountant/invoice/${testInvoice.id}/send`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.invoice.status).toBe('Sent');
      expect(response.body.invoice.sentAt).toBeDefined();
    });

    test('PATCH /accountant/invoice/:id/verify-payment - should mark invoice as paid', async () => {
      const response = await request(app)
        .patch(`/accountant/invoice/${testInvoice.id}/verify-payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paymentMethod: 'Bank Transfer',
          paymentReference: 'TXN-123456'
        });

      expect(response.status).toBe(200);
      expect(response.body.invoice.status).toBe('Paid');
      expect(response.body.invoice.paidAt).toBeDefined();
    });

    test('POST /accountant/invoice - should reject invalid invoice data', async () => {
      const invalidData = {
        userId: 'invalid-id',
        totalAmount: -100,
        items: []
      };

      const response = await request(app)
        .post('/accountant/invoice')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });
  });
});
