const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
}

const { initDatabase, checkHealth } = require('./config/database');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
}

// Health check endpoint (with database status)
app.get('/api/health', async (req, res) => {
  const dbHealth = await checkHealth();
  res.json({
    status: 'ok',
    message: 'Daily Gamer API is running',
    database: dbHealth,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api', routes);

// Serve React app for all other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
async function start() {
  // Initialize database connection
  const dbConnected = await initDatabase();
  if (!dbConnected) {
    console.warn('WARNING: Database not connected. API will run with limited functionality.');
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Database: ${dbConnected ? 'connected' : 'not connected'}`);
  });
}

start();
