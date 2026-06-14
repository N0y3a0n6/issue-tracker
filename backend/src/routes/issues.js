const express = require('express');
const prisma = require('../lib/prisma');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

const VALID_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

// GET /issues — list issues with optional search and filters
router.get('/', async (req, res) => {
  const { title, status, priority, assigneeId, projectId } = req.query;

  const where = {};

  if (projectId) where.projectId = parseInt(projectId);
  if (status) {
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }
    where.status = status;
  }
  if (priority) {
    if (!VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}` });
    }
    where.priority = priority;
  }
  if (assigneeId) where.assigneeId = parseInt(assigneeId);
  if (title) {
    where.title = { contains: title, mode: 'insensitive' };
  }

  const issues = await prisma.issue.findMany({
    where,
    include: { assignee: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });

  res.json(issues);
});

// POST /issues — create a new issue
router.post('/', async (req, res) => {
  const { title, description, priority, status, assigneeId, projectId } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Issue title is required' });
  }

  if (!projectId) {
    return res.status(400).json({ error: 'projectId is required' });
  }

  const project = await prisma.project.findUnique({ where: { id: parseInt(projectId) } });
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  if (priority && !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}` });
  }

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  const issue = await prisma.issue.create({
    data: {
      title: title.trim(),
      description: description || null,
      priority: priority || 'MEDIUM',
      status: status || 'TODO',
      projectId: parseInt(projectId),
      assigneeId: assigneeId ? parseInt(assigneeId) : null,
    },
    include: { assignee: { select: { id: true, name: true, email: true } } },
  });

  res.status(201).json(issue);
});

// PATCH /issues/:id — edit an issue
router.patch('/:id', async (req, res) => {
  const { title, description, priority, status, assigneeId } = req.body;

  const issue = await prisma.issue.findUnique({
    where: { id: parseInt(req.params.id) },
  });

  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  if (title !== undefined && title.trim() === '') {
    return res.status(400).json({ error: 'Issue title cannot be empty' });
  }

  if (priority && !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}` });
  }

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  const updated = await prisma.issue.update({
    where: { id: parseInt(req.params.id) },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description }),
      ...(priority !== undefined && { priority }),
      ...(status !== undefined && { status }),
      ...(assigneeId !== undefined && { assigneeId: assigneeId ? parseInt(assigneeId) : null }),
    },
    include: { assignee: { select: { id: true, name: true, email: true } } },
  });

  res.json(updated);
});

// DELETE /issues/:id — delete an issue
router.delete('/:id', async (req, res) => {
  const issue = await prisma.issue.findUnique({
    where: { id: parseInt(req.params.id) },
  });

  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  await prisma.issue.delete({ where: { id: parseInt(req.params.id) } });

  res.json({ message: 'Issue deleted successfully' });
});

module.exports = router;
