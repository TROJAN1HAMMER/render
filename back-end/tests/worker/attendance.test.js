const request = require('supertest');
const app = require('../../app');
const { loginAs } = require('../testUtils');

describe('Worker Attendance API', () => {
  let token;

  beforeAll(async () => {
    token = await loginAs('Worker');
  });

  it('should mark attendance', async () => {
    const res = await request(app)
      .post('/worker/attendance')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect([200, 201]).toContain(res.statusCode);
  });
});
