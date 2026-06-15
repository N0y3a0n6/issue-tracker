const request = require('supertest');
const app = require('../app');
const prisma = require('../lib/prisma');

async function cleanDb() {
  await prisma.issue.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
}

async function registerAndLogin(userData = {}) {
  const user = {
    name: userData.name || 'Test User',
    email: userData.email || 'test@example.com',
    password: userData.password || 'password123',
  };

  await request(app)
    .post('/auth/register')
    .send(user);

  const res = await request(app)
    .post('/auth/login')
    .send({ email: user.email, password: user.password });

  return { token: res.body.token, user: res.body.user };
}

module.exports = { request, app, prisma, cleanDb, registerAndLogin };
