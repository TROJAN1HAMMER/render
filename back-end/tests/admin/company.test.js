const request = require('supertest');
const app = require('../../app');
const prisma = require('../../prisma/prisma');
const jwt = require('jsonwebtoken');

describe('Company Management APIs', () => {
  let adminToken;
  let adminUserId;
  let testCompanyId;

  beforeAll(async () => {
    // Create a test admin user
    const testUser = await prisma.user.create({
      data: {
        name: 'Test Admin',
        email: 'testadmin@example.com',
        phone: '1234567890',
        password: 'hashedpassword',
        role: 'Admin'
      }
    });

    adminUserId = testUser.id;

    // Create admin record
    await prisma.admin.create({
      data: {
        userId: testUser.id
      }
    });

    // Generate JWT token
    adminToken = jwt.sign(
      { userId: testUser.id, role: 'Admin' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.admin.deleteMany({
      where: { userId: adminUserId }
    });
    await prisma.user.deleteMany({
      where: { id: adminUserId }
    });
    await prisma.company.deleteMany({
      where: { name: { contains: 'Test Company' } }
    });
  });

  describe('POST /admin/companies', () => {
    it('should create a new company', async () => {
      const companyData = {
        name: 'Test Company 1',
        description: 'A test company for unit testing',
        logoUrl: 'https://example.com/logo.png'
      };

      const response = await request(app)
        .post('/admin/companies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(companyData)
        .expect(201);

      expect(response.body.message).toBe('Company created successfully');
      expect(response.body.company.name).toBe(companyData.name);
      expect(response.body.company.description).toBe(companyData.description);
      expect(response.body.company.logoUrl).toBe(companyData.logoUrl);
      
      testCompanyId = response.body.company.id;
    });

    it('should return 400 for duplicate company name', async () => {
      const companyData = {
        name: 'Test Company 1',
        description: 'Another test company'
      };

      await request(app)
        .post('/admin/companies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(companyData)
        .expect(400);
    });

    it('should return 400 for missing company name', async () => {
      const companyData = {
        description: 'Company without name'
      };

      await request(app)
        .post('/admin/companies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(companyData)
        .expect(400);
    });
  });

  describe('GET /admin/companies', () => {
    it('should get all companies', async () => {
      const response = await request(app)
        .get('/admin/companies')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /admin/companies/:id', () => {
    it('should get company by ID', async () => {
      const response = await request(app)
        .get(`/admin/companies/${testCompanyId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(testCompanyId);
      expect(response.body.name).toBe('Test Company 1');
    });

    it('should return 404 for non-existent company', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app)
        .get(`/admin/companies/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('PUT /admin/companies/:id', () => {
    it('should update company', async () => {
      const updateData = {
        name: 'Updated Test Company',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/admin/companies/${testCompanyId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Company updated successfully');
      expect(response.body.company.name).toBe(updateData.name);
      expect(response.body.company.description).toBe(updateData.description);
    });
  });

  describe('POST /admin/companies/:id/switch', () => {
    it('should switch admin to company', async () => {
      const response = await request(app)
        .post(`/admin/companies/${testCompanyId}/switch`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Company switched successfully');
      expect(response.body.admin.company.id).toBe(testCompanyId);
      expect(response.body.admin.company.name).toBe('Updated Test Company');
    });
  });

  describe('GET /admin/companies/current', () => {
    it('should get current admin company', async () => {
      const response = await request(app)
        .get('/admin/companies/current')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.company.id).toBe(testCompanyId);
      expect(response.body.company.name).toBe('Updated Test Company');
    });
  });

  describe('DELETE /admin/companies/:id', () => {
    it('should soft delete company', async () => {
      // First, remove admin from company to allow deletion
      await prisma.admin.update({
        where: { userId: adminUserId },
        data: { companyId: null }
      });

      const response = await request(app)
        .delete(`/admin/companies/${testCompanyId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Company deleted successfully');
    });
  });
});
