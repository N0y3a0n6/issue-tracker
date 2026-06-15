const { request, app, cleanDb, registerAndLogin } = require('./helpers');

let token;

beforeEach(async () => {
  await cleanDb();
  const auth = await registerAndLogin();
  token = auth.token;
});

describe('POST /projects', () => {
  test('TC-API-12: creates a project with valid data', async () => {
    const res = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'My Project', description: 'A description' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('My Project');
    expect(res.body.isArchived).toBe(false);
  });

  test('TC-API-13: rejects project with empty name', async () => {
    const res = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('TC-API-14: rejects duplicate project name', async () => {
    await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'My Project' });

    const res = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'My Project' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already exists/i);
  });

  test('TC-API-15: rejects unauthenticated request', async () => {
    const res = await request(app)
      .post('/projects')
      .send({ name: 'My Project' });

    expect(res.status).toBe(401);
  });
});

describe('GET /projects', () => {
  test('TC-API-16: returns list of projects for authenticated user', async () => {
    await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Project A' });

    const res = await request(app)
      .get('/projects')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  test('TC-API-17: excludes archived projects from list', async () => {
    const created = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Project A' });

    await request(app)
      .patch(`/projects/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isArchived: true });

    const res = await request(app)
      .get('/projects')
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.length).toBe(0);
  });
});

describe('PATCH /projects/:id', () => {
  test('TC-API-18: archives a project', async () => {
    const created = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Project A' });

    const res = await request(app)
      .patch(`/projects/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isArchived: true });

    expect(res.status).toBe(200);
    expect(res.body.isArchived).toBe(true);
  });

  test('TC-API-19: returns 404 for non-existent project', async () => {
    const res = await request(app)
      .patch('/projects/99999')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Name' });

    expect(res.status).toBe(404);
  });
});
