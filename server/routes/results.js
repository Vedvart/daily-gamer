const express = require('express');
const Result = require('../models/Result');
const { errors, asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// GET /api/results - List results with filters
router.get('/', asyncHandler(async (req, res) => {
  const { userId, gameId, puzzleNumber, date, startDate, endDate, limit, offset } = req.query;

  const results = await Result.find({
    userId,
    gameId,
    puzzleNumber: puzzleNumber ? parseInt(puzzleNumber) : undefined,
    date,
    startDate,
    endDate,
    limit: Math.min(parseInt(limit) || 100, 500),
    offset: parseInt(offset) || 0,
  });

  res.json(results.map(r => Result.toJSON(r)));
}));

// GET /api/results/today/:userId - Get user's results for today
router.get('/today/:userId', asyncHandler(async (req, res) => {
  const results = await Result.findTodayByUser(req.params.userId);
  res.json(results.map(r => Result.toJSON(r)));
}));

// GET /api/results/histogram/:userId/:gameId - Get histogram data
router.get('/histogram/:userId/:gameId', asyncHandler(async (req, res) => {
  const { userId, gameId } = req.params;
  const histogramData = await Result.getHistogram(userId, gameId);
  res.json(histogramData);
}));

// GET /api/results/stats/:userId/:gameId - Get user's game stats
router.get('/stats/:userId/:gameId', asyncHandler(async (req, res) => {
  const { userId, gameId } = req.params;
  const stats = await Result.getUserGameStats(userId, gameId);
  res.json({
    totalPlays: parseInt(stats.total_plays),
    averageScore: stats.average_score ? parseFloat(stats.average_score) : null,
    bestScore: stats.best_score ? parseFloat(stats.best_score) : null,
    worstScore: stats.worst_score ? parseFloat(stats.worst_score) : null,
    greatResults: parseInt(stats.great_results),
    failedResults: parseInt(stats.failed_results),
  });
}));

// GET /api/results/leaderboard - Get leaderboard for a game
router.get('/leaderboard', asyncHandler(async (req, res) => {
  const { gameId, date, userIds } = req.query;

  if (!gameId || !date) {
    throw errors.badRequest('gameId and date are required');
  }

  const userIdArray = userIds ? userIds.split(',') : null;
  const results = await Result.getLeaderboard(gameId, date, userIdArray);

  res.json(results.map(r => ({
    ...Result.toJSON(r),
    user: {
      id: r.user_id,
      username: r.username,
      displayName: r.display_name,
      avatar: {
        type: r.avatar_type,
        value: r.avatar_value,
        bg: r.avatar_bg,
      },
    },
  })));
}));

// GET /api/results/leaderboard/historical - Get all-time leaderboard
router.get('/leaderboard/historical', asyncHandler(async (req, res) => {
  const { gameId, userIds, limit } = req.query;

  if (!gameId) {
    throw errors.badRequest('gameId is required');
  }

  const userIdArray = userIds ? userIds.split(',') : null;
  const results = await Result.getHistoricalLeaderboard(
    gameId,
    userIdArray,
    Math.min(parseInt(limit) || 50, 100)
  );

  res.json(results.map(r => ({
    userId: r.user_id,
    username: r.username,
    displayName: r.display_name,
    avatar: {
      type: r.avatar_type,
      value: r.avatar_value,
      bg: r.avatar_bg,
    },
    averageScore: parseFloat(r.average_score),
    gamesPlayed: parseInt(r.games_played),
    bestScore: parseFloat(r.best_score),
  })));
}));

// GET /api/results/:id - Get result by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const result = await Result.findById(req.params.id);
  if (!result) {
    throw errors.notFound('Result not found');
  }
  res.json(Result.toJSON(result));
}));

// POST /api/results - Create or update result
router.post('/', asyncHandler(async (req, res) => {
  const { userId, gameId, puzzleNumber, playDate, rawText, scoreValue, scoreDisplay, isFailed, isGreat, achievement, extraData } = req.body;

  if (!userId || !gameId || puzzleNumber === undefined || !playDate || !rawText) {
    throw errors.badRequest('userId, gameId, puzzleNumber, playDate, and rawText are required');
  }

  // TODO: Add auth check - user can only add results for themselves

  const result = await Result.create({
    userId,
    gameId,
    puzzleNumber,
    playDate,
    rawText,
    scoreValue,
    scoreDisplay,
    isFailed,
    isGreat,
    achievement,
    extraData,
  });

  res.status(201).json(Result.toJSON(result));
}));

// DELETE /api/results/:id - Delete result by ID
router.delete('/:id', asyncHandler(async (req, res) => {
  const result = await Result.findById(req.params.id);
  if (!result) {
    throw errors.notFound('Result not found');
  }

  // TODO: Add auth check - user can only delete their own results

  await Result.delete(req.params.id);
  res.status(204).send();
}));

// DELETE /api/results/:userId/:gameId/:puzzleNumber - Delete by unique key
router.delete('/:userId/:gameId/:puzzleNumber', asyncHandler(async (req, res) => {
  const { userId, gameId, puzzleNumber } = req.params;

  // TODO: Add auth check - user can only delete their own results

  const deleted = await Result.deleteByUnique(userId, gameId, parseInt(puzzleNumber));
  if (!deleted) {
    throw errors.notFound('Result not found');
  }

  res.status(204).send();
}));

module.exports = router;
