const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Load environment variables in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
}

const { pool, initDatabase, checkHealth } = require('./config/database');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

// Run database migrations on startup
async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.log('No DATABASE_URL, skipping migrations');
    return false;
  }

  const client = await pool.connect();
  try {
    // Create migrations table if needed
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Get applied migrations
    const { rows: applied } = await client.query('SELECT name FROM migrations');
    const appliedNames = new Set(applied.map(m => m.name));

    // Get migration files
    const migrationsDir = path.join(__dirname, 'db/migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('No migrations directory found');
      return true;
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    // Run unapplied migrations
    for (const file of files) {
      if (appliedNames.has(file)) continue;

      console.log(`Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`Migration ${file} applied`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Migration ${file} failed:`, err.message);
        throw err;
      }
    }

    console.log('Migrations complete');
    return true;
  } catch (error) {
    console.error('Migration error:', error.message);
    return false;
  } finally {
    client.release();
  }
}

// Seed database with demo data if empty
async function seedIfEmpty() {
  if (!process.env.DATABASE_URL) return;

  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(rows[0].count) > 0) {
      console.log('Database already has data, skipping seed');
      return;
    }

    console.log('Database is empty, seeding with demo data...');

    // Demo users
    const users = [
      { username: 'wordlewizard', displayName: 'Wordle Wizard', avatarType: 'initials', avatarValue: 'WW', avatarBg: '#538d4e' },
      { username: 'puzzlepro', displayName: 'Puzzle Pro', avatarType: 'emoji', avatarValue: '🧩', avatarBg: '#a855f7' },
      { username: 'dailygrinder', displayName: 'Daily Grinder', avatarType: 'initials', avatarValue: 'DG', avatarBg: '#3b82f6' },
      { username: 'speedrunner', displayName: 'Speed Runner', avatarType: 'emoji', avatarValue: '⚡', avatarBg: '#eab308' },
      { username: 'casualgamer', displayName: 'Casual Gamer', avatarType: 'initials', avatarValue: 'CG', avatarBg: '#22c55e' },
      { username: 'nytfanatic', displayName: 'NYT Fanatic', avatarType: 'emoji', avatarValue: '📰', avatarBg: '#f97316' },
      { username: 'streakmaster', displayName: 'Streak Master', avatarType: 'initials', avatarValue: 'SM', avatarBg: '#ef4444' },
      { username: 'gridgenius', displayName: 'Grid Genius', avatarType: 'emoji', avatarValue: '🎯', avatarBg: '#8b5cf6' },
      { username: 'earlybird', displayName: 'Early Bird', avatarType: 'initials', avatarValue: 'EB', avatarBg: '#06b6d4' },
      { username: 'nightowl', displayName: 'Night Owl', avatarType: 'emoji', avatarValue: '🦉', avatarBg: '#1e1e32' },
    ];

    const userIds = [];
    for (const u of users) {
      const { rows } = await client.query(
        `INSERT INTO users (username, display_name, avatar_type, avatar_value, avatar_bg)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [u.username, u.displayName, u.avatarType, u.avatarValue, u.avatarBg]
      );
      userIds.push(rows[0].id);
    }
    console.log(`Created ${userIds.length} demo users`);

    // Create a demo group
    const { rows: groupRows } = await client.query(
      `INSERT INTO groups (name, description, visibility, join_policy, tracked_games, pinned_games, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      ['NYT Puzzle Squad', 'For fans of all NYT games!', 'public', 'open',
       JSON.stringify(['wordle', 'connections', 'mini', 'strands']),
       JSON.stringify(['wordle', 'connections']),
       userIds[0]]
    );
    const groupId = groupRows[0].id;

    // Add members to group
    for (let i = 0; i < Math.min(6, userIds.length); i++) {
      await client.query(
        `INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3)`,
        [groupId, userIds[i], i === 0 ? 'admin' : 'member']
      );
    }
    console.log('Created demo group with members');

    // Generate some game results
    const games = ['wordle', 'connections', 'mini', 'bandle'];
    const today = new Date();
    let resultCount = 0;

    for (const userId of userIds) {
      for (let d = 0; d < 7; d++) {
        const date = new Date(today);
        date.setDate(date.getDate() - d);
        const dateStr = date.toISOString().split('T')[0];
        const puzzleNum = 1000 + (7 - d);

        for (const gameId of games) {
          if (Math.random() > 0.7) continue; // Skip some games randomly

          let scoreValue, scoreDisplay, isFailed = false, isGreat = false;

          if (gameId === 'wordle' || gameId === 'bandle') {
            scoreValue = Math.random() < 0.1 ? 7 : 1 + Math.floor(Math.random() * 6);
            isFailed = scoreValue > 6;
            isGreat = scoreValue <= 3;
            scoreDisplay = `${isFailed ? 'X' : scoreValue}/6`;
          } else if (gameId === 'connections') {
            const mistakes = Math.floor(Math.random() * 5);
            isFailed = mistakes >= 4;
            scoreValue = isFailed ? 0 : 4 - mistakes;
            isGreat = mistakes === 0;
            scoreDisplay = isFailed ? 'Failed' : `${mistakes} mistakes`;
          } else if (gameId === 'mini') {
            scoreValue = 20 + Math.floor(Math.random() * 180);
            isGreat = scoreValue <= 60;
            const mins = Math.floor(scoreValue / 60);
            const secs = scoreValue % 60;
            scoreDisplay = `${mins}:${secs.toString().padStart(2, '0')}`;
          }

          await client.query(
            `INSERT INTO game_results (user_id, game_id, puzzle_number, play_date, raw_text, score_value, score_display, is_failed, is_great)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (user_id, game_id, puzzle_number) DO NOTHING`,
            [userId, gameId, puzzleNum, dateStr, `${gameId} result`, scoreValue, scoreDisplay, isFailed, isGreat]
          );
          resultCount++;
        }
      }
    }
    console.log(`Created ${resultCount} demo results`);
    console.log('Seeding complete');
  } catch (error) {
    console.error('Seeding error:', error.message);
  } finally {
    client.release();
  }
}

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
  // Run migrations first
  const migrationsOk = await runMigrations();
  if (!migrationsOk) {
    console.warn('WARNING: Migrations did not complete successfully');
  }

  // Seed with demo data if database is empty
  await seedIfEmpty();

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
