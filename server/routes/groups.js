const express = require('express');
const Group = require('../models/Group');
const Result = require('../models/Result');
const { errors, asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// GET /api/groups - List/search groups
router.get('/', asyncHandler(async (req, res) => {
  const { search, visibility = 'public', limit, offset } = req.query;

  const groups = await Group.search({
    search,
    visibility,
    limit: Math.min(parseInt(limit) || 50, 100),
    offset: parseInt(offset) || 0,
  });

  res.json(groups.map(g => Group.toJSON(g)));
}));

// GET /api/groups/user/:userId - Get groups for a user
router.get('/user/:userId', asyncHandler(async (req, res) => {
  const groups = await Group.findByUser(req.params.userId);
  res.json(groups.map(g => Group.toJSON(g)));
}));

// GET /api/groups/invite/:code - Get group by invite code
router.get('/invite/:code', asyncHandler(async (req, res) => {
  const group = await Group.findByInviteCode(req.params.code);
  if (!group) {
    throw errors.notFound('Invalid invite code');
  }
  res.json(Group.toJSON(group));
}));

// GET /api/groups/:id - Get group by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    throw errors.notFound('Group not found');
  }

  // Get member count
  const members = await Group.getMembers(req.params.id);
  group.member_count = members.length;

  // Check user's role if userId provided
  let userRole = null;
  if (req.query.userId) {
    const membership = await Group.getMembership(req.params.id, req.query.userId);
    userRole = membership?.role || null;
  }

  res.json(Group.toJSON(group, userRole));
}));

// POST /api/groups - Create group
router.post('/', asyncHandler(async (req, res) => {
  const { name, description, visibility, joinPolicy, password, pinnedGames, trackedGames, layoutConfig, createdBy } = req.body;

  if (!name || !createdBy) {
    throw errors.badRequest('name and createdBy are required');
  }

  // Generate invite code for unlisted/private groups
  let inviteCode = null;
  if (visibility === 'unlisted' || visibility === 'private' || joinPolicy === 'invite') {
    inviteCode = await Group.generateInviteCode();
  }

  // Hash password if provided
  // TODO: Use proper password hashing
  const passwordHash = password || null;

  const group = await Group.create({
    name,
    description,
    visibility,
    joinPolicy,
    passwordHash,
    inviteCode,
    pinnedGames: pinnedGames || [],
    trackedGames: trackedGames || [],
    layoutConfig: layoutConfig || [],
    createdBy,
  });

  res.status(201).json(Group.toJSON(group, 'admin'));
}));

// PATCH /api/groups/:id - Update group
router.patch('/:id', asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    throw errors.notFound('Group not found');
  }

  // TODO: Add auth check - only admins can update

  // Handle password update
  const updates = { ...req.body };
  if (updates.password !== undefined) {
    // TODO: Use proper password hashing
    updates.passwordHash = updates.password || null;
    delete updates.password;
  }

  // Generate new invite code if requested
  if (updates.regenerateInviteCode) {
    updates.inviteCode = await Group.generateInviteCode();
    delete updates.regenerateInviteCode;
  }

  const updated = await Group.update(req.params.id, updates);
  res.json(Group.toJSON(updated));
}));

// DELETE /api/groups/:id - Delete group
router.delete('/:id', asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    throw errors.notFound('Group not found');
  }

  // TODO: Add auth check - only admins can delete

  await Group.delete(req.params.id);
  res.status(204).send();
}));

// GET /api/groups/:id/members - Get group members
router.get('/:id/members', asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    throw errors.notFound('Group not found');
  }

  const members = await Group.getMembers(req.params.id);
  res.json(members.map(m => ({
    id: m.id,
    userId: m.user_id,
    role: m.role,
    joinedAt: m.joined_at,
    user: {
      id: m.user_id,
      username: m.username,
      displayName: m.display_name,
      avatar: {
        type: m.avatar_type,
        value: m.avatar_value,
        bg: m.avatar_bg,
      },
    },
  })));
}));

// POST /api/groups/:id/join - Join group
router.post('/:id/join', asyncHandler(async (req, res) => {
  const { userId, password } = req.body;

  if (!userId) {
    throw errors.badRequest('userId is required');
  }

  const group = await Group.findById(req.params.id);
  if (!group) {
    throw errors.notFound('Group not found');
  }

  // Check if already a member
  const existing = await Group.getMembership(req.params.id, userId);
  if (existing) {
    throw errors.conflict('Already a member of this group');
  }

  // Check join policy
  if (group.join_policy === 'invite') {
    throw errors.forbidden('This group is invite-only');
  }

  if (group.join_policy === 'password') {
    // TODO: Use proper password comparison
    if (!password || password !== group.password_hash) {
      throw errors.forbidden('Invalid password');
    }
  }

  const membership = await Group.addMember(req.params.id, userId);
  res.status(201).json({
    id: membership.id,
    userId: membership.user_id,
    role: membership.role,
    joinedAt: membership.joined_at,
  });
}));

