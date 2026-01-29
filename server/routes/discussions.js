const express = require('express');
const Discussion = require('../models/Discussion');
const Group = require('../models/Group');
const { errors, asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// GET /api/groups/:groupId/threads - List threads
router.get('/:groupId/threads', asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.groupId);
  if (!group) {
    throw errors.notFound('Group not found');
  }

  const { limit, offset, includeDaily } = req.query;
  const threads = await Discussion.getThreads(req.params.groupId, {
    limit: Math.min(parseInt(limit) || 50, 100),
    offset: parseInt(offset) || 0,
    includeDaily: includeDaily !== 'false',
  });

  res.json(threads.map(t => Discussion.threadToJSON(t)));
}));

// GET /api/groups/:groupId/threads/daily/:gameId/:date - Get/create daily thread
router.get('/:groupId/threads/daily/:gameId/:date', asyncHandler(async (req, res) => {
  const { groupId, gameId, date } = req.params;
  const { userId } = req.query;

  const group = await Group.findById(groupId);
  if (!group) {
    throw errors.notFound('Group not found');
  }

  const thread = await Discussion.getOrCreateDailyThread(groupId, gameId, date, userId);
  const comments = await Discussion.getComments(thread.id);

  res.json({
    ...Discussion.threadToJSON(thread),
    comments: comments.map(c => Discussion.commentToJSON(c)),
  });
}));

// GET /api/groups/:groupId/threads/:threadId - Get thread with comments
router.get('/:groupId/threads/:threadId', asyncHandler(async (req, res) => {
  const thread = await Discussion.findThreadById(req.params.threadId);
  if (!thread || thread.group_id !== req.params.groupId) {
    throw errors.notFound('Thread not found');
  }

  const { limit, offset } = req.query;
  const comments = await Discussion.getComments(req.params.threadId, {
    limit: Math.min(parseInt(limit) || 100, 500),
    offset: parseInt(offset) || 0,
  });

  res.json({
    ...Discussion.threadToJSON(thread),
    comments: comments.map(c => Discussion.commentToJSON(c)),
  });
}));

// POST /api/groups/:groupId/threads - Create general thread
router.post('/:groupId/threads', asyncHandler(async (req, res) => {
  const { title, createdBy } = req.body;

  if (!title) {
    throw errors.badRequest('title is required');
  }

  const group = await Group.findById(req.params.groupId);
  if (!group) {
    throw errors.notFound('Group not found');
  }

  // TODO: Add auth check - must be a member to create threads

  const thread = await Discussion.createThread(req.params.groupId, { title, createdBy });
  res.status(201).json(Discussion.threadToJSON(thread));
}));

// PATCH /api/groups/:groupId/threads/:threadId - Update thread
router.patch('/:groupId/threads/:threadId', asyncHandler(async (req, res) => {
  const thread = await Discussion.findThreadById(req.params.threadId);
  if (!thread || thread.group_id !== req.params.groupId) {
    throw errors.notFound('Thread not found');
  }

  // TODO: Add auth check - only admins/moderators or thread author

  const updated = await Discussion.updateThread(req.params.threadId, req.body);
  res.json(Discussion.threadToJSON(updated));
}));

// DELETE /api/groups/:groupId/threads/:threadId - Delete thread
router.delete('/:groupId/threads/:threadId', asyncHandler(async (req, res) => {
  const thread = await Discussion.findThreadById(req.params.threadId);
  if (!thread || thread.group_id !== req.params.groupId) {
    throw errors.notFound('Thread not found');
  }

  // TODO: Add auth check - only admins/moderators can delete threads

  await Discussion.deleteThread(req.params.threadId);
  res.status(204).send();
}));

// POST /api/groups/:groupId/threads/:threadId/comments - Add comment
router.post('/:groupId/threads/:threadId/comments', asyncHandler(async (req, res) => {
  const { userId, content, parentId } = req.body;

  if (!content) {
    throw errors.badRequest('content is required');
  }

  const thread = await Discussion.findThreadById(req.params.threadId);
  if (!thread || thread.group_id !== req.params.groupId) {
    throw errors.notFound('Thread not found');
  }

  if (thread.is_locked) {
    throw errors.forbidden('Thread is locked');
  }

  // TODO: Add auth check - must be a member to comment

  // Validate parentId if provided
  if (parentId) {
    const parent = await Discussion.findCommentById(parentId);
    if (!parent || parent.thread_id !== thread.id) {
      throw errors.badRequest('Invalid parent comment');
    }
  }

  const comment = await Discussion.createComment(req.params.threadId, {
    userId,
    content,
    parentId,
  });

  res.status(201).json(Discussion.commentToJSON(comment));
}));

// PATCH /api/groups/:groupId/threads/:threadId/comments/:commentId - Edit comment
router.patch('/:groupId/threads/:threadId/comments/:commentId', asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw errors.badRequest('content is required');
  }

  const comment = await Discussion.findCommentById(req.params.commentId);
  if (!comment || comment.thread_id !== req.params.threadId) {
    throw errors.notFound('Comment not found');
  }

  // TODO: Add auth check - only comment author can edit

  const updated = await Discussion.updateComment(req.params.commentId, content);
  res.json(Discussion.commentToJSON(updated));
}));

// DELETE /api/groups/:groupId/threads/:threadId/comments/:commentId - Delete comment
router.delete('/:groupId/threads/:threadId/comments/:commentId', asyncHandler(async (req, res) => {
  const comment = await Discussion.findCommentById(req.params.commentId);
  if (!comment || comment.thread_id !== req.params.threadId) {
    throw errors.notFound('Comment not found');
  }

  // TODO: Add auth check - only comment author or admins/moderators

  await Discussion.deleteComment(req.params.commentId);
  res.status(204).send();
}));

module.exports = router;
