const express = require('express');
const User = require('../models/User');
const { errors, asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// GET /api/users - List all users
router.get('/', asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 100, 500);
  const users = await User.findAll(limit);
  res.json(users.map(u => User.toJSON(u)));
}));

// GET /api/users/:id - Get user by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw errors.notFound('User not found');
  }
  res.json(User.toJSON(user));
}));

// GET /api/users/username/:username - Get user by username
router.get('/username/:username', asyncHandler(async (req, res) => {
  const user = await User.findByUsername(req.params.username);
  if (!user) {
    throw errors.notFound('User not found');
  }
  res.json(User.toJSON(user));
}));

// POST /api/users - Create user
router.post('/', asyncHandler(async (req, res) => {
  const { username, displayName, email, avatarType, avatarValue, avatarBg } = req.body;

  if (!username || !displayName) {
    throw errors.badRequest('Username and displayName are required');
  }

  // Check username availability
  const isAvailable = await User.isUsernameAvailable(username);
  if (!isAvailable) {
    throw errors.conflict('Username already taken');
  }

  const user = await User.create({
    username,
    displayName,
    email,
    avatarType,
    avatarValue,
    avatarBg,
  });

  res.status(201).json(User.toJSON(user));
}));

// PATCH /api/users/:id - Update user
router.patch('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw errors.notFound('User not found');
  }

  // TODO: Add auth check - user can only update their own profile

  const updated = await User.update(req.params.id, req.body);
  res.json(User.toJSON(updated));
}));

// DELETE /api/users/:id - Delete user
router.delete('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw errors.notFound('User not found');
  }

  // TODO: Add auth check - user can only delete their own account

  await User.delete(req.params.id);
  res.status(204).send();
}));

// GET /api/users/:id/check-username - Check if username is available
router.get('/:id/check-username', asyncHandler(async (req, res) => {
  const { username } = req.query;
  if (!username) {
    throw errors.badRequest('Username query parameter required');
  }

  const isAvailable = await User.isUsernameAvailable(username, req.params.id);
  res.json({ available: isAvailable });
}));

module.exports = router;
