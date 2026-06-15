const { request, app, cleanDb } = require('./helpers');

beforeEach(async () => {
  await cleanDb();
});

describe('POST /auth/register', () => {
  test('TC-API-01: registers a new user with valid data', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Alice', email: 'alice@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe('alice@example.com');
    expect(res.body.passwordHash).toBeUndefined();
  });

  test('TC-API-02: rejects registration with missing fields', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'alice@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('TC-API-03: rejects invalid email format', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Alice', email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  test('TC-API-04: rejects password shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Alice', email: 'alice@example.com', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/password/i);
  });

  test('TC-API-05: rejects duplicate email', async () => {
    await request(app)
      .post('/auth/register')
      .send({ name: 'Alice', email: 'alice@example.com', password: 'password123' });

    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Alice2', email: 'alice@example.com', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already/i);
  });
});

describe('POST /auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/auth/register')
      .send({ name: 'Alice', email: 'alice@example.com', password: 'password123' });
  });

  test('TC-API-06: logs in with correct credentials and returns token', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'alice@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('alice@example.com');
  });

  test('TC-API-07: rejects wrong password with generic error', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'alice@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid/i);
  });

  test('TC-API-08: rejects non-existent email', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid/i);
  });

  test('TC-API-09: rejects request with missing fields', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'alice@example.com' });

    expect(res.status).toBe(400);
  });
});

describe('Protected routes', () => {
  test('TC-API-10: rejects request with no token', async () => {
    const res = await request(app).get('/projects');
    expect(res.status).toBe(401);
  });

  test('TC-API-11: rejects request with invalid token', async () => {
    const res = await request(app)
      .get('/projects')
      .set('Authorization', 'Bearer notavalidtoken');
    expect(res.status).toBe(401);
  });
});
