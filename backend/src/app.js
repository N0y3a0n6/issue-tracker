const express = require('express');
const cors = require('cors');

const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');
const projectsRouter = require('./routes/projects');
const issuesRouter = require('./routes/issues');
const requireAuth = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/projects', projectsRouter);
app.use('/issues', issuesRouter);

app.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// 404 handler — route not found
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler — catches any unhandled errors from routes
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;

module.exports = app;
