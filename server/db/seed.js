// Database Seeding Script
// Populates the database with demo users, groups, and sample results

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

// Demo users data
const dummyUsers = [
  { id: 'user_001', username: 'wordlewizard', displayName: 'Wordle Wizard', avatarType: 'initials', avatarValue: 'WW', avatarBg: '#538d4e' },
  { id: 'user_002', username: 'puzzlepro', displayName: 'Puzzle Pro', avatarType: 'emoji', avatarValue: '🧩', avatarBg: '#a855f7' },
  { id: 'user_003', username: 'dailygrinder', displayName: 'Daily Grinder', avatarType: 'initials', avatarValue: 'DG', avatarBg: '#3b82f6' },
  { id: 'user_004', username: 'speedrunner', displayName: 'Speed Runner', avatarType: 'emoji', avatarValue: '⚡', avatarBg: '#eab308' },
  { id: 'user_005', username: 'casualgamer', displayName: 'Casual Gamer', avatarType: 'initials', avatarValue: 'CG', avatarBg: '#22c55e' },
  { id: 'user_006', username: 'nytfanatic', displayName: 'NYT Fanatic', avatarType: 'emoji', avatarValue: '📰', avatarBg: '#f97316' },
  { id: 'user_007', username: 'streakmaster', displayName: 'Streak Master', avatarType: 'initials', avatarValue: 'SM', avatarBg: '#ef4444' },
  { id: 'user_008', username: 'gridgenius', displayName: 'Grid Genius', avatarType: 'emoji', avatarValue: '🎯', avatarBg: '#8b5cf6' },
  { id: 'user_009', username: 'earlybird', displayName: 'Early Bird', avatarType: 'initials', avatarValue: 'EB', avatarBg: '#06b6d4' },
  { id: 'user_010', username: 'nightowl', displayName: 'Night Owl', avatarType: 'emoji', avatarValue: '🦉', avatarBg: '#1e1e32' },
  { id: 'user_011', username: 'triviaking', displayName: 'Trivia King', avatarType: 'initials', avatarValue: 'TK', avatarBg: '#fbbf24' },
  { id: 'user_012', username: 'geoguesser', displayName: 'Geo Guesser', avatarType: 'emoji', avatarValue: '🌍', avatarBg: '#10b981' },
  { id: 'user_013', username: 'wordnerd', displayName: 'Word Nerd', avatarType: 'initials', avatarValue: 'WN', avatarBg: '#ec4899' },
  { id: 'user_014', username: 'puzzleaddict', displayName: 'Puzzle Addict', avatarType: 'emoji', avatarValue: '🎲', avatarBg: '#6366f1' },
  { id: 'user_015', username: 'minichamp', displayName: 'Mini Champ', avatarType: 'initials', avatarValue: 'MC', avatarBg: '#14b8a6' },
  { id: 'user_016', username: 'connectioncrew', displayName: 'Connection Crew', avatarType: 'emoji', avatarValue: '🔗', avatarBg: '#a855f7' },
  { id: 'user_017', username: 'bandlover', displayName: 'Band Lover', avatarType: 'initials', avatarValue: 'BL', avatarBg: '#f472b6' },
  { id: 'user_018', username: 'flagfinder', displayName: 'Flag Finder', avatarType: 'emoji', avatarValue: '🏁', avatarBg: '#dc2626' },
  { id: 'user_019', username: 'traveler', displayName: 'World Traveler', avatarType: 'initials', avatarValue: 'WT', avatarBg: '#84cc16' },
  { id: 'user_020', username: 'allrounder', displayName: 'All Rounder', avatarType: 'emoji', avatarValue: '🏆', avatarBg: '#0ea5e9' },
];

// Demo groups data
const dummyGroups = [
  { name: 'NYT Puzzle Squad', description: 'For fans of all NYT games - Wordle, Connections, Mini, and Strands!', visibility: 'public', joinPolicy: 'open', createdBy: 0, trackedGames: ['wordle', 'connections', 'mini', 'strands'], pinnedGames: ['wordle', 'connections'] },
  { name: 'Geography Gurus', description: 'Test your world knowledge with TimeGuessr, Travle, and Flagle.', visibility: 'public', joinPolicy: 'open', createdBy: 11, trackedGames: ['timeguessr', 'travle', 'flagle'], pinnedGames: ['timeguessr'] },
  { name: 'Wordle Warriors', description: 'Dedicated to the classic 5-letter word game.', visibility: 'public', joinPolicy: 'password', password: 'wordle123', createdBy: 6, trackedGames: ['wordle'], pinnedGames: ['wordle'] },
  { name: 'Music Lovers', description: 'Bandle enthusiasts unite! Guess the song from the instruments.', visibility: 'public', joinPolicy: 'open', createdBy: 16, trackedGames: ['bandle'], pinnedGames: ['bandle'] },
  { name: 'Trivia Time', description: 'Daily Dozen and other trivia games.', visibility: 'public', joinPolicy: 'open', createdBy: 10, trackedGames: ['dailydozen', 'thrice'], pinnedGames: ['dailydozen'] },
  { name: 'All Games Challenge', description: 'Play every daily game! For the completionists among us.', visibility: 'public', joinPolicy: 'open', createdBy: 19, trackedGames: ['wordle', 'connections', 'mini', 'strands', 'bandle', 'catfishing', 'timeguessr', 'travle', 'flagle'], pinnedGames: ['wordle', 'connections', 'mini', 'strands'] },
];

