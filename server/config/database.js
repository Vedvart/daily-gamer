const { Pool } = require('pg');

// Load environment variables in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
}

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Railway requires SSL in production
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on('connect', () => {
  console.log('Database pool connection established');
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

// Helper function to run queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production') {
      console.log('Query executed:', { text: text.substring(0, 100), duration, rows: result.rowCount });
    }
    return result;
  } catch (error) {
    console.error('Query error:', { text: text.substring(0, 100), error: error.message });
    throw error;
  }
};

// Helper function to get a client for transactions
const getClient = async () => {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  const release = client.release.bind(client);

  // Track if client has been released
  let released = false;

  // Override release to prevent double-release
  client.release = () => {
    if (!released) {
      released = true;
      return release();
    }
  };

  return client;
};

// Initialize database connection
const initDatabase = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connected at:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    return false;
  }
};

// Check database health
const checkHealth = async () => {
  try {
    const result = await pool.query('SELECT 1');
    return { connected: true };
  } catch (error) {
    return { connected: false, error: error.message };
  }
};

module.exports = {
  pool,
  query,
  getClient,
  initDatabase,
  checkHealth,
};
