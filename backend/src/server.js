require('dotenv/config');
const app = require('./app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Server running on http://localhost:${PORT}`);
});

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});
