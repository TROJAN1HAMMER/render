const request = require('supertest');
const app = require('../app'); // your express app

const loginAs = async (role = 'Admin') => {
  const creds = {
    Admin: { email: 'admin@demo.com', password: 'admin123' },
    Worker: { email: 'worker@demo.com', password: 'worker123' },
    Distributor: { email: 'distributor@demo.com', password: 'distributor123' },
    FieldExecutive: { email: 'field@demo.com', password: 'field123' },
    Plumber: { email: 'plumber@demo.com', password: 'plumber123' },
  };

  const res = await request(app)
    .post('/auth/login')
    .send(creds[role]);

  return res.body.token;
};

module.exports = { loginAs };
