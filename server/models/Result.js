const { query } = require('../config/database');

const Result = {
  // Find result by ID
  async findById(id) {
    const result = await query(
      `SELECT * FROM game_results WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Find results with filters
  async find({ userId, gameId, puzzleNumber, date, startDate, endDate, limit = 100, offset = 0 }) {
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    if (userId) {
      whereConditions.push(`user_id = $${paramIndex++}`);
      params.push(userId);
    }
    if (gameId) {
      whereConditions.push(`game_id = $${paramIndex++}`);
      params.push(gameId);
    }
    if (puzzleNumber !== undefined) {
      whereConditions.push(`puzzle_number = $${paramIndex++}`);
      params.push(puzzleNumber);
    }
    if (date) {
      whereConditions.push(`play_date = $${paramIndex++}`);
      params.push(date);
    }
    if (startDate) {
      whereConditions.push(`play_date >= $${paramIndex++}`);
      params.push(startDate);
    }
    if (endDate) {
      whereConditions.push(`play_date <= $${paramIndex++}`);
      params.push(endDate);
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    params.push(limit, offset);

    const result = await query(
      `SELECT * FROM game_results
       ${whereClause}
       ORDER BY play_date DESC, created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      params
    );
    return result.rows;
  },

  // Find unique result by user, game, and puzzle number
  async findUnique(userId, gameId, puzzleNumber) {
    const result = await query(
      `SELECT * FROM game_results
       WHERE user_id = $1 AND game_id = $2 AND puzzle_number = $3`,
      [userId, gameId, puzzleNumber]
    );
    return result.rows[0] || null;
  },

  // Get user's results for today
  async findTodayByUser(userId) {
    const result = await query(
      `SELECT * FROM game_results
       WHERE user_id = $1 AND play_date = CURRENT_DATE
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  // Create new result (with upsert behavior)
  async create({ userId, gameId, puzzleNumber, playDate, rawText, scoreValue, scoreDisplay, isFailed = false, isGreat = false, achievement = null, extraData = null }) {
    const result = await query(
      `INSERT INTO game_results
       (user_id, game_id, puzzle_number, play_date, raw_text, score_value, score_display, is_failed, is_great, achievement, extra_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (user_id, game_id, puzzle_number)
       DO UPDATE SET
         raw_text = EXCLUDED.raw_text,
         score_value = EXCLUDED.score_value,
         score_display = EXCLUDED.score_display,
         is_failed = EXCLUDED.is_failed,
         is_great = EXCLUDED.is_great,
         achievement = EXCLUDED.achievement,
         extra_data = EXCLUDED.extra_data
       RETURNING *`,
      [userId, gameId, puzzleNumber, playDate, rawText, scoreValue, scoreDisplay, isFailed, isGreat, achievement, extraData]
    );
    return result.rows[0];
  },

  // Delete result
  async delete(id) {
    const result = await query(
      'DELETE FROM game_results WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rowCount > 0;
  },

  // Delete by user, game, and puzzle
  async deleteByUnique(userId, gameId, puzzleNumber) {
    const result = await query(
      'DELETE FROM game_results WHERE user_id = $1 AND game_id = $2 AND puzzle_number = $3 RETURNING id',
      [userId, gameId, puzzleNumber]
    );
    return result.rowCount > 0;
  },

  // Get histogram data for a user and game
  async getHistogram(userId, gameId) {
    const result = await query(
      `SELECT score_value, score_display, is_failed, achievement, COUNT(*) as count
       FROM game_results
       WHERE user_id = $1 AND game_id = $2
       GROUP BY score_value, score_display, is_failed, achievement
       ORDER BY score_value`,
      [userId, gameId]
    );
    return result.rows;
  },

  // Get user's game stats
  async getUserGameStats(userId, gameId) {
    const result = await query(
      `SELECT
         COUNT(*) as total_plays,
         AVG(score_value) as average_score,
         MIN(score_value) as best_score,
         MAX(score_value) as worst_score,
         COUNT(CASE WHEN is_great THEN 1 END) as great_results,
         COUNT(CASE WHEN is_failed THEN 1 END) as failed_results
       FROM game_results
       WHERE user_id = $1 AND game_id = $2`,
      [userId, gameId]
    );
    return result.rows[0];
  },

  // Get leaderboard for a game on a specific date
  async getLeaderboard(gameId, date, userIds = null) {
    let params = [gameId, date];
    let userFilter = '';

    if (userIds && userIds.length > 0) {
      userFilter = ` AND gr.user_id = ANY($3)`;
      params.push(userIds);
    }

    const result = await query(
      `SELECT gr.*, u.username, u.display_name, u.avatar_type, u.avatar_value, u.avatar_bg
       FROM game_results gr
       JOIN users u ON gr.user_id = u.id
       WHERE gr.game_id = $1 AND gr.play_date = $2${userFilter}
       ORDER BY gr.score_value ASC, gr.created_at ASC`,
      params
    );
    return result.rows;
  },

  // Get historical leaderboard (all-time averages)
  async getHistoricalLeaderboard(gameId, userIds = null, limit = 50) {
    let params = [gameId, limit];
    let userFilter = '';

    if (userIds && userIds.length > 0) {
      userFilter = ` AND gr.user_id = ANY($3)`;
      params.push(userIds);
    }

    const result = await query(
      `SELECT
         gr.user_id,
         u.username,
         u.display_name,
         u.avatar_type,
         u.avatar_value,
         u.avatar_bg,
         AVG(gr.score_value) as average_score,
         COUNT(*) as games_played,
         MIN(gr.score_value) as best_score
       FROM game_results gr
       JOIN users u ON gr.user_id = u.id
       WHERE gr.game_id = $1${userFilter}
       GROUP BY gr.user_id, u.username, u.display_name, u.avatar_type, u.avatar_value, u.avatar_bg
       HAVING COUNT(*) >= 3
       ORDER BY AVG(gr.score_value) ASC
       LIMIT $2`,
      params
    );
    return result.rows;
  },

  // Format result for API response
  toJSON(result) {
    if (!result) return null;
    return {
      id: result.id,
      userId: result.user_id,
      gameId: result.game_id,
      puzzleNumber: result.puzzle_number,
      playDate: result.play_date,
      rawText: result.raw_text,
      scoreValue: parseFloat(result.score_value),
      scoreDisplay: result.score_display,
      isFailed: result.is_failed,
      isGreat: result.is_great,
      achievement: result.achievement,
      extraData: result.extra_data,
      createdAt: result.created_at,
    };
  },
};

module.exports = Result;