// Group memberships (groupIndex -> [userIndices])
const groupMemberships = {
  0: [{ user: 0, role: 'admin' }, { user: 1, role: 'member' }, { user: 2, role: 'member' }, { user: 5, role: 'moderator' }, { user: 6, role: 'member' }, { user: 12, role: 'member' }, { user: 15, role: 'member' }, { user: 19, role: 'member' }],
  1: [{ user: 11, role: 'admin' }, { user: 18, role: 'moderator' }, { user: 17, role: 'member' }, { user: 2, role: 'member' }, { user: 13, role: 'member' }, { user: 19, role: 'member' }],
  2: [{ user: 6, role: 'admin' }, { user: 0, role: 'member' }, { user: 12, role: 'member' }, { user: 1, role: 'member' }, { user: 7, role: 'member' }],
  3: [{ user: 16, role: 'admin' }, { user: 9, role: 'member' }, { user: 1, role: 'member' }, { user: 13, role: 'member' }],
  4: [{ user: 10, role: 'admin' }, { user: 2, role: 'member' }, { user: 1, role: 'member' }, { user: 13, role: 'member' }, { user: 19, role: 'member' }],
  5: [{ user: 19, role: 'admin' }, { user: 13, role: 'moderator' }, { user: 2, role: 'member' }, { user: 0, role: 'member' }, { user: 1, role: 'member' }, { user: 5, role: 'member' }, { user: 11, role: 'member' }],
};

// Generate random game results for users
function generateResults(userId, daysBack = 14) {
  const results = [];
  const today = new Date();
  const games = ['wordle', 'connections', 'mini', 'bandle', 'catfishing', 'timeguessr', 'strands', 'travle', 'flagle', 'dailydozen'];
  const basePuzzleNumber = 1000;

  for (let i = 0; i < daysBack; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const puzzleNum = basePuzzleNumber + (daysBack - i);

    // Each user plays 3-6 games per day
    const numGames = 3 + Math.floor(Math.random() * 4);
    const playedGames = [...games].sort(() => Math.random() - 0.5).slice(0, numGames);

    for (const gameId of playedGames) {
      const result = generateGameResult(userId, gameId, puzzleNum, dateStr);
      if (result) results.push(result);
    }
  }

  return results;
}

