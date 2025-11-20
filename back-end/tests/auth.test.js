const request = require('supertest');
const app = require('../app');

describe('Auth API', () => {
  it('should login successfully', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@demo.com', password: 'admin123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
