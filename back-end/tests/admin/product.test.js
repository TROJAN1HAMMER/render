const request = require('supertest');
const app = require('../../app');
const { loginAs } = require('../testUtils');

describe('Admin Product APIs', () => {
  let token;

  beforeAll(async () => {
    token = await loginAs('Admin');
  });

  it('should get all products', async () => {
    const res = await request(app)
      .get('/admin/products')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