function generateGameResult(userId, gameId, puzzleNumber, date) {
  switch (gameId) {
    case 'wordle': {
      const score = Math.random() < 0.1 ? 7 : 1 + Math.floor(Math.random() * 6);
      const won = score <= 6;
      const isGreat = score <= 3;
      return { userId, gameId, puzzleNumber, playDate: date, rawText: `Wordle ${puzzleNumber} ${won ? score : 'X'}/6`, scoreValue: score, scoreDisplay: `${won ? score : 'X'}/6`, isFailed: !won, isGreat };
    }
    case 'connections': {
      const mistakes = Math.random() < 0.15 ? 4 : Math.floor(Math.random() * 4);
      const won = mistakes < 4;
      const score = won ? 4 - mistakes : 0;
      const achievement = won && mistakes === 0 && Math.random() < 0.1 ? 'reverse_perfect' : null;
      return { userId, gameId, puzzleNumber, playDate: date, rawText: `Connections Puzzle #${puzzleNumber}`, scoreValue: score, scoreDisplay: won ? `${mistakes} mistakes` : 'Failed', isFailed: !won, isGreat: mistakes === 0, achievement };
    }
    case 'mini': {
      const seconds = 20 + Math.floor(Math.random() * 180);
      const isGreat = seconds <= 60;
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      const display = mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `0:${secs.toString().padStart(2, '0')}`;
      return { userId, gameId, puzzleNumber, playDate: date, rawText: `NYT Mini ${display}`, scoreValue: seconds, scoreDisplay: display, isFailed: false, isGreat };
    }
    case 'bandle': {
      const score = Math.random() < 0.1 ? 7 : 1 + Math.floor(Math.random() * 6);
      const won = score <= 6;
      const isGreat = score <= 3;
      return { userId, gameId, puzzleNumber, playDate: date, rawText: `Bandle #${puzzleNumber} ${won ? score : 'X'}/6`, scoreValue: score, scoreDisplay: `${won ? score : 'X'}/6`, isFailed: !won, isGreat };
    }
    case 'catfishing': {
      const score = Math.round((Math.random() * 10) * 2) / 2;
      const isGreat = score >= 8;
      return { userId, gameId, puzzleNumber, playDate: date, rawText: `catfishing.net #${puzzleNumber} - ${score}/10`, scoreValue: score, scoreDisplay: `${score}/10`, isFailed: false, isGreat };
    }
    case 'timeguessr': {
      const score = Math.floor(Math.random() * 50000);
      const isGreat = score >= 40000;
      return { userId, gameId, puzzleNumber, playDate: date, rawText: `TimeGuessr #${puzzleNumber} ${score.toLocaleString()}/50,000`, scoreValue: score, scoreDisplay: `${score.toLocaleString()}`, isFailed: false, isGreat };
    }
    case 'strands': {
      const hints = Math.floor(Math.random() * 5);
      const isGreat = hints === 0;
      return { userId, gameId, puzzleNumber, playDate: date, rawText: `Strands #${puzzleNumber}`, scoreValue: hints, scoreDisplay: `${hints} hints`, isFailed: false, isGreat };
    }
    case 'travle': {
      const extra = Math.floor(Math.random() * 6);
      const isGreat = extra === 0;
      return { userId, gameId, puzzleNumber, playDate: date, rawText: `#travle #${puzzleNumber} +${extra}`, scoreValue: extra, scoreDisplay: `+${extra}`, isFailed: false, isGreat };
    }
    case 'flagle': {
      const score = Math.random() < 0.1 ? 7 : 1 + Math.floor(Math.random() * 6);
      const won = score <= 6;
      return { userId, gameId, puzzleNumber, playDate: date, rawText: `Flagle #${puzzleNumber} ${won ? score : 'X'}/6`, scoreValue: score, scoreDisplay: `${won ? score : 'X'}/6`, isFailed: !won, isGreat: score <= 2 };
    }
    case 'dailydozen': {
      const score = 6 + Math.floor(Math.random() * 7);
      const isGreat = score === 12;
      return { userId, gameId, puzzleNumber, playDate: date, rawText: `Daily Dozen #${puzzleNumber} ${score}/12`, scoreValue: score, scoreDisplay: `${score}/12`, isFailed: false, isGreat };
    }
    default:
      return null;
  }
}

async function seed() {
  console.log('Starting database seeding...');
  console.log('Database URL:', process.env.DATABASE_URL ? '(set)' : '(not set)');

  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if already seeded
    const { rows: existingUsers } = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(existingUsers[0].count) > 0) {
      console.log('Database already has data. Skipping seed.');
      console.log('To re-seed, manually delete data from tables first.');
      await client.query('ROLLBACK');
      return;
    }

    console.log('Creating users...');
    const userIds = [];
    for (const user of dummyUsers) {
      const { rows } = await client.query(
        `INSERT INTO users (username, display_name, avatar_type, avatar_value, avatar_bg)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [user.username, user.displayName, user.avatarType, user.avatarValue, user.avatarBg]
      );
      userIds.push(rows[0].id);
    }
    console.log(`  Created ${userIds.length} users`);

    console.log('Creating groups...');
    const groupIds = [];
    for (const group of dummyGroups) {
      const { rows } = await client.query(
        `INSERT INTO groups (name, description, visibility, join_policy, password_hash, tracked_games, pinned_games, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [group.name, group.description, group.visibility, group.joinPolicy, group.password || null, JSON.stringify(group.trackedGames), JSON.stringify(group.pinnedGames), userIds[group.createdBy]]
      );
      groupIds.push(rows[0].id);
    }
    console.log(`  Created ${groupIds.length} groups`);

    console.log('Creating group memberships...');
    let membershipCount = 0;
    for (const [groupIdxStr, members] of Object.entries(groupMemberships)) {
      const groupIdx = parseInt(groupIdxStr);
      for (const member of members) {
        await client.query(
          `INSERT INTO group_members (group_id, user_id, role)
           VALUES ($1, $2, $3)`,
          [groupIds[groupIdx], userIds[member.user], member.role]
        );
        membershipCount++;
      }
    }
    console.log(`  Created ${membershipCount} memberships`);

    console.log('Generating game results...');
    let resultCount = 0;
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      const daysBack = 7 + Math.floor(Math.random() * 14); // 7-21 days of history
      const results = generateResults(userId, daysBack);

      for (const result of results) {
        await client.query(
          `INSERT INTO game_results (user_id, game_id, puzzle_number, play_date, raw_text, score_value, score_display, is_failed, is_great, achievement)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (user_id, game_id, puzzle_number) DO NOTHING`,
          [userId, result.gameId, result.puzzleNumber, result.playDate, result.rawText, result.scoreValue, result.scoreDisplay, result.isFailed, result.isGreat, result.achievement]
        );
        resultCount++;
      }
    }
    console.log(`  Created ${resultCount} game results`);

    await client.query('COMMIT');
    console.log('Seeding complete!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
