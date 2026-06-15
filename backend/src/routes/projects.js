const express = require('express');
const prisma = require('../lib/prisma');
const requireAuth = require('../middleware/auth');
const { log } = require('../lib/logger');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const projects = await prisma.project.findMany({
    where: { ownerId: req.user.id, isArchived: false },
    orderBy: { createdAt: 'desc' },
  });
  res.json(projects);
});

router.post('/', async (req, res) => {
  const { name, description } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Project name is required' });
  }

  const existing = await prisma.project.findUnique({ where: { name } });
  if (existing) {
    return res.status(400).json({ error: 'Project name already exists' });
  }

  const project = await prisma.project.create({
    data: { name: name.trim(), description: description || null, ownerId: req.user.id },
  });

  log('Project created', { projectId: project.id, name: project.name, userId: req.user.id });

  res.status(201).json(project);
});

router.get('/:id', async (req, res) => {
  const project = await prisma.project.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { issues: true },
  });

  if (!project) return res.status(404).json({ error: 'Project not found' });
  if (project.ownerId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

  res.json(project);
});

router.patch('/:id', async (req, res) => {
  const { name, isArchived } = req.body;

  const project = await prisma.project.findUnique({
    where: { id: parseInt(req.params.id) },
  });

  if (!project) return res.status(404).json({ error: 'Project not found' });
  if (project.ownerId !== req.user.id) return res.status(403).json({ error: 'Access denied' });
  if (name !== undefined && name.trim() === '') {
    return res.status(400).json({ error: 'Project name cannot be empty' });
  }

  const updated = await prisma.project.update({
    where: { id: parseInt(req.params.id) },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(isArchived !== undefined && { isArchived }),
    },
  });

  if (isArchived === true) {
    log('Project archived', { projectId: updated.id, name: updated.name, userId: req.user.id });
  } else if (name !== undefined) {
    log('Project updated', { projectId: updated.id, name: updated.name, userId: req.user.id });
  }

  res.json(updated);
});

module.exports = router;