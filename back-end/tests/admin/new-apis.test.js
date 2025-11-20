const request = require('supertest');
const app = require('../../app');
const { loginAs } = require('../testUtils');

// Note: User ID '6890ae807022ccdc50802f07' is now a Plumber user (formerly ExternalSeller)

describe('New Admin APIs', () => {
  let adminToken;

  beforeAll(async () => {
    adminToken = await loginAs('Admin');
  });

  describe('POST /admin/points/convert', () => {
    it('should convert points to cash successfully', async () => {
      // First, add some points to the user
      await request(app)
        .post('/admin/points/adjust')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: '6890ae807022ccdc50802f07',
          points: 200,
          reason: 'Test points for conversion'
        });

      // Now try to convert points to cash
      const response = await request(app)
        .post('/admin/points/convert')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: '6890ae807022ccdc50802f07',
          points: 100,
          conversionRate: 0.01,
          reason: 'Monthly points conversion'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Points converted to cash successfully');
      expect(response.body.pointsConverted).toBe(100);
      expect(response.body.cashAmount).toBe(1);
      expect(response.body.conversionRate).toBe(0.01);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/admin/points/convert')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: '6890ae807022ccdc50802f07',
          points: 100
          // Missing conversionRate
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Missing required fields');
    });

    it('should return 400 for invalid input values', async () => {
      const response = await request(app)
        .post('/admin/points/convert')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: '6890ae807022ccdc50802f07',
          points: -100,
          conversionRate: 0.01
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Points and conversion rate must be positive');
    });
  });

  describe('POST /admin/invoices', () => {
    it('should create a new invoice successfully', async () => {
      const response = await request(app)
        .post('/admin/invoices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: '6890ae807022ccdc50802f07',
          totalAmount: 150.00,
          items: [
            {
              productName: 'Custom Service A',
              quantity: 2,
              unitPrice: 50.00
            },
            {
              productName: 'Custom Service B',
              quantity: 1,
              unitPrice: 50.00
            }
          ],
          description: 'Monthly service invoice'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Invoice created successfully');
      expect(response.body.invoice.order.status).toBe('Completed');
      expect(response.body.invoice.order.orderItems).toHaveLength(2);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/admin/invoices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: '6890ae807022ccdc50802f07',
          totalAmount: 150.00
          // Missing items
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Missing required fields or invalid items format');
    });

    it('should return 400 for invalid items format', async () => {
      const response = await request(app)
        .post('/admin/invoices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: '6890ae807022ccdc50802f07',
          totalAmount: 150.00,
          items: [
            {
              productName: 'Custom Service A',
              quantity: 2
              // Missing unitPrice
            }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Each item must have productName, quantity, and unitPrice');
    });
  });

  describe('GET /admin/reports/individual', () => {
    it('should generate individual performance report', async () => {
      const response = await request(app)
        .get('/admin/reports/individual?userId=6890ae807022ccdc50802f07&reportType=performance')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.userId).toBe('6890ae807022ccdc50802f07');
      expect(response.body.reportType).toBe('performance');
      expect(response.body.performanceData).toBeDefined();
    });

    it('should generate individual sales report', async () => {
      const response = await request(app)
        .get('/admin/reports/individual?userId=6890ae807022ccdc50802f07&reportType=sales')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.reportType).toBe('sales');
      expect(response.body.salesData).toBeDefined();
    });

    it('should generate individual attendance report', async () => {
      const response = await request(app)
        .get('/admin/reports/individual?userId=6890ae807022ccdc50802f07&reportType=attendance')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.reportType).toBe('attendance');
      expect(response.body.attendanceData).toBeDefined();
    });

    it('should generate individual points report', async () => {
      const response = await request(app)
        .get('/admin/reports/individual?userId=6890ae807022ccdc50802f07&reportType=points')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.reportType).toBe('points');
      expect(response.body.pointsData).toBeDefined();
    });

    it('should return 400 for missing userId', async () => {
      const response = await request(app)
        .get('/admin/reports/individual?reportType=performance')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User ID is required');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/admin/reports/individual?userId=507f1f77bcf86cd799439011&reportType=performance')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  });
});