// POST /api/groups/:id/leave - Leave group
router.post('/:id/leave', asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    throw errors.badRequest('userId is required');
  }

  const membership = await Group.getMembership(req.params.id, userId);
  if (!membership) {
    throw errors.notFound('Not a member of this group');
  }

  await Group.removeMember(req.params.id, userId);
  res.status(204).send();
}));

// PATCH /api/groups/:id/members/:userId - Update member role
router.patch('/:id/members/:userId', asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!role || !['admin', 'moderator', 'member'].includes(role)) {
    throw errors.badRequest('Valid role is required (admin, moderator, member)');
  }

  // TODO: Add auth check - only admins can change roles

  const membership = await Group.getMembership(req.params.id, req.params.userId);
  if (!membership) {
    throw errors.notFound('Member not found');
  }

  const updated = await Group.updateMemberRole(req.params.id, req.params.userId, role);
  res.json({
    id: updated.id,
    userId: updated.user_id,
    role: updated.role,
    joinedAt: updated.joined_at,
  });
}));

// DELETE /api/groups/:id/members/:userId - Remove member (kick)
router.delete('/:id/members/:userId', asyncHandler(async (req, res) => {
  // TODO: Add auth check - only admins can kick

  const membership = await Group.getMembership(req.params.id, req.params.userId);
  if (!membership) {
    throw errors.notFound('Member not found');
  }

  await Group.removeMember(req.params.id, req.params.userId);
  res.status(204).send();
}));

// GET /api/groups/:id/invites - Get pending invites
router.get('/:id/invites', asyncHandler(async (req, res) => {
  // TODO: Add auth check - only admins can see invites

  const invites = await Group.getInvites(req.params.id);
  res.json(invites.map(i => ({
    id: i.id,
    userId: i.invited_user_id,
    invitedBy: i.invited_by,
    status: i.status,
    createdAt: i.created_at,
    user: {
      id: i.invited_user_id,
      username: i.username,
      displayName: i.display_name,
      avatar: {
        type: i.avatar_type,
        value: i.avatar_value,
        bg: i.avatar_bg,
      },
    },
  })));
}));

// POST /api/groups/:id/invites - Create invite
router.post('/:id/invites', asyncHandler(async (req, res) => {
  const { userId, invitedBy } = req.body;

  if (!userId || !invitedBy) {
    throw errors.badRequest('userId and invitedBy are required');
  }

  // TODO: Add auth check - only admins/moderators can invite

  // Check if already a member
  const existing = await Group.getMembership(req.params.id, userId);
  if (existing) {
    throw errors.conflict('User is already a member');
  }

  const invite = await Group.createInvite(req.params.id, userId, invitedBy);
  res.status(201).json({
    id: invite.id,
    groupId: invite.group_id,
    userId: invite.invited_user_id,
    invitedBy: invite.invited_by,
    status: invite.status,
    createdAt: invite.created_at,
  });
}));

// GET /api/groups/invites/user/:userId - Get user's pending invites
router.get('/invites/user/:userId', asyncHandler(async (req, res) => {
  const invites = await Group.getUserInvites(req.params.userId);
  res.json(invites.map(i => ({
    id: i.id,
    groupId: i.group_id,
    groupName: i.group_name,
    groupDescription: i.group_description,
    invitedBy: i.invited_by,
    inviterUsername: i.inviter_username,
    inviterDisplayName: i.inviter_display_name,
    status: i.status,
    createdAt: i.created_at,
  })));
}));

// POST /api/groups/:id/invites/:userId/respond - Accept/decline invite
router.post('/:id/invites/:userId/respond', asyncHandler(async (req, res) => {
  const { accept } = req.body;

  if (accept === undefined) {
    throw errors.badRequest('accept is required (true/false)');
  }

  await Group.respondToInvite(req.params.id, req.params.userId, accept);
  res.status(204).send();
}));

// GET /api/groups/:id/leaderboard - Get group leaderboard
router.get('/:id/leaderboard', asyncHandler(async (req, res) => {
  const { type = 'daily', gameId, date } = req.query;

  const group = await Group.findById(req.params.id);
  if (!group) {
    throw errors.notFound('Group not found');
  }

  // Get member IDs
  const memberIds = await Group.getMemberIds(req.params.id);

  if (!gameId) {
    throw errors.badRequest('gameId is required');
  }

  if (type === 'daily') {
    if (!date) {
      throw errors.badRequest('date is required for daily leaderboard');
    }
    const results = await Result.getLeaderboard(gameId, date, memberIds);
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
  } else {
    const results = await Result.getHistoricalLeaderboard(gameId, memberIds);
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
  }
}));

module.exports = router;
