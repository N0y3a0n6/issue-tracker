const { request, app, cleanDb, registerAndLogin } = require('./helpers');

let token;
let projectId;

beforeEach(async () => {
  await cleanDb();
  const auth = await registerAndLogin();
  token = auth.token;

  const project = await request(app)
    .post('/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Test Project' });

  projectId = project.body.id;
});

describe('POST /issues', () => {
  test('TC-API-20: creates an issue with valid data', async () => {
    const res = await request(app)
      .post('/issues')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Fix bug', projectId });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Fix bug');
    expect(res.body.status).toBe('TODO');
    expect(res.body.priority).toBe('MEDIUM');
  });

  test('TC-API-21: rejects issue with missing title', async () => {
    const res = await request(app)
      .post('/issues')
      .set('Authorization', `Bearer ${token}`)
      .send({ projectId });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title/i);
  });

  test('TC-API-22: rejects invalid priority value', async () => {
    const res = await request(app)
      .post('/issues')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Fix bug', projectId, priority: 'URGENT' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/priority/i);
  });

  test('TC-API-23: rejects invalid status value', async () => {
    const res = await request(app)
      .post('/issues')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Fix bug', projectId, status: 'PENDING' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/status/i);
  });
});

describe('GET /issues', () => {
  beforeEach(async () => {
    await request(app)
      .post('/issues')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Bug one', projectId, status: 'TODO', priority: 'HIGH' });

    await request(app)
      .post('/issues')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Bug two', projectId, status: 'DONE', priority: 'LOW' });
  });

  test('TC-API-24: returns all issues', async () => {
    const res = await request(app)
      .get('/issues')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  test('TC-API-25: filters issues by status', async () => {
    const res = await request(app)
      .get('/issues?status=TODO')
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.length).toBe(1);
    expect(res.body[0].status).toBe('TODO');
  });

  test('TC-API-26: filters issues by priority', async () => {
    const res = await request(app)
      .get('/issues?priority=HIGH')
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.length).toBe(1);
    expect(res.body[0].priority).toBe('HIGH');
  });

  test('TC-API-27: searches issues by title', async () => {
    const res = await request(app)
      .get('/issues?title=one')
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe('Bug one');
  });
});

describe('PATCH /issues/:id', () => {
  test('TC-API-28: updates issue status', async () => {
    const createRes = await request(app)
      .post('/issues')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Fix bug', projectId });

    expect(createRes.status).toBe(201);
    const issueId = createRes.body.id;

    const res = await request(app)
      .patch(`/issues/${issueId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('IN_PROGRESS');
  });

  test('TC-API-29: returns 404 for non-existent issue', async () => {
    const res = await request(app)
      .patch('/issues/99999')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'DONE' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /issues/:id', () => {
  test('TC-API-30: deletes an issue', async () => {
    const createRes = await request(app)
      .post('/issues')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Fix bug', projectId });

    expect(createRes.status).toBe(201);
    const issueId = createRes.body.id;

    const res = await request(app)
      .delete(`/issues/${issueId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  test('TC-API-31: returns 404 when deleting non-existent issue', async () => {
    const res = await request(app)
      .delete('/issues/99999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
